import { TRPCError } from '@trpc/server';

import {
  displayNameForUser,
  ensureUserForClerkId,
} from '../lib/clerk-user';
import { protectedProcedure, publicProcedure, router } from '../trpc';

const MAX_COMMENTS_PER_THREAD = 200;
const MAX_COMMENT_LENGTH = 2000;
const MAX_BATCH_VIDEO_IDS = 60;

function sanitizeVideoId(input: unknown): string {
  if (typeof input !== 'string') {
    throw new TRPCError({ code: 'BAD_REQUEST', message: 'videoId is required' });
  }
  const trimmed = input.trim();
  // YouTube IDs are typically 11 chars of [A-Za-z0-9_-]. Be permissive but bounded.
  if (!trimmed.length || trimmed.length > 24) {
    throw new TRPCError({ code: 'BAD_REQUEST', message: 'Invalid videoId' });
  }
  if (!/^[A-Za-z0-9_-]+$/.test(trimmed)) {
    throw new TRPCError({ code: 'BAD_REQUEST', message: 'Invalid videoId' });
  }
  return trimmed;
}

function parseListInput(val: unknown): { videoId: string } {
  if (!val || typeof val !== 'object') {
    throw new TRPCError({ code: 'BAD_REQUEST', message: 'Invalid input' });
  }
  const o = val as Record<string, unknown>;
  return { videoId: sanitizeVideoId(o.videoId) };
}

function parseCreateInput(val: unknown): { videoId: string; body: string } {
  if (!val || typeof val !== 'object') {
    throw new TRPCError({ code: 'BAD_REQUEST', message: 'Invalid input' });
  }
  const o = val as Record<string, unknown>;
  const videoId = sanitizeVideoId(o.videoId);
  const body = typeof o.body === 'string' ? o.body.trim() : '';
  if (!body.length) {
    throw new TRPCError({ code: 'BAD_REQUEST', message: 'body is required' });
  }
  if (body.length > MAX_COMMENT_LENGTH) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: `Comment is too long (max ${MAX_COMMENT_LENGTH} characters)`,
    });
  }
  return { videoId, body };
}

function parseCountsInput(val: unknown): { videoIds: string[] } {
  if (!val || typeof val !== 'object') {
    throw new TRPCError({ code: 'BAD_REQUEST', message: 'Invalid input' });
  }
  const o = val as Record<string, unknown>;
  const raw = o.videoIds;
  if (!Array.isArray(raw)) {
    throw new TRPCError({ code: 'BAD_REQUEST', message: 'videoIds must be an array' });
  }
  if (raw.length === 0) return { videoIds: [] };
  if (raw.length > MAX_BATCH_VIDEO_IDS) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: `Too many videoIds (max ${MAX_BATCH_VIDEO_IDS})`,
    });
  }
  const cleaned = Array.from(
    new Set(raw.map((v) => sanitizeVideoId(v))),
  );
  return { videoIds: cleaned };
}

function formatCommentTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.round(diffMs / 1000);
  if (diffSec < 45) return 'just now';
  if (diffSec < 90) return '1 min ago';
  const diffMin = Math.round(diffSec / 60);
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.round(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export const episodeThreadRouter = router({
  /** Flat list of comments for a video, oldest first. Polled from the client. */
  list: publicProcedure.input(parseListInput).query(async ({ ctx, input }) => {
    const rows = await ctx.prisma.episodeComment.findMany({
      where: { youtubeVideoId: input.videoId },
      orderBy: { createdAt: 'asc' },
      take: MAX_COMMENTS_PER_THREAD,
      include: { author: true },
    });

    let currentUserId: string | null = null;
    if (ctx.clerkUserId) {
      const me = await ctx.prisma.user.findUnique({
        where: { clerkUserId: ctx.clerkUserId },
        select: { id: true },
      });
      currentUserId = me?.id ?? null;
    }

    return {
      videoId: input.videoId,
      comments: rows.map((c) => ({
        id: c.id,
        authorId: c.authorId,
        name: displayNameForUser(c.author),
        authorImageUrl: c.author.imageUrl,
        time: formatCommentTime(c.createdAt),
        createdAt: c.createdAt.toISOString(),
        body: c.body,
        mine: currentUserId != null && currentUserId === c.authorId,
      })),
    };
  }),

  /** Post a new comment to a video's thread. */
  create: protectedProcedure
    .input(parseCreateInput)
    .mutation(async ({ ctx, input }) => {
      const user = await ensureUserForClerkId(ctx.prisma, ctx.clerkUserId);
      const created = await ctx.prisma.episodeComment.create({
        data: {
          youtubeVideoId: input.videoId,
          authorId: user.id,
          body: input.body,
        },
        include: { author: true },
      });
      return {
        id: created.id,
        authorId: created.authorId,
        name: displayNameForUser(created.author),
        authorImageUrl: created.author.imageUrl,
        time: formatCommentTime(created.createdAt),
        createdAt: created.createdAt.toISOString(),
        body: created.body,
        mine: true,
      };
    }),

  /**
   * Batch comment counts for a set of video IDs. Useful if we later want to
   * surface a "Discuss (N)" badge on the Watch grid without N separate queries.
   */
  counts: publicProcedure.input(parseCountsInput).query(async ({ ctx, input }) => {
    if (input.videoIds.length === 0) return {} as Record<string, number>;
    const rows = await ctx.prisma.episodeComment.groupBy({
      by: ['youtubeVideoId'],
      where: { youtubeVideoId: { in: input.videoIds } },
      _count: { _all: true },
    });
    const result: Record<string, number> = {};
    for (const id of input.videoIds) result[id] = 0;
    for (const row of rows) {
      result[row.youtubeVideoId] = row._count._all;
    }
    return result;
  }),
});
