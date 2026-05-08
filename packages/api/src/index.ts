import { episodeThreadRouter } from './routers/episode-thread';
import { exchangeRouter } from './routers/exchange';
import { feedRouter } from './routers/feed';
import { healthRouter } from './routers/health';
import { hubsRouter } from './routers/hubs';
import { liveEventRouter } from './routers/live-event';
import { userRouter } from './routers/user';
import { youtubeRouter } from './routers/youtube';
import { router } from './trpc';

export const appRouter = router({
  episodeThread: episodeThreadRouter,
  exchange: exchangeRouter,
  feed: feedRouter,
  health: healthRouter,
  hubs: hubsRouter,
  liveEvent: liveEventRouter,
  user: userRouter,
  youtube: youtubeRouter,
});

export type AppRouter = typeof appRouter;

export { createTRPCContext } from './context';
export {
  deleteUserByClerkId,
  refreshUserFromClerk,
  upsertUserFromClerkUserJSON,
} from './lib/clerk-user';
