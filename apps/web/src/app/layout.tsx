import type { Metadata } from 'next';

import { AppProviders } from '@/app/providers';

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
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
