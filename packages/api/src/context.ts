import { prisma } from '@ivy/database';

export function createTRPCContext(opts?: { clerkUserId?: string | null }) {
  return {
    prisma,
    clerkUserId: opts?.clerkUserId ?? null,
  };
}

export type Context = ReturnType<typeof createTRPCContext>;
