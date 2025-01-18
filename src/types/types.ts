export interface GitHubUserProfile {
  id?: number;
  userName?: string;
  userAvatar?: string;
}

export interface Label {
  id?: number | null;
  name?: string;
  color?: string | null;
}

export interface AssigneeOrReviewer {
  id?: number | null;
  assigneeOrReviewerName?: string | null;
  assigneeOrReviewerAvatar?: string | null;
  assigneeOrReviewerUsername?: string | null;
}

export enum UserTier {
  basic = "basic",
  pro = "pro",
  premium = "premium",
}

export interface Project {
  id: string;
  name: string;
  githubUrl: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface GitHubRepository {
  id: number;
  name: string;
  private: boolean;
  owner: GitHubUserProfile;
  description?: string | null;
  createdAt: Date;
  updatedAt: Date;
  topics?: string[] | null;
  openIssues: number;
  defaultBranch: string;
}

export interface GitHubCommit {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  projectId: string;
  commitMessage: string;
  commitHash: string;
  commitAuthorName: string;
  commitAuthorAvatar: string;
  commitDate: Date;
  summary: string;
}

export interface GitHubIssue {
  id: number;
  number: number;
  state: string;
  title: string;
  description: string | null;
  creator: GitHubUserProfile;
  createdAt: Date;
  assignees: GitHubUserProfile[] | null;
  closedBy: GitHubUserProfile | null;
  closedAt: Date | null;
  label: Label[] | null;
}

export interface GitHubPullRequest {
  id: number;
  number: number;
  title: string;
  state: string;
  headRef: string;
  baseRef: string;
  description?: string | null;
  creator: GitHubUserProfile;
  createdAt: Date;
  label: Label[] | null;
  reviewers?: GitHubUserProfile[] | null;
  assignees?: GitHubUserProfile[] | null;
  closedAt: Date | null;
  mergedAt: Date | null;
}
