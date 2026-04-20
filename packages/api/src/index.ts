import { router } from './trpc';
import { feedRouter } from './routers/feed';
import { healthRouter } from './routers/health';
import { youtubeRouter } from './routers/youtube';

export const appRouter = router({
  feed: feedRouter,
  health: healthRouter,
  youtube: youtubeRouter,
});

export type AppRouter = typeof appRouter;

export { createTRPCContext } from './context';
export {
  deleteUserByClerkId,
  upsertUserFromClerkUserJSON,
} from './lib/clerk-user';
