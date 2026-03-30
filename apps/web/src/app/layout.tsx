import type { Metadata } from 'next';

import { TRPCProvider } from '@/lib/trpc-provider';

import './globals.css';

export const metadata: Metadata = {
  title: 'Ivy',
  description: 'Ivy web',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <TRPCProvider>{children}</TRPCProvider>
      </body>
    </html>
  );
}
