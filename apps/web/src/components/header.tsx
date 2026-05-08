'use client';
import { useAuth, UserButton } from '@clerk/nextjs';
import Link from 'next/link';

export const Header = () => {
  const { isLoaded, userId } = useAuth();
  return (
    <header className="relative z-10 border-b border-white/[0.06] bg-[#060607]/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-6 sm:px-8">
        <Link
          className="text-sm font-semibold tracking-[0.25em] text-zinc-100"
          href="/"
        >
          IVY
        </Link>
        <nav
          aria-label="Primary"
          className="flex flex-wrap items-center justify-end gap-3 sm:gap-6"
        >
          <Link
            className="hidden text-xs font-medium uppercase tracking-[0.18em] text-zinc-500 transition hover:text-zinc-300 sm:inline"
            href="/pricing"
          >
            Pricing
          </Link>
          {isLoaded && userId ? (
            <UserButton />
          ) : isLoaded ? (
            <>
              <Link
                className="rounded-full border border-white/15 bg-transparent px-4 py-2 text-xs font-medium uppercase tracking-[0.14em] text-zinc-200 transition hover:border-[var(--ivy-accent)]/50 hover:text-white"
                href="/sign-in"
              >
                Sign in
              </Link>
              <Link
                className="rounded-full bg-gradient-to-r from-[var(--ivy-accent-deep)] via-[var(--ivy-accent)] to-[var(--ivy-accent-deep)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--ivy-on-accent)] shadow-[0_0_24px_-4px_rgba(0,250,154,0.45)] transition hover:brightness-110"
                href="/sign-up"
              >
                Sign up
              </Link>
            </>
          ) : (
            <span
              className="h-9 w-24 rounded-full bg-zinc-800/50"
              aria-hidden
            />
          )}
        </nav>
      </div>
    </header>
  );
};
