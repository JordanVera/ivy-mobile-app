import { useAuth } from '@clerk/expo';
import { useEffect } from 'react';

import { trpc } from '@/lib/trpc';

/**
 * After sign-in, upserts the Clerk user into our database (webhooks often miss localhost).
 */
export function ClerkUserSync() {
  const { isSignedIn, isLoaded } = useAuth();
  const { mutate } = trpc.user.sync.useMutation();

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    mutate();
  }, [isLoaded, isSignedIn, mutate]);

  return null;
}
