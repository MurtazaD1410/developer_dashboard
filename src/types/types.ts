export interface GitHubUserProfile {
  id?: string;
  createdAt?: Date;
  updatedAt?: Date;
  userName?: string | null;
  userAvatar?: string | null;
  userUsername?: string | null;
}

export interface Label {
  id?: string | null;
  name?: string | null;
  color?: string | null;
}

export interface AssigneeOrReviewer {
  id?: string | null;
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
  id: string;
  createdAt: Date;
  updatedAt: Date;
  projectId: string;
  repoId: string;
  repoName: string;
  repoPrivate: boolean;
  repoOwnerId: string;
  repoOwner: GitHubUserProfile;
  repoDescription?: string | null;
  repoCreatedAt: Date;
  repoUpdatedAt: Date;
  repoTopics?: string[] | null;
  repoOpenIssues: number;
  repoDefaultBranch: string;
  hash: string;
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
  id: string;
  createdAt: Date;
  updatedAt: Date;
  projectId: string;
  issueId: string;
  issueNumber: number;
  issueState: string;
  issueTitle: string;
  issueDescription?: string | null;
  issueCreatedAt: Date;
  issueCreatorId: string;
  issueClosedById?: string | null;
  issueClosedDate?: Date | null;
  issueCreator: GitHubUserProfile;
  issueCloser?: GitHubUserProfile | null;
  issueLabel?: Label[] | null;
  issueAssignees?: AssigneeOrReviewer[] | null;
  hash: string;
}

export interface GitHubPullRequest {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  projectId: string;
  prId: string;
  prNumber: number;
  prTitle: string;
  prState: string;
  prHeadRef: string;
  prBaseRef: string;
  prDescription?: string | null;
  prCreator: GitHubUserProfile;
  prCreatedAt: Date;
  prLabel?: Label[] | null;
  prAssignees?: AssigneeOrReviewer[] | null;
  prReviewers?: AssigneeOrReviewer[] | null;
  prClosedAt?: Date | null;
  prMergedAt?: Date | null;
  hash: string;
}
