import { prisma } from '@ivy/database';

export function createTRPCContext() {
  return { prisma };
}

export type Context = ReturnType<typeof createTRPCContext>;
