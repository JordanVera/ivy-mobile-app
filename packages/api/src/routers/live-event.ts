import { publicProcedure, router } from '../trpc';

/** Treat the event as "live" this many milliseconds before the scheduled start. */
const LIVE_EARLY_BUFFER_MS = 10 * 60 * 1000;
/** Keep showing "live" this long after the scheduled end, in case the stream runs over. */
const LIVE_LATE_BUFFER_MS = 30 * 60 * 1000;

export type LiveEventStatus = 'upcoming' | 'live' | 'ended';

function statusFor(
  now: Date,
  startsAt: Date,
  durationMinutes: number,
): LiveEventStatus {
  const startMs = startsAt.getTime();
  const endMs = startMs + durationMinutes * 60 * 1000;
  const liveWindowStart = startMs - LIVE_EARLY_BUFFER_MS;
  const liveWindowEnd = endMs + LIVE_LATE_BUFFER_MS;
  const nowMs = now.getTime();
  if (nowMs < liveWindowStart) return 'upcoming';
  if (nowMs <= liveWindowEnd) return 'live';
  return 'ended';
}

export const liveEventRouter = router({
  /**
   * Returns the next live event — either currently-live (within the buffer window) or
   * the soonest upcoming one. Returns `null` when nothing is scheduled.
   */
  next: publicProcedure.query(async ({ ctx }) => {
    const now = new Date();
    const stillLiveAfter = new Date(now.getTime() - LIVE_LATE_BUFFER_MS);

    const event = await ctx.prisma.liveEvent.findFirst({
      where: { startsAt: { gte: stillLiveAfter } },
      orderBy: { startsAt: 'asc' },
    });

    if (!event) return null;

    const status = statusFor(now, event.startsAt, event.durationMinutes);
    const endsAt = new Date(
      event.startsAt.getTime() + event.durationMinutes * 60 * 1000,
    );

    return {
      id: event.id,
      title: event.title,
      description: event.description,
      youtubeVideoId: event.youtubeVideoId,
      startsAt: event.startsAt.toISOString(),
      endsAt: endsAt.toISOString(),
      durationMinutes: event.durationMinutes,
      status,
    };
  }),
});
