'use client';

import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <main style={{ display: 'flex', justifyContent: 'center', padding: 24 }}>
      <SignUp />
    </main>
  );
}
