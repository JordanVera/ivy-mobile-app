import { ensureUserForClerkId } from '../lib/clerk-user';
import { protectedProcedure, router } from '../trpc';

/**
 * Ensures the signed-in Clerk user has a row in our database (upsert from Clerk API if missing).
 * Call once after sign-in / sign-up — especially important when webhooks cannot reach your server (e.g. local dev).
 */
export const userRouter = router({
  sync: protectedProcedure.mutation(async ({ ctx }) => {
    await ensureUserForClerkId(ctx.prisma, ctx.clerkUserId);
    return { ok: true as const };
  }),
});
