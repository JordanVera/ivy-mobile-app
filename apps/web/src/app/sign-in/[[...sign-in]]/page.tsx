'use client';

import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <main style={{ display: 'flex', justifyContent: 'center', padding: 24 }}>
      <SignIn />
    </main>
  );
}
