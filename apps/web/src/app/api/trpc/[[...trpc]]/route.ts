import { appRouter, createTRPCContext } from '@ivy/api';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';

import { getClerkUserIdFromApiRequest } from '@/lib/clerk-request-auth';

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: async ({ req: incoming }) => {
      const clerkUserId = await getClerkUserIdFromApiRequest(incoming);
      return createTRPCContext({ clerkUserId });
    },
  });

export { handler as GET, handler as POST };
