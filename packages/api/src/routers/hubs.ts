import { TRPCError } from '@trpc/server';

import {
  displayNameForUser,
  ensureUserForClerkId,
} from '../lib/clerk-user';
import { protectedProcedure, publicProcedure, router } from '../trpc';

const MAX_MESSAGES_PER_PAGE = 200;
const MAX_MESSAGE_LENGTH = 2000;

function parseHubSlug(val: unknown): { slug: string } {
  if (!val || typeof val !== 'object') {
    throw new TRPCError({ code: 'BAD_REQUEST', message: 'Invalid input' });
  }
  const o = val as Record<string, unknown>;
  const slug = typeof o.slug === 'string' ? o.slug.trim() : '';
  if (!slug.length || slug.length > 64 || !/^[a-z0-9-]+$/.test(slug)) {
    throw new TRPCError({ code: 'BAD_REQUEST', message: 'Invalid hub slug' });
  }
  return { slug };
}

function parseSendMessage(val: unknown): { slug: string; body: string } {
  const { slug } = parseHubSlug(val);
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
  return { slug, body };
}

function formatMessageTime(date: Date): string {
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

export const hubsRouter = router({
  /**
   * Returns every hub plus aggregate stats and (when signed in) whether the
   * caller has joined and has notifications turned on. Used by The Nest tab.
   */
  list: publicProcedure.query(async ({ ctx }) => {
    const hubs = await ctx.prisma.hub.findMany({
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      include: {
        _count: { select: { memberships: true, messages: true } },
      },
    });

    const currentUserId = await resolveCurrentUserId(ctx);
    const myMemberships = currentUserId
      ? await ctx.prisma.hubMembership.findMany({
          where: { userId: currentUserId, hubId: { in: hubs.map((h) => h.id) } },
          select: { hubId: true, notificationsEnabled: true },
        })
      : [];
    const membershipByHub = new Map(
      myMemberships.map((m) => [m.hubId, m]),
    );

    return hubs.map((hub) => {
      const membership = membershipByHub.get(hub.id) ?? null;
      return {
        id: hub.id,
        slug: hub.slug,
        name: hub.name,
        tagline: hub.tagline,
        description: hub.description,
        icon: hub.icon,
        memberCount: hub._count.memberships,
        messageCount: hub._count.messages,
        joined: membership != null,
        notificationsEnabled: membership?.notificationsEnabled ?? false,
      };
    });
  }),

  /** Single hub by slug (for the hub chat screen header). */
  get: publicProcedure.input(parseHubSlug).query(async ({ ctx, input }) => {
    const hub = await ctx.prisma.hub.findUnique({
      where: { slug: input.slug },
      include: {
        _count: { select: { memberships: true, messages: true } },
      },
    });
    if (!hub) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Hub not found' });
    }
    const currentUserId = await resolveCurrentUserId(ctx);
    let joined = false;
    let notificationsEnabled = false;
    if (currentUserId) {
      const m = await ctx.prisma.hubMembership.findUnique({
        where: { hubId_userId: { hubId: hub.id, userId: currentUserId } },
        select: { notificationsEnabled: true },
      });
      joined = m != null;
      notificationsEnabled = m?.notificationsEnabled ?? false;
    }

    return {
      id: hub.id,
      slug: hub.slug,
      name: hub.name,
      tagline: hub.tagline,
      description: hub.description,
      icon: hub.icon,
      memberCount: hub._count.memberships,
      messageCount: hub._count.messages,
      joined,
      notificationsEnabled,
    };
  }),

  join: protectedProcedure.input(parseHubSlug).mutation(async ({ ctx, input }) => {
    const user = await ensureUserForClerkId(ctx.prisma, ctx.clerkUserId);
    const hub = await ctx.prisma.hub.findUnique({ where: { slug: input.slug } });
    if (!hub) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Hub not found' });
    }
    await ctx.prisma.hubMembership.upsert({
      where: { hubId_userId: { hubId: hub.id, userId: user.id } },
      update: {},
      create: { hubId: hub.id, userId: user.id },
    });
    return { joined: true as const };
  }),

  leave: protectedProcedure.input(parseHubSlug).mutation(async ({ ctx, input }) => {
    const user = await ensureUserForClerkId(ctx.prisma, ctx.clerkUserId);
    const hub = await ctx.prisma.hub.findUnique({ where: { slug: input.slug } });
    if (!hub) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Hub not found' });
    }
    await ctx.prisma.hubMembership.deleteMany({
      where: { hubId: hub.id, userId: user.id },
    });
    return { joined: false as const };
  }),

  /**
   * Flat list of messages for a hub, oldest first. Polled from the client
   * for near-realtime feel (mirrors `episodeThread.list` pattern).
   */
  messages: publicProcedure.input(parseHubSlug).query(async ({ ctx, input }) => {
    const hub = await ctx.prisma.hub.findUnique({
      where: { slug: input.slug },
      select: { id: true, slug: true, name: true },
    });
    if (!hub) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Hub not found' });
    }

    const rows = await ctx.prisma.hubMessage.findMany({
      where: { hubId: hub.id },
      orderBy: { createdAt: 'asc' },
      take: MAX_MESSAGES_PER_PAGE,
      include: { author: true },
    });

    const currentUserId = await resolveCurrentUserId(ctx);

    return {
      slug: hub.slug,
      messages: rows.map((m) => ({
        id: m.id,
        authorId: m.authorId,
        name: displayNameForUser(m.author),
        authorImageUrl: m.author.imageUrl,
        time: formatMessageTime(m.createdAt),
        createdAt: m.createdAt.toISOString(),
        body: m.body,
        mine: currentUserId != null && currentUserId === m.authorId,
      })),
    };
  }),

  /**
   * Send a message to a hub. Auto-joins the caller as a side-effect so members
   * who chat are tracked even if they skipped the explicit "Join" tap.
   */
  sendMessage: protectedProcedure
    .input(parseSendMessage)
    .mutation(async ({ ctx, input }) => {
      const user = await ensureUserForClerkId(ctx.prisma, ctx.clerkUserId);
      const hub = await ctx.prisma.hub.findUnique({
        where: { slug: input.slug },
      });
      if (!hub) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Hub not found' });
      }

      await ctx.prisma.hubMembership.upsert({
        where: { hubId_userId: { hubId: hub.id, userId: user.id } },
        update: {},
        create: { hubId: hub.id, userId: user.id },
      });

      const created = await ctx.prisma.hubMessage.create({
        data: {
          hubId: hub.id,
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
        time: formatMessageTime(created.createdAt),
        createdAt: created.createdAt.toISOString(),
        body: created.body,
        mine: true,
      };
    }),
});
