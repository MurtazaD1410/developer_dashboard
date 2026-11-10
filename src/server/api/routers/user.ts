import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { UserTier } from "@/types/types";

export const userRouter = createTRPCRouter({
  getUser: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.user.findUnique({
      where: { id: ctx.user.userId! },
      select: {
        tier: true,
        userToProject: {
          where: { userId: ctx.user.userId! },
        },
      },
    });
  }),
  getUserRole: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
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

      return userRole;
    }),
  cancelSubscription: protectedProcedure
    .input(z.object({ tier: z.enum([UserTier.basic]) }))
    .mutation(async ({ ctx, input }) => {
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

      const canCancelResults = await Promise.all(
        projects.map(async (project) => {
          const teamMembers = await ctx.db.userToProject.findMany({
            where: {
              projectId: project.id,
            },
            include: {
              user: true,
            },
            orderBy: {
              role: "asc",
            },
          });

          // Check if the project has more than one team member
          return teamMembers.length <= 1;
        }),
      );

      // If any project cannot be canceled, throw an error
      if (canCancelResults.includes(false)) {
        throw new Error(
          "Please remove some members in your project to cancel your subscription",
        );
      }
      if ((projects.length ?? 0) >= 3) {
        throw new Error(
          "Please delete some projects to cancel your subscription",
        );
      }
      return await ctx.db.user.update({
        where: { id: ctx.user.userId! },
        data: {
          tier: input.tier,
        },
      });
    }),
});
