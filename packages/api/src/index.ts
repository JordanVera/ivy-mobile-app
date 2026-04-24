import { router } from './trpc';
import { episodeThreadRouter } from './routers/episode-thread';
import { feedRouter } from './routers/feed';
import { healthRouter } from './routers/health';
import { hubsRouter } from './routers/hubs';
import { liveEventRouter } from './routers/live-event';
import { userRouter } from './routers/user';
import { youtubeRouter } from './routers/youtube';

export const appRouter = router({
  episodeThread: episodeThreadRouter,
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
