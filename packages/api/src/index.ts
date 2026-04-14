import { router } from './trpc';
import { healthRouter } from './routers/health';
import { youtubeRouter } from './routers/youtube';

export const appRouter = router({
  health: healthRouter,
  youtube: youtubeRouter,
});

export type AppRouter = typeof appRouter;

export { createTRPCContext } from './context';
