import type { Metadata } from 'next';
import { Cormorant_Garamond, DM_Sans } from 'next/font/google';

import { AppProviders } from '@/app/providers';
import { Header } from '@/components/header';

import './globals.css';

const display = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const sans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

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
    <AppProviders>
      <html lang="en" className={`${display.variable} ${sans.variable}`}>
        <Header />
        <body className="antialiased">{children}</body>
      </html>
    </AppProviders>
  );
}
