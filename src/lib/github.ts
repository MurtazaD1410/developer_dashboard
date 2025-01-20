import { db } from "@/server/db";
import { Octokit } from "octokit";

import { aiSummarizeCommit } from "./gemini";
import {
  type GitHubPullRequest,
  type GitHubIssue,
  type GitHubRepository,
  type GitHubCommit,
} from "@/types/types";

export const octokit = new Octokit({
  // auth: process.env.GITHUB_TOKEN,
  auth: "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",
});

// ! REPOSITORY SECTION

interface requestProps {
  projectId: string;
  page: number;
  limit: number;
}

async function fetchProjectGithubUrl(projectId: string) {
  const project = await db.project.findUnique({
    where: {
      id: projectId,
    },
    select: {
      githubUrl: true,
    },
  });

  if (!project?.githubUrl) {
    throw new Error("Project has no GitHub Url");
  }

  return { project, githubUrl: project.githubUrl };
}

export const getRepository = async (
  projectId: string,
): Promise<GitHubRepository> => {
  const { githubUrl } = await fetchProjectGithubUrl(projectId);

  const [owner, repo] = githubUrl.split("/").slice(-2);

  if (!owner || !repo) {
    throw new Error("Invalid GitHub Url");
  }

  const { data: repoData } = await octokit.rest.repos.get({
    owner,
    repo,
  });

  return {
    id: repoData.id,
    name: repoData.name,
    private: repoData.private,
    owner: {
      id: repoData.owner.id,
      userName: repoData.owner.login,
      userAvatar: repoData.owner.avatar_url,
    },
    description: repoData.description ?? "",
    createdAt: new Date(repoData.created_at),
    updatedAt: new Date(repoData.updated_at),
    topics: repoData.topics ?? [],
    openIssues: repoData.open_issues_count,
    defaultBranch: repoData.default_branch,
  };
};

// ! COMMITS SECTION

// export const getCommitHashes = async (
//   githubUrl: string,
// ): Promise<GitHubCommit[]> => {
//   const [owner, repo] = githubUrl.split("/").slice(-2);

//   if (!owner || !repo) {
//     throw new Error("Invalid GitHub Url");
//   }

//   const { data } = await octokit.rest.repos.listCommits({
//     owner,
//     repo,
//     per_page: 15,
//   });

//   return data.map((commit) => ({
//     sha: commit.sha,
//     author: {
//       id: commit.author?.id,
//       userAvatar: commit.author?.avatar_url,
//       userName: commit.author?.login,
//     },
//     commitDate: commit.commit.author?.date
//       ? new Date(commit.commit.author?.date)
//       : null,
//     message: commit.commit.message ?? null,
//     summary: "",
//   }));
// };

// export const pollCommits = async (projectId: string) => {
//   const { githubUrl } = await fetchProjectGithubUrl(projectId);

//   const commitHashes = await getCommitHashes(githubUrl);

//   const unprocessedCommits = await filterUnprocessedCommits(
//     projectId,
//     commitHashes,
//   );

//   const summaryResponses = await Promise.allSettled(
//     unprocessedCommits.map((commit) =>
//       summarizeCommit(githubUrl, commit.commitHash),
//     ),
//   );

//   const summaries = summaryResponses.map((response) => {
//     if (response.status == "fulfilled") {
//       return response.value as string;
//     }
//     return "";
//   });

//   const commits = await db.commit.createMany({
//     data: summaries.map((summary, index) => {
//       return {
//         projectId: projectId,
//         commitHash: unprocessedCommits[index]!.commitHash,
//         commitAuthorAvatar: unprocessedCommits[index]!.commitAuthorAvatar,
//         commitAuthorName: unprocessedCommits[index]!.commitAuthorName,
//         commitDate: unprocessedCommits[index]!.commitDate,
//         commitMessage: unprocessedCommits[index]!.commitMessage,
//         summary: summary,
//       };
//     }),
//   });

//   return commits;
// };

// async function summarizeCommit(githubUrl: string, commitHash: string) {
//   const [owner, repo] = githubUrl.split("/").slice(-2);

//   if (!owner || !repo) {
//     throw new Error("Invalid GitHub Url");
//   }

//   const { data } = await octokit.rest.repos.getCommit({
//     owner,
//     repo,
//     ref: commitHash,
//     mediaType: {
//       format: "diff",
//     },
//   });

//   return (await aiSummarizeCommit(JSON.stringify(data))) || "";
// }

// async function filterUnprocessedCommits(
//   projectId: string,
//   commitHashes: any[],
// ) {
//   const processedCommits = await db.commit.findMany({
//     where: { projectId },
//   });

//   const unprocessedCommits = commitHashes.filter(
//     (commit) =>
//       !processedCommits.some(
//         (processedCommit) => processedCommit.commitHash === commit.commitHash,
//       ),
//   );

//   return unprocessedCommits;
// }

export const getCommits = async ({
  projectId,
  page,
  limit,
}: requestProps): Promise<GitHubCommit[]> => {
  const { githubUrl } = await fetchProjectGithubUrl(projectId);

  const [owner, repo] = githubUrl.split("/").slice(-2);

  if (!owner || !repo) {
    throw new Error("Invalid GitHub Url");
  }

  // Step 1: Get commits from GitHub
  const { data: commits } = await octokit.rest.repos.listCommits({
    owner,
    repo,
    per_page: limit,
    page,
  });

  // Map GitHub commits to the desired structure
  const commitHashes: Omit<GitHubCommit, "summary">[] = commits.map(
    (commit) => ({
      sha: commit.sha,
      author: {
        id: commit.author?.id,
        userAvatar: commit.author?.avatar_url,
        userName: commit.author?.login,
      },
      commitDate: commit.commit.author?.date
        ? new Date(commit.commit.author?.date)
        : null,
      message: commit.commit.message,
    }),
  );

  // Step 2: Fetch existing commits from the database
  const processedCommits = await db.commit.findMany({
    where: { projectId },
  });

  // Step 3: Identify unprocessed commits
  const unprocessedCommits = commitHashes.filter(
    (commit) =>
      !processedCommits.some(
        (processedCommit) => processedCommit.sha === commit.sha,
      ),
  );

  // Step 4: Summarize unprocessed commits
  const summaries = await Promise.allSettled(
    unprocessedCommits.map(async (commit) => {
      const { data } = await octokit.rest.repos.getCommit({
        owner,
        repo,
        ref: commit.sha,
        mediaType: { format: "diff" },
      });

      return {
        commitHash: commit.sha,
        summary: await aiSummarizeCommit(JSON.stringify(data)),
      };
    }),
  );

  // Filter successful summaries
  const summarizedCommits = summaries
    .filter((response) => response.status === "fulfilled")
    .map(
      (response) =>
        (
          response as PromiseFulfilledResult<{
            commitHash: string;
            summary: string;
          }>
        ).value,
    );

  // Step 5: Save new summaries to the database
  if (summarizedCommits.length > 0) {
    await db.commit.createMany({
      data: summarizedCommits.map((summary) => ({
        projectId,
        sha: summary.commitHash,
        summary: summary.summary,
      })),
    });
  }

  // Step 6: Merge summaries with all commits
  const allCommits = commitHashes.map((commit) => {
    const dbCommit = processedCommits.find((c) => c.sha === commit.sha);
    const newSummary = summarizedCommits.find(
      (s) => s.commitHash === commit.sha,
    )?.summary;

    return {
      ...commit,
      summary: dbCommit?.summary || newSummary || "",
    };
  });

  return allCommits;
};

// ! ISSUES SECTION

export const getIssues = async ({
  projectId,
  page,
  limit,
}: requestProps): Promise<{
  issues: GitHubIssue[];
  totalPages: number;
}> => {
  const { githubUrl } = await fetchProjectGithubUrl(projectId);

  const [owner, repo] = githubUrl.split("/").slice(-2);

  if (!owner || !repo) {
    throw new Error("Invalid GitHub Url");
  }

  const { data, headers } = await octokit.rest.issues.listForRepo({
    owner,
    repo,
    state: "all",
    page,
    per_page: limit,
    sort: "created",
    direction: "desc",
  });

  const linkHeader = headers.link;
  let totalPages = 1;

  if (linkHeader) {
    const links = linkHeader.split(",");
    const lastLink = links.find((link) => link.includes('rel="last"'));
    if (lastLink) {
      const pageMatch = lastLink.match(/&page=(\d+)/);
      if (pageMatch && pageMatch[1]) {
        totalPages = parseInt(pageMatch[1]);
      }
    }
  }

  const formattedIssues = data.map((issue) => ({
    id: issue.id,
    number: issue.number,
    state: issue.state,
    title: issue.title,
    description: issue.body ?? null,
    creator: {
      id: issue.user?.id,
      userName: issue.user?.login,
      userAvatar: issue.user?.avatar_url,
    },
    createdAt: new Date(issue.created_at),
    assignees:
      issue.assignees?.map((assignee) => ({
        id: assignee.id,
        userName: assignee.login,
        userAvatar: assignee.avatar_url,
      })) ?? null,
    comments: issue.comments,
    closedBy: issue.closed_by
      ? {
          id: issue.closed_by.id,
          userAvatar: issue.closed_by.avatar_url,
          userName: issue.closed_by.login,
        }
      : null,
    closedAt: issue.closed_at ? new Date(issue.closed_at) : null,
    label:
      issue.labels.map((label) => {
        if (typeof label === "string") {
          return { id: null, name: label, color: null };
        } else {
          return {
            id: label.id,
            name: label.name,
            color: label.color ?? null,
          };
        }
      }) ?? null,
  }));

  return {
    issues: formattedIssues,
    totalPages,
  };
};

// ! PULLS SECTION

// export const getPullRequests = async ({
//   projectId,
//   page,
//   limit,
// }: requestProps): Promise<{
//   prs: GitHubPullRequest[];
//   totalPages: number;
// }> => {
//   const { githubUrl } = await fetchProjectGithubUrl(projectId);

//   const [owner, repo] = githubUrl.split("/").slice(-2);

//   if (!owner || !repo) {
//     throw new Error("Invalid GitHub Url");
//   }

//   const { data, headers } = await octokit.rest.pulls.list({
//     owner,
//     repo,
//     state: "all",
//     page,
//     per_page: limit,
//     sort: "created",
//     direction: "desc",
//   });

//   const linkHeader = headers.link;
//   let totalPages = 1;

//   if (linkHeader) {
//     const links = linkHeader.split(",");
//     const lastLink = links.find((link) => link.includes('rel="last"'));
//     if (lastLink) {
//       const pageMatch = lastLink.match(/&page=(\d+)/);
//       if (pageMatch && pageMatch[1]) {
//         totalPages = parseInt(pageMatch[1]);
//       }
//     }
//   }

//   const formattedPrs = data.map((pr) => ({
//     id: pr.id,
//     number: pr.number,
//     title: pr.title,
//     state: pr.state,
//     headRef: pr.head.ref,
//     baseRef: pr.base.ref,
//     description: pr.body ?? null,
//     creator: {
//       id: pr.user?.id,
//       userName: pr.user?.login,
//       userAvatar: pr.user?.avatar_url,
//     },
//     createdAt: new Date(pr.created_at),
//     mergedAt: pr.merged_at ? new Date(pr.merged_at) : null,
//     label:
//       pr.labels.map((label) => {
//         if (typeof label === "string") {
//           return { id: null, name: label, color: null };
//         } else {
//           return {
//             id: label.id,
//             name: label.name,
//             color: label.color ?? null,
//           };
//         }
//       }) ?? null,
//     assignees:
//       pr.assignees?.map((assignee) => ({
//         id: assignee.id,
//         userName: assignee.login,
//         userAvatar: assignee.avatar_url,
//       })) ?? null,
//     reviewers:
//       pr.requested_reviewers?.map((reviewer) => ({
//         id: reviewer.id,
//         userName: reviewer.login,
//         userAvatar: reviewer.avatar_url,
//       })) ?? null,
//     closedAt: pr.closed_at ? new Date(pr.closed_at) : null,
//   }));

//   return {
//     prs: formattedPrs,
//     totalPages,
//   };
// };

export const getPullRequests = async ({
  projectId,
  page,
  limit,
}: requestProps): Promise<{
  prs: GitHubPullRequest[];
  totalPages: number;
}> => {
  const { githubUrl } = await fetchProjectGithubUrl(projectId);

  const [owner, repo] = githubUrl.split("/").slice(-2);

  if (!owner || !repo) {
    throw new Error("Invalid GitHub Url");
  }

  // First get the PR list
  const { data, headers } = await octokit.rest.pulls.list({
    owner,
    repo,
    state: "all",
    page,
    per_page: limit,
    sort: "created",
    direction: "desc",
  });

  // Get detailed PR data including comments and review data
  const detailedPRs = await Promise.all(
    data.map(async (pr) => {
      // Get PR details including comments count
      const { data: prDetails } = await octokit.rest.pulls.get({
        owner,
        repo,
        pull_number: pr.number,
      });

      // Get review comments count
      const { data: reviewComments } =
        await octokit.rest.pulls.listReviewComments({
          owner,
          repo,
          pull_number: pr.number,
        });

      return {
        prData: pr,
        details: prDetails,
        reviewCommentsCount: reviewComments.length,
      };
    }),
  );

  const linkHeader = headers.link;
  let totalPages = 1;

  if (linkHeader) {
    const links = linkHeader.split(",");
    const lastLink = links.find((link) => link.includes('rel="last"'));
    if (lastLink) {
      const pageMatch = lastLink.match(/&page=(\d+)/);
      if (pageMatch && pageMatch[1]) {
        totalPages = parseInt(pageMatch[1]);
      }
    }
  }

  const formattedPrs = detailedPRs.map(
    ({ prData: pr, details, reviewCommentsCount }) => ({
      id: pr.id,
      number: pr.number,
      title: pr.title,
      state: pr.state,
      headRef: pr.head.ref,
      baseRef: pr.base.ref,
      description: pr.body ?? null,
      creator: {
        id: pr.user?.id,
        userName: pr.user?.login,
        userAvatar: pr.user?.avatar_url,
      },
      createdAt: new Date(pr.created_at),
      mergedAt: pr.merged_at ? new Date(pr.merged_at) : null,
      label:
        pr.labels.map((label) => {
          if (typeof label === "string") {
            return { id: null, name: label, color: null };
          } else {
            return {
              id: label.id,
              name: label.name,
              color: label.color ?? null,
            };
          }
        }) ?? null,
      assignees:
        pr.assignees?.map((assignee) => ({
          id: assignee.id,
          userName: assignee.login,
          userAvatar: assignee.avatar_url,
        })) ?? null,
      reviewers:
        pr.requested_reviewers?.map((reviewer) => ({
          id: reviewer.id,
          userName: reviewer.login,
          userAvatar: reviewer.avatar_url,
        })) ?? null,
      closedAt: pr.closed_at ? new Date(pr.closed_at) : null,
      // Added fields
      commentsCount: details.comments,
      reviewCommentsCount,
      additions: details.additions,
      deletions: details.deletions,
      changedFiles: details.changed_files,
      draft: details.draft,
      mergeable: details.mergeable,
      autoMerge: details.auto_merge,
      maintainerCanModify: details.maintainer_can_modify,
    }),
  );

  return {
    prs: formattedPrs,
    totalPages,
  };
};
