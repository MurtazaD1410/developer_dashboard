import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { pollCommits, pollIssues, pollPrs, pollRepository } from "@/lib/github";
import {
  type GitHubIssue,
  type GitHubCommit,
  type GitHubRepository,
  type GitHubPullRequest,
  type Project,
} from "@/types/types";
// import { indexGithubRepo } from "@/lib/github-loader";

export const projectRouter = createTRPCRouter({
  createProject: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        githubUrl: z.string(),
        defaultBranch: z.string().optional(),
        githubToken: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }): Promise<Project> => {
      const project = await ctx.db.project.create({
        data: {
          name: input.name,
          githubUrl: input.githubUrl,
          userToProject: {
            create: {
              userId: ctx.user.userId!,
            },
          },
        },
      });
      // await indexGithubRepo(project.id, input.githubUrl, input.githubToken);
      await pollRepository(project.id);
      await pollCommits(project.id);
      await pollIssues(project.id);
      return project;
    }),

  getProjects: protectedProcedure.query(async ({ ctx }): Promise<Project[]> => {
    return await ctx.db.project.findMany({
      where: {
        userToProject: {
          some: {
            userId: ctx.user.userId!,
          },
        },
        deletedAt: null,
      },
    });
  }),

  archiveProject: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }): Promise<Project> => {
      const project = await ctx.db.project.update({
        where: { id: input.projectId },
        data: {
          deletedAt: new Date(),
        },
      });
      // await indexGithubRepo(project.id, input.githubUrl, input.githubToken);
      await pollRepository(project.id);
      await pollCommits(project.id);
      await pollIssues(project.id);
      return project;
    }),

  getTeamMembers: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return await ctx.db.userToProject.findMany({
        where: {
          projectId: input.projectId,
        },
        include: {
          user: true,
        },
      });
    }),

  getRepository: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
      }),
    )
    .query(async ({ ctx, input }): Promise<GitHubRepository | null> => {
      pollRepository(input.projectId).then().catch(console.error);
      return await ctx.db.repository.findFirst({
        where: {
          projectId: input.projectId,
        },
        include: {
          repoOwner: {
            include: {
              createdIssues: false,
              closedIssues: false,
              RepositoryOwned: false,
            },
          },
        },
      });
    }),
  getCommits: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
      }),
    )
    .query(async ({ ctx, input }): Promise<GitHubCommit[]> => {
      pollRepository(input.projectId).then().catch(console.error);
      pollCommits(input.projectId).then().catch(console.error);
      return await ctx.db.commit.findMany({
        where: {
          projectId: input.projectId,
        },
      });
    }),

  getIssues: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
      }),
    )
    .query(async ({ ctx, input }): Promise<GitHubIssue[]> => {
      pollIssues(input.projectId).then().catch(console.error);
      const issues = await ctx.db.issue.findMany({
        where: {
          projectId: input.projectId,
        },
        include: {
          issueCloser: {
            include: {
              createdIssues: false,
              closedIssues: false,
            },
          },
          issueCreator: {
            include: {
              createdIssues: false,
            },
          },
          issueToAssignedUser: {
            include: {
              issueAssignee: true,
            },
          },
          issueLabel: {
            include: {
              issueLabel: true,
            },
          },
        },
      });

      const formattedIssues = issues.map((issue) => ({
        ...issue,
        issueAssigned: issue.issueToAssignedUser.map((item) => ({
          id: item.issueAssignee?.id,
          assigneeOrReviewerName: item.issueAssignee?.userName,
          assigneeOrReviewerAvatar: item.issueAssignee?.userAvatar,
          assigneeOrReviewerUsername: item.issueAssignee?.userUsername,
        })),
        issueLabel: issue.issueLabel.map((item) => ({
          id: item.issueLabelId,
          name: item.issueLabel?.name,
          color: item.issueLabel?.color,
        })),
      }));

      return formattedIssues;
    }),

  getPullRequests: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
      }),
    )
    .query(async ({ ctx, input }): Promise<GitHubPullRequest[]> => {
      pollPrs(input.projectId).then().catch(console.error);
      const prs = await ctx.db.pullRequest.findMany({
        where: {
          projectId: input.projectId,
        },

        include: {
          prCreator: {
            include: {
              createdIssues: false,
              closedIssues: false,
              PullRequest: false,
            },
          },
          assignments: {
            include: {
              prReviewer: true,
              prAssignee: true,
            },
          },
          prLabel: {
            include: {
              issue: false,
              issueLabel: false,
              PullRequest: false,
              prLabel: true,
            },
          },
        },
      });

      const formattedPrs = prs.map((pr) => ({
        ...pr,
        assignments: undefined,
        prAssignees: pr.assignments
          .filter((assignment) => assignment.prAssignee) // Filter out assignments without `prAssignee`
          .map((assignment) => ({
            id: assignment.prAssignee?.id,
            assigneeOrReviewerName: assignment.prAssignee?.userName,
            assigneeOrReviewerAvatar: assignment.prAssignee?.userAvatar,
            assigneeOrReviewerUsername: assignment.prAssignee?.userUsername,
          })),
        prReviewers: pr.assignments
          .filter((assignment) => assignment.prReviewer) // Filter out assignments without `prReviewer`
          .map((assignment) => ({
            id: assignment.prReviewer?.id,
            assigneeOrReviewerName: assignment.prReviewer?.userName,
            assigneeOrReviewerAvatar: assignment.prReviewer?.userAvatar,
            assigneeOrReviewerUsername: assignment.prReviewer?.userUsername,
          })),
        prLabel: pr.prLabel.map((item) => ({
          id: item.prLabelId,
          name: item.prLabel?.name,
          color: item.prLabel?.color,
        })),
      }));

      return formattedPrs;
    }),

  getMyCredits: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.user.findUnique({
      where: { id: ctx.user.userId! },
      select: {
        credits: true,
      },
    });
  }),
});
