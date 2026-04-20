import { router } from './trpc';
import { feedRouter } from './routers/feed';
import { healthRouter } from './routers/health';
import { userRouter } from './routers/user';
import { youtubeRouter } from './routers/youtube';

export const appRouter = router({
  feed: feedRouter,
  health: healthRouter,
  user: userRouter,
  youtube: youtubeRouter,
});

export type AppRouter = typeof appRouter;

export { createTRPCContext } from './context';
export {
  deleteUserByClerkId,
  upsertUserFromClerkUserJSON,
} from './lib/clerk-user';
