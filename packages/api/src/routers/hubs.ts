import { TRPCError } from '@trpc/server';
import type { HubEventFormat } from '@ivy/database';

import {
  displayNameForUser,
  ensureUserForClerkId,
} from '../lib/clerk-user';
import { protectedProcedure, publicProcedure, router } from '../trpc';

const MAX_MESSAGES_PER_PAGE = 200;
const MAX_MESSAGE_LENGTH = 2000;
const MAX_EVENT_TITLE = 200;
const MAX_EVENT_DESCRIPTION = 2000;
const MAX_LOCATION_LENGTH = 500;
const MAX_EVENTS_PER_HUB = 50;

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

function parseSendMessage(val: unknown): { slug: string; body: string; replyToId?: string } {
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
  const replyToId =
    typeof o.replyToId === 'string' && o.replyToId.trim().length
      ? o.replyToId.trim()
      : undefined;
  return { slug, body, replyToId };
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

function parseIsoDateTime(val: unknown, fieldLabel: string): Date {
  if (typeof val !== 'string' || !val.trim()) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: `${fieldLabel} is required`,
    });
  }
  const d = new Date(val.trim());
  if (Number.isNaN(d.getTime())) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: `Invalid ${fieldLabel}`,
    });
  }
  return d;
}

function normalizeMeetingUrl(raw: string): string {
  const trimmed = raw.trim();
  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Invalid meeting URL',
    });
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Meeting URL must start with http:// or https://',
    });
  }
  return trimmed;
}

function parseCreateHubEvent(val: unknown): {
  slug: string;
  title: string;
  description: string | null;
  format: HubEventFormat;
  startsAt: Date;
  endsAt: Date;
  location: string | null;
  meetingUrl: string | null;
} {
  const { slug } = parseHubSlug(val);
  const o = val as Record<string, unknown>;
  const title = typeof o.title === 'string' ? o.title.trim() : '';
  if (!title.length) {
    throw new TRPCError({ code: 'BAD_REQUEST', message: 'title is required' });
  }
  if (title.length > MAX_EVENT_TITLE) {
    throw new TRPCError({ code: 'BAD_REQUEST', message: 'title is too long' });
  }

  let description: string | null = null;
  if (o.description != null) {
    const d = typeof o.description === 'string' ? o.description.trim() : '';
    if (d.length > MAX_EVENT_DESCRIPTION) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'description is too long',
      });
    }
    description = d.length ? d : null;
  }

  const formatRaw = o.format;
  if (formatRaw !== 'IN_PERSON' && formatRaw !== 'ONLINE') {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'format must be IN_PERSON or ONLINE',
    });
  }
  const format = formatRaw as HubEventFormat;

  const startsAt = parseIsoDateTime(o.startsAt, 'startsAt');
  const endsAt = parseIsoDateTime(o.endsAt, 'endsAt');
  if (endsAt.getTime() <= startsAt.getTime()) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'endsAt must be after startsAt',
    });
  }

  let location: string | null = null;
  let meetingUrl: string | null = null;

  if (format === 'IN_PERSON') {
    const loc = typeof o.location === 'string' ? o.location.trim() : '';
    if (!loc.length) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'location is required for in-person events',
      });
    }
    if (loc.length > MAX_LOCATION_LENGTH) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'location is too long',
      });
    }
    location = loc;
  } else {
    const urlRaw = typeof o.meetingUrl === 'string' ? o.meetingUrl : '';
    if (!urlRaw.trim().length) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'meetingUrl is required for online events',
      });
    }
    meetingUrl = normalizeMeetingUrl(urlRaw);
  }

  return {
    slug,
    title,
    description,
    format,
    startsAt,
    endsAt,
    location,
    meetingUrl,
  };
}

function parseSetEventRsvp(val: unknown): { eventId: string; attending: boolean } {
  if (!val || typeof val !== 'object') {
    throw new TRPCError({ code: 'BAD_REQUEST', message: 'Invalid input' });
  }
  const o = val as Record<string, unknown>;
  const eventId = typeof o.eventId === 'string' ? o.eventId.trim() : '';
  if (!eventId.length) {
    throw new TRPCError({ code: 'BAD_REQUEST', message: 'eventId is required' });
  }
  if (typeof o.attending !== 'boolean') {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'attending must be a boolean',
    });
  }
  return { eventId, attending: o.attending };
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
      include: {
        author: true,
        replyTo: { include: { author: true } },
        _count: { select: { reactions: true } },
      },
    });

    const currentUserId = await resolveCurrentUserId(ctx);

    let likedIds = new Set<string>();
    if (currentUserId && rows.length > 0) {
      const myReactions = await ctx.prisma.hubMessageReaction.findMany({
        where: {
          userId: currentUserId,
          messageId: { in: rows.map((r) => r.id) },
        },
        select: { messageId: true },
      });
      likedIds = new Set(myReactions.map((r) => r.messageId));
    }

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

      let replyToSnippet: { id: string; name: string; body: string } | null = null;
      if (input.replyToId) {
        const replyTarget = await ctx.prisma.hubMessage.findUnique({
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

      const created = await ctx.prisma.hubMessage.create({
        data: {
          hubId: hub.id,
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
        time: formatMessageTime(created.createdAt),
        createdAt: created.createdAt.toISOString(),
        body: created.body,
        editedAt: null,
        mine: true,
        likeCount: 0,
        likedByMe: false,
        replyTo: replyToSnippet,
      };
    }),

  /** Upcoming hub events (by slug), with RSVP counts and caller's RSVP state. */
  events: publicProcedure.input(parseHubSlug).query(async ({ ctx, input }) => {
    const hub = await ctx.prisma.hub.findUnique({
      where: { slug: input.slug },
      select: { id: true },
    });
    if (!hub) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Hub not found' });
    }

    const now = new Date();
    const rows = await ctx.prisma.hubEvent.findMany({
      where: { hubId: hub.id, endsAt: { gte: now } },
      orderBy: { startsAt: 'asc' },
      take: MAX_EVENTS_PER_HUB,
      include: {
        creator: true,
        _count: { select: { rsvps: true } },
      },
    });

    const currentUserId = await resolveCurrentUserId(ctx);
    let rsvpedIds = new Set<string>();
    if (currentUserId && rows.length > 0) {
      const mine = await ctx.prisma.hubEventRsvp.findMany({
        where: {
          userId: currentUserId,
          hubEventId: { in: rows.map((r) => r.id) },
        },
        select: { hubEventId: true },
      });
      rsvpedIds = new Set(mine.map((m) => m.hubEventId));
    }

    return {
      slug: input.slug,
      events: rows.map((e) => ({
        id: e.id,
        title: e.title,
        description: e.description,
        format: e.format,
        startsAt: e.startsAt.toISOString(),
        endsAt: e.endsAt.toISOString(),
        location: e.location,
        meetingUrl: e.meetingUrl,
        creatorName: displayNameForUser(e.creator),
        rsvpCount: e._count.rsvps,
        iAmGoing: rsvpedIds.has(e.id),
      })),
    };
  }),

  createEvent: protectedProcedure
    .input(parseCreateHubEvent)
    .mutation(async ({ ctx, input }) => {
      const user = await ensureUserForClerkId(ctx.prisma, ctx.clerkUserId);
      const hub = await ctx.prisma.hub.findUnique({ where: { slug: input.slug } });
      if (!hub) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Hub not found' });
      }

      const membership = await ctx.prisma.hubMembership.findUnique({
        where: { hubId_userId: { hubId: hub.id, userId: user.id } },
      });
      if (!membership) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Join this hub before planning an event.',
        });
      }

      const created = await ctx.prisma.hubEvent.create({
        data: {
          hubId: hub.id,
          creatorId: user.id,
          title: input.title,
          description: input.description,
          format: input.format,
          startsAt: input.startsAt,
          endsAt: input.endsAt,
          location: input.location,
          meetingUrl: input.meetingUrl,
        },
        include: {
          creator: true,
          _count: { select: { rsvps: true } },
        },
      });

      return {
        id: created.id,
        title: created.title,
        description: created.description,
        format: created.format,
        startsAt: created.startsAt.toISOString(),
        endsAt: created.endsAt.toISOString(),
        location: created.location,
        meetingUrl: created.meetingUrl,
        creatorName: displayNameForUser(created.creator),
        rsvpCount: created._count.rsvps,
        iAmGoing: false,
      };
    }),

  /** Edit the body of your own hub message. Sets editedAt to now. */
  editMessage: protectedProcedure
    .input(parseEditMessage)
    .mutation(async ({ ctx, input }) => {
      const user = await ensureUserForClerkId(ctx.prisma, ctx.clerkUserId);
      const message = await ctx.prisma.hubMessage.findUnique({
        where: { id: input.messageId },
      });
      if (!message) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Message not found' });
      }
      if (message.authorId !== user.id) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'You can only edit your own messages' });
      }
      const updated = await ctx.prisma.hubMessage.update({
        where: { id: input.messageId },
        data: { body: input.body, editedAt: new Date() },
      });
      return {
        messageId: updated.id,
        body: updated.body,
        editedAt: updated.editedAt!.toISOString(),
      };
    }),

  /** Permanently delete your own hub message. */
  deleteMessage: protectedProcedure
    .input(parseMessageId)
    .mutation(async ({ ctx, input }) => {
      const user = await ensureUserForClerkId(ctx.prisma, ctx.clerkUserId);
      const message = await ctx.prisma.hubMessage.findUnique({
        where: { id: input.messageId },
      });
      if (!message) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Message not found' });
      }
      if (message.authorId !== user.id) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'You can only delete your own messages' });
      }
      await ctx.prisma.hubMessage.delete({ where: { id: input.messageId } });
      return { messageId: input.messageId };
    }),

  /** Toggle a 👍 reaction on a hub message. */
  toggleReaction: protectedProcedure
    .input(parseMessageId)
    .mutation(async ({ ctx, input }) => {
      const user = await ensureUserForClerkId(ctx.prisma, ctx.clerkUserId);

      const existing = await ctx.prisma.hubMessageReaction.findUnique({
        where: { messageId_userId: { messageId: input.messageId, userId: user.id } },
      });

      if (existing) {
        await ctx.prisma.hubMessageReaction.delete({ where: { id: existing.id } });
      } else {
        await ctx.prisma.hubMessageReaction.create({
          data: { messageId: input.messageId, userId: user.id },
        });
      }

      const likeCount = await ctx.prisma.hubMessageReaction.count({
        where: { messageId: input.messageId },
      });

      return { messageId: input.messageId, likedByMe: !existing, likeCount };
    }),

  /** All members of a hub, ordered by join date (oldest first). */
  members: publicProcedure.input(parseHubSlug).query(async ({ ctx, input }) => {
    const hub = await ctx.prisma.hub.findUnique({
      where: { slug: input.slug },
      select: { id: true },
    });
    if (!hub) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Hub not found' });
    }

    const memberships = await ctx.prisma.hubMembership.findMany({
      where: { hubId: hub.id },
      orderBy: { joinedAt: 'asc' },
      include: { user: true },
    });

    return memberships.map((m) => ({
      userId: m.user.id,
      name: displayNameForUser(m.user),
      email: m.user.email,
      imageUrl: m.user.imageUrl,
      joinedAppAt: m.user.createdAt.toISOString(),
      joinedHubAt: m.joinedAt.toISOString(),
    }));
  }),

  setEventRsvp: protectedProcedure
    .input(parseSetEventRsvp)
    .mutation(async ({ ctx, input }) => {
      const user = await ensureUserForClerkId(ctx.prisma, ctx.clerkUserId);
      const event = await ctx.prisma.hubEvent.findUnique({
        where: { id: input.eventId },
        select: { id: true, hubId: true },
      });
      if (!event) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Event not found' });
      }

      const membership = await ctx.prisma.hubMembership.findUnique({
        where: { hubId_userId: { hubId: event.hubId, userId: user.id } },
      });
      if (!membership) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Join this hub to RSVP.',
        });
      }

      if (input.attending) {
        await ctx.prisma.hubEventRsvp.upsert({
          where: {
            hubEventId_userId: { hubEventId: event.id, userId: user.id },
          },
          update: {},
          create: { hubEventId: event.id, userId: user.id },
        });
      } else {
        await ctx.prisma.hubEventRsvp.deleteMany({
          where: { hubEventId: event.id, userId: user.id },
        });
      }

      const count = await ctx.prisma.hubEventRsvp.count({
        where: { hubEventId: event.id },
      });

      return { eventId: event.id, attending: input.attending, rsvpCount: count };
    }),
});
