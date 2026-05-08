import { TRPCError } from '@trpc/server';

import {
  displayNameForUser,
  ensureUserForClerkId,
} from '../lib/clerk-user';
import { protectedProcedure, publicProcedure, router } from '../trpc';

const MAX_MESSAGES = 200;
const MAX_MESSAGE_LENGTH = 2000;

function parseSendMessage(val: unknown): { body: string; replyToId?: string } {
  if (!val || typeof val !== 'object') {
    throw new TRPCError({ code: 'BAD_REQUEST', message: 'Invalid input' });
  }
  const o = val as Record<string, unknown>;
  const body = typeof o.body === 'string' ? o.body.trim() : '';
  if (!body.length) {
    throw new TRPCError({ code: 'BAD_REQUEST', message: 'body is required' });
  }
  if (body.length > MAX_MESSAGE_LENGTH) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: `Message is too long (max ${MAX_MESSAGE_LENGTH} characters)`,
    });
  }
  const replyToId =
    typeof o.replyToId === 'string' && o.replyToId.trim().length
      ? o.replyToId.trim()
      : undefined;
  return { body, replyToId };
}

function parseMessageId(val: unknown): { messageId: string } {
  if (!val || typeof val !== 'object') {
    throw new TRPCError({ code: 'BAD_REQUEST', message: 'Invalid input' });
  }
  const o = val as Record<string, unknown>;
  const messageId = typeof o.messageId === 'string' ? o.messageId.trim() : '';
  if (!messageId.length) {
    throw new TRPCError({ code: 'BAD_REQUEST', message: 'messageId is required' });
  }
  return { messageId };
}

function parseEditMessage(val: unknown): { messageId: string; body: string } {
  const { messageId } = parseMessageId(val);
  const o = val as Record<string, unknown>;
  const body = typeof o.body === 'string' ? o.body.trim() : '';
  if (!body.length) {
    throw new TRPCError({ code: 'BAD_REQUEST', message: 'body is required' });
  }
  if (body.length > MAX_MESSAGE_LENGTH) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: `Message is too long (max ${MAX_MESSAGE_LENGTH} characters)`,
    });
  }
  return { messageId, body };
}

function formatTime(date: Date): string {
  const now = new Date();
  const diffSec = Math.round((now.getTime() - date.getTime()) / 1000);
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

async function resolveCurrentUserId(
  ctx: { prisma: import('@ivy/database').PrismaClient; clerkUserId: string | null },
): Promise<string | null> {
  if (!ctx.clerkUserId) return null;
  const me = await ctx.prisma.user.findUnique({
    where: { clerkUserId: ctx.clerkUserId },
    select: { id: true },
  });
  return me?.id ?? null;
}

export const exchangeRouter = router({
  /**
   * Flat list of The Exchange messages, oldest-first, polled for near-realtime feel.
   * Includes like counts, whether the caller liked each message, and reply-to snippets.
   */
  messages: publicProcedure.query(async ({ ctx }) => {
    const rows = await ctx.prisma.exchangeMessage.findMany({
      orderBy: { createdAt: 'asc' },
      take: MAX_MESSAGES,
      include: {
        author: true,
        replyTo: { include: { author: true } },
        _count: { select: { reactions: true } },
      },
    });

    const currentUserId = await resolveCurrentUserId(ctx);

    let likedIds = new Set<string>();
    if (currentUserId && rows.length > 0) {
      const myReactions = await ctx.prisma.exchangeMessageReaction.findMany({
        where: {
          userId: currentUserId,
          messageId: { in: rows.map((r) => r.id) },
        },
        select: { messageId: true },
      });
      likedIds = new Set(myReactions.map((r) => r.messageId));
    }

    return {
      messages: rows.map((m) => ({
        id: m.id,
        authorId: m.authorId,
        name: displayNameForUser(m.author),
        authorImageUrl: m.author.imageUrl,
        time: formatTime(m.createdAt),
        createdAt: m.createdAt.toISOString(),
        body: m.body,
        editedAt: m.editedAt ? m.editedAt.toISOString() : null,
        mine: currentUserId != null && currentUserId === m.authorId,
        likeCount: m._count.reactions,
        likedByMe: likedIds.has(m.id),
        replyTo: m.replyTo
          ? {
              id: m.replyTo.id,
              name: displayNameForUser(m.replyTo.author),
              body: m.replyTo.body,
            }
          : null,
      })),
    };
  }),

  /** Toggle a 👍 reaction on a message. Returns the new liked state and count. */
  toggleReaction: protectedProcedure
    .input(parseMessageId)
    .mutation(async ({ ctx, input }) => {
      const user = await ensureUserForClerkId(ctx.prisma, ctx.clerkUserId);

      const existing = await ctx.prisma.exchangeMessageReaction.findUnique({
        where: { messageId_userId: { messageId: input.messageId, userId: user.id } },
      });

      if (existing) {
        await ctx.prisma.exchangeMessageReaction.delete({ where: { id: existing.id } });
      } else {
        await ctx.prisma.exchangeMessageReaction.create({
          data: { messageId: input.messageId, userId: user.id },
        });
      }

      const likeCount = await ctx.prisma.exchangeMessageReaction.count({
        where: { messageId: input.messageId },
      });

      return { messageId: input.messageId, likedByMe: !existing, likeCount };
    }),

  /** Send a message to The Exchange. Any signed-in member may post. */
  sendMessage: protectedProcedure
    .input(parseSendMessage)
    .mutation(async ({ ctx, input }) => {
      const user = await ensureUserForClerkId(ctx.prisma, ctx.clerkUserId);

      let replyToSnippet: { id: string; name: string; body: string } | null = null;
      if (input.replyToId) {
        const replyTarget = await ctx.prisma.exchangeMessage.findUnique({
          where: { id: input.replyToId },
          include: { author: true },
        });
        if (!replyTarget) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Reply target not found' });
        }
        replyToSnippet = {
          id: replyTarget.id,
          name: displayNameForUser(replyTarget.author),
          body: replyTarget.body,
        };
      }

      const created = await ctx.prisma.exchangeMessage.create({
        data: {
          authorId: user.id,
          body: input.body,
          replyToId: input.replyToId ?? null,
        },
        include: { author: true },
      });

      return {
        id: created.id,
        authorId: created.authorId,
        name: displayNameForUser(created.author),
        authorImageUrl: created.author.imageUrl,
        time: formatTime(created.createdAt),
        createdAt: created.createdAt.toISOString(),
        body: created.body,
        editedAt: null,
        mine: true,
        likeCount: 0,
        likedByMe: false,
        replyTo: replyToSnippet,
      };
    }),

  /** Edit the body of your own message. Sets editedAt to now. */
  editMessage: protectedProcedure
    .input(parseEditMessage)
    .mutation(async ({ ctx, input }) => {
      const user = await ensureUserForClerkId(ctx.prisma, ctx.clerkUserId);
      const message = await ctx.prisma.exchangeMessage.findUnique({
        where: { id: input.messageId },
      });
      if (!message) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Message not found' });
      }
      if (message.authorId !== user.id) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'You can only edit your own messages' });
      }
      const updated = await ctx.prisma.exchangeMessage.update({
        where: { id: input.messageId },
        data: { body: input.body, editedAt: new Date() },
      });
      return {
        messageId: updated.id,
        body: updated.body,
        editedAt: updated.editedAt!.toISOString(),
      };
    }),

  /** Permanently delete your own message. */
  deleteMessage: protectedProcedure
    .input(parseMessageId)
    .mutation(async ({ ctx, input }) => {
      const user = await ensureUserForClerkId(ctx.prisma, ctx.clerkUserId);
      const message = await ctx.prisma.exchangeMessage.findUnique({
        where: { id: input.messageId },
      });
      if (!message) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Message not found' });
      }
      if (message.authorId !== user.id) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'You can only delete your own messages' });
      }
      await ctx.prisma.exchangeMessage.delete({ where: { id: input.messageId } });
      return { messageId: input.messageId };
    }),
});
