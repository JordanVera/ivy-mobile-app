import { TRPCError } from '@trpc/server';

import {
  ensureUserForClerkId,
  refreshUserFromClerk,
} from '../lib/clerk-user';
import { protectedProcedure, router } from '../trpc';

/**
 * Ensures the signed-in Clerk user has a row in our database (upsert from Clerk API if missing).
 * Call once after sign-in / sign-up — especially important when webhooks cannot reach your server (e.g. local dev).
 */
export const userRouter = router({
  sync: protectedProcedure.mutation(async ({ ctx }) => {
    await ensureUserForClerkId(ctx.prisma, ctx.clerkUserId);
    return { ok: true as const };
  }),

  /** Current user from our DB plus activity counts; ensures a row exists first. */
  me: protectedProcedure.query(async ({ ctx }) => {
    await ensureUserForClerkId(ctx.prisma, ctx.clerkUserId);
    const u = await ctx.prisma.user.findUnique({
      where: { clerkUserId: ctx.clerkUserId },
      include: {
        _count: {
          select: {
            posts: true,
            postLikes: true,
            postComments: true,
          },
        },
      },
    });
    if (!u) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'User record not found after sync',
      });
    }
    return {
      id: u.id,
      clerkUserId: u.clerkUserId,
      email: u.email,
      firstName: u.firstName,
      lastName: u.lastName,
      imageUrl: u.imageUrl,
      createdAt: u.createdAt.toISOString(),
      updatedAt: u.updatedAt.toISOString(),
      counts: {
        posts: u._count.posts,
        likesGiven: u._count.postLikes,
        comments: u._count.postComments,
      },
    };
  }),

  /** Pull latest name, email, and avatar from Clerk into the database. */
  refreshFromClerk: protectedProcedure.mutation(async ({ ctx }) => {
    await refreshUserFromClerk(ctx.prisma, ctx.clerkUserId);
    return { ok: true as const };
  }),
});
