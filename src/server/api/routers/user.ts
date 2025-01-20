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
      return await ctx.db.user.update({
        where: { id: ctx.user.userId! },
        data: {
          tier: input.tier,
        },
      });
    }),
});
