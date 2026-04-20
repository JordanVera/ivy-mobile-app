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

function parsePostId(val: unknown): { postId: string } {
  if (!val || typeof val !== 'object') {
    throw new TRPCError({ code: 'BAD_REQUEST', message: 'Invalid input' });
  }
  const o = val as Record<string, unknown>;
  const postId = typeof o.postId === 'string' ? o.postId.trim() : '';
  if (!postId.length) {
    throw new TRPCError({ code: 'BAD_REQUEST', message: 'postId is required' });
  }
  return { postId };
}

function parseAddComment(val: unknown): { postId: string; body: string } {
  if (!val || typeof val !== 'object') {
    throw new TRPCError({ code: 'BAD_REQUEST', message: 'Invalid input' });
  }
  const o = val as Record<string, unknown>;
  const postId = typeof o.postId === 'string' ? o.postId.trim() : '';
  const body = typeof o.body === 'string' ? o.body.trim() : '';
  if (!postId.length) {
    throw new TRPCError({ code: 'BAD_REQUEST', message: 'postId is required' });
  }
  if (!body.length) {
    throw new TRPCError({ code: 'BAD_REQUEST', message: 'body is required' });
  }
  if (body.length > 2000) {
    throw new TRPCError({ code: 'BAD_REQUEST', message: 'Comment is too long' });
  }
  return { postId, body };
}

export const feedRouter = router({
  list: publicProcedure.query(async ({ ctx }) => {
    const rows = await ctx.prisma.feedPost.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        author: true,
        _count: { select: { likes: true, comments: true } },
      },
    });

    let currentUserId: string | null = null;
    if (ctx.clerkUserId) {
      const me = await ctx.prisma.user.findUnique({
        where: { clerkUserId: ctx.clerkUserId },
        select: { id: true },
      });
      currentUserId = me?.id ?? null;
    }

    const postIds = rows.map((r) => r.id);
    const likedSet = new Set<string>();
    if (currentUserId && postIds.length > 0) {
      const myLikes = await ctx.prisma.feedPostLike.findMany({
        where: { userId: currentUserId, postId: { in: postIds } },
        select: { postId: true },
      });
      for (const l of myLikes) likedSet.add(l.postId);
    }

    return rows.map((row) => ({
      id: row.id,
      name: displayNameForUser(row.author),
      time: formatFeedPostTime(row.createdAt),
      body: row.body,
      likeCount: row._count.likes,
      commentCount: row._count.comments,
      likedByMe: likedSet.has(row.id),
    }));
  }),

  comments: publicProcedure.input(parsePostId).query(async ({ ctx, input }) => {
    const rows = await ctx.prisma.feedPostComment.findMany({
      where: { postId: input.postId },
      orderBy: { createdAt: 'asc' },
      take: 100,
      include: { author: true },
    });
    return rows.map((c) => ({
      id: c.id,
      name: displayNameForUser(c.author),
      time: formatFeedPostTime(c.createdAt),
      body: c.body,
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
      likeCount: 0,
      commentCount: 0,
      likedByMe: false,
    };
  }),

  toggleLike: protectedProcedure.input(parsePostId).mutation(async ({ ctx, input }) => {
    const user = await ensureUserForClerkId(ctx.prisma, ctx.clerkUserId);
    const post = await ctx.prisma.feedPost.findUnique({ where: { id: input.postId } });
    if (!post) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Post not found' });
    }

    const existing = await ctx.prisma.feedPostLike.findUnique({
      where: { postId_userId: { postId: input.postId, userId: user.id } },
    });

    if (existing) {
      await ctx.prisma.feedPostLike.delete({ where: { id: existing.id } });
      return { liked: false as const };
    }

    await ctx.prisma.feedPostLike.create({
      data: { postId: input.postId, userId: user.id },
    });
    return { liked: true as const };
  }),

  addComment: protectedProcedure.input(parseAddComment).mutation(async ({ ctx, input }) => {
    const user = await ensureUserForClerkId(ctx.prisma, ctx.clerkUserId);
    const post = await ctx.prisma.feedPost.findUnique({ where: { id: input.postId } });
    if (!post) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Post not found' });
    }

    await ctx.prisma.feedPostComment.create({
      data: {
        postId: input.postId,
        authorId: user.id,
        body: input.body,
      },
    });

    return { ok: true as const };
  }),
});
