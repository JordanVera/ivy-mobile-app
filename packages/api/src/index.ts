import { router } from './trpc';
import { feedRouter } from './routers/feed';
import { healthRouter } from './routers/health';
import { liveEventRouter } from './routers/live-event';
import { userRouter } from './routers/user';
import { youtubeRouter } from './routers/youtube';

export const appRouter = router({
  feed: feedRouter,
  health: healthRouter,
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
