import { auth, verifyToken } from '@clerk/nextjs/server';

/**
 * Resolves the Clerk user id for an incoming API request.
 * - Mobile / Expo: `Authorization: Bearer <session JWT>` — verified with `verifyToken` (auth() alone may not see the user for cross-origin API calls).
 * - Browser: session cookies — falls back to `auth()`.
 */
export async function getClerkUserIdFromApiRequest(req: Request): Promise<string | null> {
  const secret = process.env.CLERK_SECRET_KEY?.trim();
  const authHeader = req.headers.get('authorization');

  if (secret && authHeader?.toLowerCase().startsWith('bearer ')) {
    const token = authHeader.slice(7).trim();
    if (token.length > 0) {
      try {
        const payload = await verifyToken(token, { secretKey: secret });
        const sub = payload.sub;
        if (typeof sub === 'string' && sub.length > 0) {
          return sub;
        }
      } catch {
        // Fall through to cookie-based auth (e.g. web client without Bearer).
      }
    }
  }

  const { userId } = await auth();
  return userId;
}
