import { db } from "@/server/db";
import { Octokit } from "octokit";

import { aiSummarizeCommit } from "./gemini";
import {
  type GitHubPullRequest,
  type GitHubIssue,
  type GitHubRepository,
} from "@/types/types";

export const octokit = new Octokit({
  // auth: process.env.GITHUB_TOKEN,
  auth: "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",
});

// ! REPOSITORY SECTION

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

export const getIssues = async (projectId: string): Promise<GitHubIssue[]> => {
  const { githubUrl } = await fetchProjectGithubUrl(projectId);

  const [owner, repo] = githubUrl.split("/").slice(-2);

  if (!owner || !repo) {
    throw new Error("Invalid GitHub Url");
  }

  const { data } = await octokit.rest.issues.listForRepo({
    owner,
    repo,
    state: "all",
    per_page: 100,
    sort: "created",
    direction: "desc",
  });

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

  return formattedIssues;
};

// ! PULLS SECTION

export const getPullRequests = async (
  projectId: string,
): Promise<GitHubPullRequest[]> => {
  const { githubUrl } = await fetchProjectGithubUrl(projectId);

  const [owner, repo] = githubUrl.split("/").slice(-2);

  if (!owner || !repo) {
    throw new Error("Invalid GitHub Url");
  }

  const { data } = await octokit.rest.pulls.list({
    owner,
    repo,
    state: "all",
    per_page: 100,
    sort: "created",
    direction: "desc",
  });

  const formattedPrs = data.map((pr) => ({
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
  }));

  return formattedPrs;
};
