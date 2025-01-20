import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import {
  getIssues,
  getPullRequests,
  getRepository,
  pollCommits,
} from "@/lib/github";
import {
  type GitHubIssue,
  type GitHubCommit,
  type Project,
  type GitHubPullRequest,
  type GitHubRepository,
} from "@/types/types";
import { checkCredits } from "@/lib/github-loader";
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
      const user = await ctx.db.user.findUnique({
        where: { id: ctx.user.userId! },
        select: {
          tier: true,
        },
      });

      const projects = await ctx.db.project.findMany({
        where: {
          userToProject: {
            some: {
              userId: ctx.user.userId!,
            },
          },
          deletedAt: null,
        },
      });

      console.log(projects);

      if ((projects.length ?? 0) >= 3 && user?.tier === "basic") {
        throw new Error("Please upgrade your plan to add more projects");
      }
      if ((projects.length ?? 0) >= 5 && user?.tier === "pro") {
        throw new Error("Please upgrade your plan to add more projects");
      }
      if ((projects.length ?? 0) >= 10 && user?.tier === "premium") {
        throw new Error("Please upgrade your plan to add more projects");
      }

      const project = await ctx.db.project.create({
        data: {
          name: input.name,
          githubUrl: input.githubUrl,
          userToProject: {
            create: {
              userId: ctx.user.userId!,
              role: "ADMIN",
            },
          },
        },
      });

      await pollCommits(project.id);

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
      const userRole = await ctx.db.userToProject.findUnique({
        where: {
          projectId_userId: {
            projectId: input.projectId,
            userId: ctx.user.userId!,
          },
        },
        select: {
          role: true,
        },
      });

      if (userRole?.role !== "ADMIN") {
        throw new Error("Unauthorized");
      }

      const project = await ctx.db.project.update({
        where: { id: input.projectId },
        data: {
          deletedAt: new Date(),
        },
      });
      // await indexGithubRepo(project.id, input.githubUrl, input.githubToken);
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
    .query(async ({ ctx, input }): Promise<GitHubRepository> => {
      try {
        const repository = await getRepository(input.projectId);
        return repository;
      } catch (error) {
        throw new Error("Error fetching issues");
      }
    }),
  getCommits: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
      }),
    )
    .query(async ({ ctx, input }): Promise<GitHubCommit[]> => {
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
      try {
        const issues = await getIssues(input.projectId);
        return issues;
      } catch (error) {
        throw new Error("Error fetching issues");
      }
    }),

  getPullRequests: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
      }),
    )
    .query(async ({ ctx, input }): Promise<GitHubPullRequest[]> => {
      try {
        const prs = await getPullRequests(input.projectId);
        return prs;
      } catch (error) {
        throw new Error("Error fetching prs");
      }
    }),

  getMyCredits: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.user.findUnique({
      where: { id: ctx.user.userId! },
      select: {
        credits: true,
      },
    });
  }),

  checkCredits: protectedProcedure
    .input(
      z.object({ gihtubUrl: z.string(), githubToken: z.string().optional() }),
    )
    .mutation(async ({ ctx, input }) => {
      const fileCount = await checkCredits(input.gihtubUrl, input.githubToken);
      const userCredits = await ctx.db.user.findUnique({
        where: { id: ctx.user.userId! },
        select: { credits: true },
      });

      return { fileCount, userCredits: userCredits?.credits || 0 };
    }),
});
