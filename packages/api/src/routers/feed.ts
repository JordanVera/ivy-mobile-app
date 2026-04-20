import { TRPCError } from '@trpc/server';

import {
  displayNameForUser,
  ensureUserForClerkId,
} from '../lib/clerk-user';
import { protectedProcedure, publicProcedure, router } from '../trpc';

function formatFeedPostTime(date: Date): string {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfPost = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round(
    (startOfToday.getTime() - startOfPost.getTime()) / 86_400_000,
  );
  const timeStr = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
  if (diffDays === 0) return `Today · ${timeStr}`;
  if (diffDays === 1) return `Yesterday · ${timeStr}`;
  return `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · ${timeStr}`;
}

function parseCreateFeedPostBody(val: unknown): { body: string } {
  if (!val || typeof val !== 'object') {
    throw new TRPCError({ code: 'BAD_REQUEST', message: 'Invalid input' });
  }
  const o = val as Record<string, unknown>;
  const body = typeof o.body === 'string' ? o.body.trim() : '';
  if (!body.length) {
    throw new TRPCError({ code: 'BAD_REQUEST', message: 'body is required' });
  }
  if (body.length > 5000) {
    throw new TRPCError({ code: 'BAD_REQUEST', message: 'body is too long' });
  }
  return { body };
}

export const feedRouter = router({
  list: publicProcedure.query(async ({ ctx }) => {
    const rows = await ctx.prisma.feedPost.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: { author: true },
    });
    return rows.map((row) => ({
      id: row.id,
      name: displayNameForUser(row.author),
      time: formatFeedPostTime(row.createdAt),
      body: row.body,
    }));
  }),

  create: protectedProcedure.input(parseCreateFeedPostBody).mutation(async ({ ctx, input }) => {
    const user = await ensureUserForClerkId(ctx.prisma, ctx.clerkUserId);
    const post = await ctx.prisma.feedPost.create({
      data: {
        authorId: user.id,
        body: input.body,
      },
    });
    return {
      id: post.id,
      name: displayNameForUser(user),
      time: formatFeedPostTime(post.createdAt),
      body: post.body,
    };
  }),
});
