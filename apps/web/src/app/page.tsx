'use client';

import { SignOutButton } from '@clerk/nextjs';

export default function HomePage() {
  return (
    <main style={{ padding: 24, maxWidth: 560 }}>
      <h1 style={{ marginTop: 0 }}>Ivy</h1>
      <p>Next.js + tRPC + Prisma monorepo web app.</p>
      <p className="text-green-500">
        tRPC endpoint: <code>/api/trpc</code> (e.g. call{' '}
        <code>health.ping</code> from a client).
      </p>
      <p style={{ marginTop: 24 }}>
        <SignOutButton signOutOptions={{ redirectUrl: '/sign-in' }}>
          <button
            className="rounded-md bg-red-500 text-white px-4 py-2 cursor-pointer"
            type="button"
          >
            Sign out
          </button>
        </SignOutButton>
      </p>
    </main>
  );
}
