'use client';

import { ClerkProvider } from '@clerk/nextjs';

import { TRPCProvider } from '@/lib/trpc-provider';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <TRPCProvider>{children}</TRPCProvider>
    </ClerkProvider>
  );
}
