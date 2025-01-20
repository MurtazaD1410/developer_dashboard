import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import {
  getIssues,
  getPullRequests,
  getRepository,
  getCommits,
} from "@/lib/github";
import {
  type GitHubIssue,
  type GitHubCommit,
  type Project,
  type GitHubPullRequest,
  type GitHubRepository,
  UserRole,
} from "@/types/types";
import { checkCredits } from "@/lib/github-loader";
import { generateInviteCode } from "@/lib/utils";

export const projectRouter = createTRPCRouter({
  createProject: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        githubUrl: z.string(),
        inviteCode: z.string(),
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
          inviteCode: input.inviteCode,
          userToProject: {
            create: {
              userId: ctx.user.userId!,
              role: "ADMIN",
            },
          },
        },
      });
      return project;
    }),

  resetInviteLink: protectedProcedure
    .input(
      z.object({
        projectId: z.string(), // Project ID for which the invite link needs to be reset
      }),
    )
    .mutation(async ({ ctx, input }): Promise<Project> => {
      // Check if the project exists and the user is part of it
      const userProject = await ctx.db.userToProject.findUnique({
        where: {
          projectId_userId: {
            projectId: input.projectId,
            userId: ctx.user.userId!,
          },
        },
      });

      if (!userProject) {
        throw new Error("You are not part of this project.");
      }

      // Ensure the user has permission to reset the invite link (admin only)
      if (userProject.role !== "ADMIN") {
        throw new Error("You are not authorized to reset the invite link.");
      }

      // Generate a new invite code (you can use a UUID or a custom logic)
      const newInviteCode = generateInviteCode(6); // Replace with your own invite code generation logic

      // Update the invite code for the project
      const updatedProject = await ctx.db.project.update({
        where: {
          id: input.projectId,
        },
        data: {
          inviteCode: newInviteCode,
        },
      });

      return updatedProject;
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
      return project;
    }),

  leaveProject: protectedProcedure
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

      if (!userRole) {
        throw new Error("User not part of this project.");
      }

      const adminCount = await ctx.db.userToProject.count({
        where: {
          projectId: input.projectId,
          role: "ADMIN",
        },
      });

      if (userRole.role === "ADMIN" && adminCount <= 1) {
        throw new Error(
          "Admins cannot leave the project. Promote another user to admin first.",
        );
      }

      // Remove the user from the project
      await ctx.db.userToProject.delete({
        where: {
          projectId_userId: {
            projectId: input.projectId,
            userId: ctx.user.userId!,
          },
        },
      });

      // Optionally, you can return the project after the user has left
      const project = await ctx.db.project.findUnique({
        where: { id: input.projectId },
      });

      if (!project) {
        throw new Error("Project not found.");
      }

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
        orderBy: {
          role: "asc",
        },
      });
    }),

  changeMemberRole: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        userId: z.string(),
        role: z.enum([UserRole.member, UserRole.admin]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
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

      const adminCount = await ctx.db.userToProject.count({
        where: {
          projectId: input.projectId,
          role: "ADMIN",
        },
      });

      if (input.role === "MEMBER" && adminCount <= 1) {
        throw new Error("There must be at least one admin in the project.");
      }

      return await ctx.db.userToProject.update({
        where: {
          projectId_userId: {
            projectId: input.projectId,
            userId: input.userId,
          },
        },
        data: {
          role: input.role,
        },
      });
    }),

  removeMember: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        userId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Check if the current user is an admin in the project
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

      // Check if the user to be removed is an admin
      const userToRemoveRole = await ctx.db.userToProject.findUnique({
        where: {
          projectId_userId: {
            projectId: input.projectId,
            userId: input.userId,
          },
        },
        select: {
          role: true,
        },
      });

      // Count the number of admins in the project
      const adminCount = await ctx.db.userToProject.count({
        where: {
          projectId: input.projectId,
          role: "ADMIN",
        },
      });

      // Prevent removal of the last admin
      if (userToRemoveRole?.role === "ADMIN" && adminCount <= 1) {
        throw new Error("There must be at least one admin in the project.");
      }

      // Remove the user from the project (delete the userToProject relationship)
      return await ctx.db.userToProject.delete({
        where: {
          projectId_userId: {
            projectId: input.projectId,
            userId: input.userId,
          },
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
        page: z.number().optional().default(1),
        limit: z.number().optional().default(15),
      }),
    )
    .query(async ({ ctx, input }): Promise<GitHubCommit[]> => {
      try {
        const data = await getCommits({
          projectId: input.projectId,
          page: input.page,
          limit: input.limit,
        });

        return data;
      } catch (error) {
        throw new Error("Error fetching commits");
      }
    }),

  getIssues: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        page: z.number().default(1),
        limit: z.number().default(30),
      }),
    )
    .query(
      async ({
        ctx,
        input,
      }): Promise<{
        issues: GitHubIssue[];
        totalPages: number;
      }> => {
        try {
          const data = await getIssues({
            projectId: input.projectId,
            page: input.page,
            limit: input.limit,
          });
          return data;
        } catch (error) {
          throw new Error("Error fetching issues");
        }
      },
    ),

  getPullRequests: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        page: z.number().default(1),
        limit: z.number().default(30),
      }),
    )
    .query(
      async ({
        ctx,
        input,
      }): Promise<{
        prs: GitHubPullRequest[];
        totalPages: number;
      }> => {
        try {
          const data = await getPullRequests({
            projectId: input.projectId,
            page: input.page,
            limit: input.limit,
          });
          return data;
        } catch (error) {
          throw new Error("Error fetching prs");
        }
      },
    ),
});
