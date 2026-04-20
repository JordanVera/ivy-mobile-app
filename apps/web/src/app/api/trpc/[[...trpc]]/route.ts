import { appRouter, createTRPCContext } from '@ivy/api';
import { auth } from '@clerk/nextjs/server';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: async () => {
      const { userId } = await auth();
      return createTRPCContext({ clerkUserId: userId });
    },
  });

export { handler as GET, handler as POST };
