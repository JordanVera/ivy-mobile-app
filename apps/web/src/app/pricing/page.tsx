'use client';

import { PricingTable } from '@clerk/nextjs';

export default function PricingPage() {
  return (
    <main style={{ display: 'flex', justifyContent: 'center', padding: 24 }}>
      <PricingTable
        for="user"
        newSubscriptionRedirectUrl={
          process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
        }
      />
    </main>
  );
}
