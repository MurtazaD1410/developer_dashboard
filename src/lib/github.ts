import { db } from "@/server/db";
import { Octokit } from "octokit";
import axios from "axios";
import { aiSummarizeCommit } from "./gemini";
import crypto from "crypto";
import stableStringify from "fast-json-stable-stringify";

export const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

// ! REPOSITORY SECTION

type RepositoryOwner = {
  userName: string;
  userAvatar: string;
  userUsername: string;
};

type RepositoryResponse = {
  repoId: string;
  repoName: string;
  repoPrivate: boolean;
  repoOwner: RepositoryOwner;
  repoDescription: string;
  repoCreatedAt: string;
  repoUpdatedAt: string;
  repoTopics: string[];
  repoOpenIssues: number;
  repoDefaultBranch: string;
  hash?: string;
};

export const getRepository = async (
  githubUrl: string,
): Promise<RepositoryResponse> => {
  const [owner, repo] = githubUrl.split("/").slice(-2);

  if (!owner || !repo) {
    throw new Error("Invalid GitHub Url");
  }

  const { data: repoData } = await octokit.rest.repos.get({
    owner,
    repo,
  });

  return {
    repoId: String(repoData.id),
    repoName: repoData.name,
    repoPrivate: repoData.private,
    repoOwner: {
      userAvatar: repoData.owner.avatar_url,
      userUsername: repoData.owner.login,
      userName: repoData.owner.login,
    },
    repoDescription: repoData.description ?? "",
    repoCreatedAt: repoData.created_at,
    repoUpdatedAt: repoData.updated_at,
    repoTopics: repoData.topics ?? [],
    repoOpenIssues: repoData.open_issues_count,
    repoDefaultBranch: repoData.default_branch,
  };
};

export const pollRepository = async (projectId: string) => {
  const { githubUrl } = await fetchProjectGithubUrl(projectId);

  // Fetch issues from GitHub
  const repository = await getRepository(githubUrl);

  const existingRepository = await db.repository.findFirst({
    where: { projectId },
  });

  const existingHash = new Set(existingRepository?.hash);

  const hash = computeRepoHash(repository);

  let unprocessedRepo;
  if (!existingHash.has(hash)) {
    unprocessedRepo = repository;
  }

  if (unprocessedRepo) {
    try {
      // Create or fetch the owner
      const owner = await db.gitHubUserProfile.upsert({
        where: { userUsername: repository.repoOwner.userUsername },
        update: {
          userName: repository.repoOwner.userName,
          userAvatar: repository.repoOwner.userAvatar,
        },
        create: {
          userName: repository.repoOwner.userName,
          userAvatar: repository.repoOwner.userAvatar,
          userUsername: repository.repoOwner.userUsername,
        },
      });

      // Compute hash once
      const hash = repository.hash ?? computeRepoHash(repository);

      const updateData: any = {
        projectId: projectId,
        repoName: repository.repoName,
        repoPrivate: repository.repoPrivate,
        repoOwnerId: owner.id,
        repoDescription: repository.repoDescription,
        repoCreatedAt: repository.repoCreatedAt,
        repoUpdatedAt: repository.repoUpdatedAt,
        repoTopics: repository.repoTopics,
        repoOpenIssues: repository.repoOpenIssues,
        repoDefaultBranch: repository.repoDefaultBranch,
        hash,
      };

      const createData: any = {
        projectId: projectId,
        repoId: repository.repoId,
        repoName: repository.repoName,
        repoPrivate: repository.repoPrivate,
        repoOwnerId: owner.id,
        repoDescription: repository.repoDescription,
        repoUpdatedAt: repository.repoUpdatedAt,
        repoCreatedAt: repository.repoCreatedAt,
        repoTopics: repository.repoTopics,
        repoOpenIssues: repository.repoOpenIssues,
        repoDefaultBranch: repository.repoDefaultBranch,
        hash,
      };

      // Upsert the repo
      await db.repository.upsert({
        where: { repoId: repository.repoId },
        update: updateData,
        create: createData,
      });
    } catch (error) {
      console.error(
        `Failed to process repository ${repository.repoId}:`,
        error,
      );
    }
  }

  return { message: "Repo processed successfully" };
};

export const computeRepoHash = (repository: RepositoryResponse) => {
  const serialized = stableStringify(repository);
  return crypto.createHash("sha256").update(serialized).digest("hex");
};

// ! COMMITS SECTION

type CommitResponse = {
  commitMessage: string;
  commitHash: string;
  commitAuthorName: string;
  commitAuthorAvatar: string;
  commitDate: string;
};

export const getCommitHashes = async (
  githubUrl: string,
): Promise<CommitResponse[]> => {
  const [owner, repo] = githubUrl.split("/").slice(-2);

  if (!owner || !repo) {
    throw new Error("Invalid GitHub Url");
  }

  const { data } = await octokit.rest.repos.listCommits({
    owner,
    repo,
  });

  const sortedCommits = data.sort(
    (a: any, b: any) =>
      new Date(b.commit.author.date).getTime() -
      new Date(a.commit.author.date).getTime(),
  );

  return sortedCommits.slice(0, 15).map((commit) => ({
    commitHash: commit.sha as string,
    commitAuthorAvatar: commit.author?.avatar_url ?? "",
    commitAuthorName: commit.commit.author?.name ?? "",
    commitDate: commit.commit.author?.date ?? "",
    commitMessage: commit.commit.message ?? "",
  }));
};

export const pollCommits = async (projectId: string) => {
  const { githubUrl } = await fetchProjectGithubUrl(projectId);

  const commitHashes = await getCommitHashes(githubUrl);

  const unprocessedCommits = await filterUnprocessedCommits(
    projectId,
    commitHashes,
  );

  const summaryResponses = await Promise.allSettled(
    unprocessedCommits.map((commit) =>
      summarizeCommit(githubUrl, commit.commitHash),
    ),
  );

  const summaries = summaryResponses.map((response) => {
    if (response.status == "fulfilled") {
      return response.value as string;
    }
    return "";
  });

  const commits = await db.commit.createMany({
    data: summaries.map((summary, index) => {
      return {
        projectId: projectId,
        commitHash: unprocessedCommits[index]!.commitHash,
        commitAuthorAvatar: unprocessedCommits[index]!.commitAuthorAvatar,
        commitAuthorName: unprocessedCommits[index]!.commitAuthorName,
        commitDate: unprocessedCommits[index]!.commitDate,
        commitMessage: unprocessedCommits[index]!.commitMessage,
        summary: summary,
      };
    }),
  });

  return commits;
};

async function summarizeCommit(githubUrl: string, commitHash: string) {
  // get diff and pass it to the summarize function
  // const { data } = await axios.get(`${githubUrl}/commit/${commitHash}.diff`, {
  //   headers: {
  //     Accept: "application/vnd.github.v3.diff",
  //     Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
  //   },
  // });
  const [owner, repo] = githubUrl.split("/").slice(-2);

  if (!owner || !repo) {
    throw new Error("Invalid GitHub Url");
  }

  const { data } = await octokit.rest.repos.getCommit({
    owner,
    repo,
    ref: commitHash,
    mediaType: {
      format: "diff",
    },
  });

  return (await aiSummarizeCommit(JSON.stringify(data))) || "";
}

async function filterUnprocessedCommits(
  projectId: string,
  commitHashes: CommitResponse[],
) {
  const processedCommits = await db.commit.findMany({
    where: { projectId },
  });

  const unprocessedCommits = commitHashes.filter(
    (commit) =>
      !processedCommits.some(
        (processedCommit) => processedCommit.commitHash === commit.commitHash,
      ),
  );

  return unprocessedCommits;
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

// ! ISSUES SECTION
type GitHubUserProfile = {
  userName: string;
  userAvatar: string;
  userUsername: string;
};

type IssueOrPrLabel = {
  name: string;
  color: string | null;
};

type IssueResponse = {
  issueId: string;
  issueNumber: number;
  issueState: string;
  issueTitle: string;
  issueDescription: string;
  issueCreator: GitHubUserProfile;
  issueCreatedAt: string;
  issueAssigned: GitHubUserProfile[] | null;
  issueAssignedIds: String[];
  issueLabel: IssueOrPrLabel[] | null;
  issueClosedBy: GitHubUserProfile;
  issueClosedAt: string;
  hash?: string;
};

export const getIssues = async (
  githubUrl: string,
): Promise<IssueResponse[]> => {
  const [owner, repo] = githubUrl.split("/").slice(-2);

  if (!owner || !repo) {
    throw new Error("Invalid GitHub Url");
  }

  const { data } = await octokit.rest.issues.listForRepo({
    owner,
    repo,
    state: "all",
  });

  const sortedIssues = data.sort(
    (a: any, b: any) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  return sortedIssues.slice(0, 50).map((issue) => ({
    issueId: String(issue.id),
    issueNumber: issue.number,
    issueState: issue.state,
    issueTitle: issue.title,
    issueDescription: issue.body ?? "",
    issueCreator: {
      userAvatar: issue.user?.avatar_url ?? "",
      userName: issue.user?.login ?? "", // GitHub API does not provide `name` directly in the user object
      userUsername: issue.user?.login ?? "",
    },
    issueCreatedAt: issue.created_at,
    issueAssigned:
      issue.assignees?.map((assignee) => ({
        userName: assignee.avatar_url,
        userAvatar: assignee.login ?? "", // GitHub API does not provide `name` directly
        userUsername: assignee.login,
      })) ?? null,
    issueAssignedIds: issue.assignees?.map((assignee) => assignee.login) ?? [],
    issueClosedBy: issue.closed_by
      ? {
          userAvatar: issue.closed_by.avatar_url ?? "",
          userName: issue.closed_by.login ?? "", // Same as above
          userUsername: issue.closed_by.login ?? "",
        }
      : {
          userAvatar: "",
          userName: "",
          userUsername: "",
        },
    issueClosedAt: issue.closed_at ?? "",
    issueLabel:
      issue.labels.map((label) => {
        if (typeof label === "string") {
          return { name: label, color: null }; // Handle string labels
        } else {
          return {
            name: label.name ?? "",
            color: label.color ?? null,
          };
        }
      }) ?? [],
  }));
};

export const pollIssues = async (projectId: string) => {
  const { githubUrl } = await fetchProjectGithubUrl(projectId);

  // Fetch issues from GitHub
  const issues = await getIssues(githubUrl);

  // Filter unprocessed issues
  const unprocessedIssues = await filterUnprocessedIssues(projectId, issues);

  for (const issue of unprocessedIssues) {
    try {
      // Create or fetch the creator
      const creator = await db.gitHubUserProfile.upsert({
        where: { userUsername: issue.issueCreator.userUsername },
        update: {
          userName: issue.issueCreator.userName,
          userAvatar: issue.issueCreator.userAvatar,
        },
        create: {
          userName: issue.issueCreator.userName,
          userAvatar: issue.issueCreator.userAvatar,
          userUsername: issue.issueCreator.userUsername,
        },
      });

      // Create or fetch the closer if it exists
      let closer = null;
      if (issue.issueClosedBy) {
        closer = await db.gitHubUserProfile.upsert({
          where: { userUsername: issue.issueClosedBy.userUsername },
          update: {
            userName: issue.issueClosedBy.userName,
            userAvatar: issue.issueClosedBy.userAvatar,
          },
          create: {
            userName: issue.issueClosedBy.userName,
            userAvatar: issue.issueClosedBy.userAvatar,
            userUsername: issue.issueClosedBy.userUsername,
          },
        });
      }

      // Compute hash once
      const hash = issue.hash ?? computeIssueHash(issue);

      const updateData: any = {
        projectId: projectId,
        issueCreatedAt: issue.issueCreatedAt,
        issueTitle: issue.issueTitle,
        issueDescription: issue.issueDescription,
        issueCreatorId: creator.id,
        issueState: issue.issueState,
        hash,
      };

      const createData: any = {
        projectId: projectId,
        issueId: issue.issueId,
        issueState: issue.issueState,
        issueNumber: issue.issueNumber,
        issueCreatedAt: issue.issueCreatedAt,
        issueTitle: issue.issueTitle,
        issueDescription: issue.issueDescription,
        issueCreatorId: creator.id,
        hash,
      };

      if (closer && issue.issueState === "closed") {
        updateData.issueClosedById = closer.id;
        updateData.issueClosedDate = issue.issueClosedAt;

        createData.issueClosedById = closer.id;
        createData.issueClosedDate = issue.issueClosedAt;
      }

      // Upsert the issue
      const updatedIssue = await db.issue.upsert({
        where: { issueId: issue.issueId },
        update: updateData,
        create: createData,
      });

      // Handle assigned users
      if (issue.issueAssigned) {
        for (const assignee of issue.issueAssigned) {
          const assignedUser = await db.assignedOrReviewerUser.upsert({
            where: { userUsername: assignee.userUsername },
            update: {
              userName: assignee.userName,
              userAvatar: assignee.userAvatar,
            },
            create: {
              userName: assignee.userName,
              userAvatar: assignee.userAvatar,
              userUsername: assignee.userUsername,
            },
          });

          // Link assigned user to issue
          await db.linkToAssignedOrReviewerUser.upsert({
            where: {
              issueAssigneeId_issueId: {
                issueId: updatedIssue.id,
                issueAssigneeId: assignedUser.id,
              },
            },
            update: {}, // No updates needed for junction table
            create: {
              issueId: updatedIssue.id,
              issueAssigneeId: assignedUser.id,
            },
          });
        }
      }

      // Handle labels
      if (issue.issueLabel) {
        for (const label of issue.issueLabel) {
          const issueLabel = await db.label.upsert({
            where: { name: label.name },
            update: { color: label.color },
            create: { name: label.name, color: label.color },
          });

          // Link label to issue
          await db.linkToLabel.upsert({
            where: {
              issueLabelId_issueId: {
                issueId: updatedIssue.id,
                issueLabelId: issueLabel.id,
              },
            },
            update: {}, // No updates needed for junction table
            create: {
              issueId: updatedIssue.id,
              issueLabelId: issueLabel.id,
            },
          });
        }
      }
    } catch (error) {
      console.error(`Failed to process issue ${issue.issueId}:`, error);
    }
  }

  return { message: "Issues processed successfully" };
};

export const computeIssueHash = (issue: IssueResponse) => {
  const serialized = stableStringify(issue);
  return crypto.createHash("sha256").update(serialized).digest("hex");
};

export const filterUnprocessedIssues = async (
  projectId: string,
  incomingIssues: IssueResponse[],
) => {
  const existingIssues = await db.issue.findMany({
    where: { projectId },
    select: { hash: true },
  });

  const existingHashes = new Set(existingIssues.map((issue) => issue.hash));

  const unprocessedIssues = incomingIssues.filter((issue) => {
    const hash = computeIssueHash(issue);
    return !existingHashes.has(hash);
  });

  return unprocessedIssues;
};

// ! PULLS SECTION

type PullRequestResponse = {
  prId: string;
  prNumber: number;
  prTitle: string;
  prState: string;
  prHeadRef: string;
  prBaseRef: string;
  prDescription: string;
  prCreator: GitHubUserProfile;
  prCreatedAt: string;
  prLabels: IssueOrPrLabel[] | null;
  prAssigned: GitHubUserProfile[] | null;
  prAssignedIds: String[];
  prReviewers: GitHubUserProfile[] | null;
  prReviewersIds: String[];
  prClosedAt: string;
  prMergedAt: string;
  hash?: string;
};

export const getPullRequests = async (
  githubUrl: string,
): Promise<PullRequestResponse[]> => {
  const [owner, repo] = githubUrl.split("/").slice(-2);

  if (!owner || !repo) {
    throw new Error("Invalid GitHub Url");
  }

  const { data } = await octokit.rest.pulls.list({
    owner,
    repo,
    state: "all",
  });

  const sortedPrs = data.sort(
    (a: any, b: any) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  return sortedPrs.slice(0, 50).map((pr) => ({
    prId: String(pr.id),
    prNumber: pr.number,
    prTitle: pr.title,
    prState: pr.state,
    prHeadRef: pr.head.ref,
    prBaseRef: pr.base.ref,
    prDescription: pr.body ?? "",
    prCreator: {
      userAvatar: pr.user?.avatar_url ?? "",
      userName: pr.user?.login ?? "",
      userUsername: pr.user?.login ?? "",
    },
    prCreatedAt: pr.created_at,
    prMergedAt: pr.merged_at ?? "",
    prLabels:
      pr.labels.map((label) => {
        if (typeof label === "string") {
          return { name: label, color: null }; // Handle string labels
        } else {
          return {
            name: label.name ?? "",
            color: label.color ?? null,
          };
        }
      }) ?? [],
    prAssigned:
      pr.assignees?.map((assignee) => ({
        userAvatar: assignee.avatar_url,
        userName: assignee.login ?? "",
        userUsername: assignee.login,
      })) ?? null,
    prAssignedIds: pr.assignees?.map((assignee) => assignee.login) ?? [],
    prReviewers:
      pr.requested_reviewers?.map((reviewer) => ({
        userAvatar: reviewer.avatar_url,
        userName: reviewer.login ?? "",
        userUsername: reviewer.login,
      })) ?? null,
    prReviewersIds:
      pr.requested_reviewers?.map((reviewer) => reviewer.login) ?? [],
    prClosedAt: pr.closed_at ?? "",
  }));
};

export const pollPrs = async (projectId: string) => {
  const { githubUrl } = await fetchProjectGithubUrl(projectId);

  // Fetch issues from GitHub
  const prs = await getPullRequests(githubUrl);

  // Filter unprocessed issues
  const unprocessedPrs = await filterUnprocessedPrs(projectId, prs);

  for (const pr of unprocessedPrs) {
    try {
      // Create or fetch the creator
      const creator = await db.gitHubUserProfile.upsert({
        where: { userUsername: pr.prCreator.userUsername },
        update: {
          userName: pr.prCreator.userName,
          userAvatar: pr.prCreator.userAvatar,
        },
        create: {
          userName: pr.prCreator.userName,
          userAvatar: pr.prCreator.userAvatar,
          userUsername: pr.prCreator.userUsername,
        },
      });

      // Compute hash once
      const hash = pr.hash ?? computePrHash(pr);

      const updateData: any = {
        projectId: projectId,
        prId: pr.prId,
        prTitle: pr.prTitle,
        prState: pr.prState,
        prHeadRef: pr.prHeadRef,
        prBaseRef: pr.prBaseRef,
        prDescription: pr.prDescription,
        prCreatorId: creator.id,
        prCreatedAt: pr.prCreatedAt,
        hash,
      };

      const createData: any = {
        projectId: projectId,
        prId: pr.prId,
        prNumber: pr.prNumber,
        prTitle: pr.prTitle,
        prState: pr.prState,
        prHeadRef: pr.prHeadRef,
        prBaseRef: pr.prBaseRef,
        prDescription: pr.prDescription,
        prCreatorId: creator.id,
        prCreatedAt: pr.prCreatedAt,
        hash,
      };

      if (pr.prClosedAt && pr.prState === "closed") {
        updateData.prClosedAt = pr.prClosedAt;
        createData.prClosedAt = pr.prClosedAt;
      }

      if (pr.prMergedAt) {
        updateData.prMergedAt = pr.prMergedAt;
        createData.prMergedAt = pr.prMergedAt;
      }

      // Upsert the issue
      const updatedPr = await db.pullRequest.upsert({
        where: { prId: pr.prId },
        update: updateData,
        create: createData,
      });

      // Handle assigned users
      if (pr.prAssigned) {
        for (const assignee of pr.prAssigned) {
          const assignedUser = await db.assignedOrReviewerUser.upsert({
            where: { userUsername: assignee.userUsername },
            update: {
              userName: assignee.userName,
              userAvatar: assignee.userAvatar,
            },
            create: {
              userName: assignee.userName,
              userAvatar: assignee.userAvatar,
              userUsername: assignee.userUsername,
            },
          });

          // Link assigned user to issue
          await db.linkToAssignedOrReviewerUser.upsert({
            where: {
              prAssigneeId_pullRequestId: {
                pullRequestId: updatedPr.id,
                prAssigneeId: assignedUser.id,
              },
            },
            update: {}, // No updates needed for junction table
            create: {
              pullRequestId: updatedPr.id,
              prAssigneeId: assignedUser.id,
            },
          });
        }
      }

      if (pr.prReviewers) {
        for (const reviewer of pr.prReviewers) {
          const ReviewedUser = await db.assignedOrReviewerUser.upsert({
            where: {
              userUsername: reviewer.userName,
            },
            update: {
              userName: reviewer.userName,
              userAvatar: reviewer.userAvatar,
            },
            create: {
              userName: reviewer.userName,
              userAvatar: reviewer.userAvatar,
              userUsername: reviewer.userUsername,
            },
          });

          // Link assigned user to issue
          await db.linkToAssignedOrReviewerUser.upsert({
            where: {
              prReviewerId_pullRequestId: {
                pullRequestId: updatedPr.id,
                prReviewerId: ReviewedUser.id,
              },
            },
            update: {}, // No updates needed for junction table
            create: {
              pullRequestId: updatedPr.id,
              prReviewerId: ReviewedUser.id,
            },
          });
        }
      }

      // Handle labels
      if (pr.prLabels) {
        for (const label of pr.prLabels) {
          const prLabel = await db.label.upsert({
            where: { name: label.name },
            update: { color: label.color },
            create: { name: label.name, color: label.color },
          });

          // Link label to issue
          await db.linkToLabel.upsert({
            where: {
              prLabelId_pullRequestId: {
                pullRequestId: updatedPr.id,
                prLabelId: prLabel.id,
              },
            },
            update: {}, // No updates needed for junction table
            create: {
              pullRequestId: updatedPr.id,
              prLabelId: prLabel.id,
            },
          });
        }
      }
    } catch (error) {
      console.error(`Failed to process issue ${pr.prId}:`, error);
    }
  }

  return { message: "Prs processed successfully" };
};

export const computePrHash = (pr: PullRequestResponse) => {
  const serialized = stableStringify(pr);
  return crypto.createHash("sha256").update(serialized).digest("hex");
};

export const filterUnprocessedPrs = async (
  projectId: string,
  incomingPrs: PullRequestResponse[],
) => {
  const existingPrs = await db.issue.findMany({
    where: { projectId },
    select: { hash: true },
  });

  const existingHashes = new Set(existingPrs.map((pr) => pr.hash));

  const unprocessedIssues = incomingPrs.filter((pr) => {
    const hash = computePrHash(pr);
    return !existingHashes.has(hash);
  });

  return unprocessedIssues;
};

pollPrs("cm5srbjqp000077yqtawsxbv3");
