'use client';

import { useAuth } from '@clerk/nextjs';
import Link from 'next/link';

const IOS_STORE_URL = process.env.NEXT_PUBLIC_IOS_APP_URL;
const ANDROID_STORE_URL = process.env.NEXT_PUBLIC_ANDROID_APP_URL;

function StoreBadge({
  href,
  children,
  subtitle,
  title,
}: {
  href: string;
  children: React.ReactNode;
  subtitle: string;
  title: string;
}) {
  return (
    <a
      className="group flex min-w-[200px] flex-1 items-center gap-3 rounded-xl border border-white/12 bg-zinc-900/60 px-5 py-3.5 text-left shadow-[0_0_40px_-12px_rgba(0,250,154,0.35)] backdrop-blur-md transition hover:border-[var(--ivy-accent)]/40 hover:bg-zinc-900/80"
      href={href}
      rel="noopener noreferrer"
      target="_blank"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center text-[var(--ivy-accent)] transition group-hover:scale-105">
        {children}
      </span>
      <span className="min-w-0">
        <span className="block text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-500">
          {subtitle}
        </span>
        <span className="block truncate font-medium text-zinc-50">{title}</span>
      </span>
    </a>
  );
}

export default function HomePage() {
  const { isLoaded, userId } = useAuth();

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#060607] text-zinc-100">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_70%_-10%,rgba(0,250,154,0.14),transparent_55%),radial-gradient(ellipse_50%_40%_at_10%_90%,rgba(0,154,101,0.12),transparent_50%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 top-1/3 h-[420px] w-[420px] rounded-full bg-[var(--ivy-accent)]/5 blur-3xl"
      />

      <main className="relative z-10 mx-auto grid max-w-6xl gap-14 px-6 py-14 sm:gap-16 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center lg:py-20">
        <div className="max-w-xl lg:max-w-none">
          <p className="mb-5 text-xs font-medium uppercase tracking-[0.35em] text-[var(--ivy-accent)]">
            The app
          </p>
          <h1
            className="text-[clamp(2.5rem,6vw,4rem)] font-light leading-[1.05] tracking-[-0.02em] text-white"
            style={{ fontFamily: 'var(--font-display), Georgia, serif' }}
          >
            Elevate every&nbsp;session.
          </h1>
          <p className="mt-6 max-w-md text-base leading-relaxed text-zinc-400">
            Download Ivy for a focused, editorial experience—calm surfaces,
            crisp mint accents, and the same refined feel you already know from
            mobile.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <StoreBadge
              href={
                IOS_STORE_URL && IOS_STORE_URL.length > 0
                  ? IOS_STORE_URL
                  : 'https://apps.apple.com/'
              }
              subtitle="Download on the"
              title="App Store"
            >
              <svg
                aria-hidden
                className="h-7 w-7"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.18 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
              </svg>
            </StoreBadge>
            <StoreBadge
              href={
                ANDROID_STORE_URL && ANDROID_STORE_URL.length > 0
                  ? ANDROID_STORE_URL
                  : 'https://play.google.com/store'
              }
              subtitle="Get it on"
              title="Google Play"
            >
              <svg aria-hidden className="h-6 w-6" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.001 5.686a.996.996 0 01-1.257-.227l2.304-2.303 6.652-5.458zm6.93-1.704l-3.177 1.832-2.553-2.553 2.548-2.548 3.176 1.833a.5.5 0 010 .436zm-8.068 1.704l-2.302 2.303a1 1 0 01-1.257.227L3.61 12 9.361 6.315a.994.994 0 011.257.227l2.302 2.302z"
                />
              </svg>
            </StoreBadge>
          </div>
        </div>

        <div className="relative mx-auto flex w-full max-w-[320px] justify-center lg:mx-0 lg:max-w-none">
          <div
            aria-hidden
            className="absolute left-1/2 top-1/2 h-[min(100%,420px)] w-[min(100%,420px)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[var(--ivy-accent)]/20 bg-gradient-to-br from-[var(--ivy-accent)]/15 via-transparent to-[var(--ivy-accent-deep)]/10"
          />
          <div className="relative w-[min(100%,280px)]">
            <div className="aspect-[9/19] rounded-[2.5rem] border border-zinc-700/80 bg-zinc-950 p-2 shadow-[0_32px_80px_-24px_rgba(0,0,0,0.85),0_0_0_1px_rgba(255,255,255,0.06)_inset]">
              <div className="relative flex h-full flex-col overflow-hidden rounded-[2rem] bg-gradient-to-b from-zinc-900 to-black">
                <div className="flex items-center justify-between px-5 pb-3 pt-6">
                  <span className="h-1 w-8 rounded-full bg-zinc-700" />
                  <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-500">
                    Live
                  </span>
                </div>
                <div className="mx-4 rounded-xl bg-zinc-800/50 p-3">
                  <div className="mb-2 flex items-end justify-between gap-2">
                    <span
                      className="text-2xl font-light text-white"
                      style={{
                        fontFamily: 'var(--font-display), Georgia, serif',
                      }}
                    >
                      Now
                    </span>
                    <span className="text-xs text-[var(--ivy-accent)]">
                      +2.4%
                    </span>
                  </div>
                  <div className="flex h-14 items-end gap-0.5">
                    {[40, 65, 45, 78, 55, 88, 62, 92, 70].map((h, i) => (
                      <span
                        key={i}
                        className="flex-1 rounded-sm bg-gradient-to-t from-[var(--ivy-accent-deep)]/30 to-[var(--ivy-accent)]/90"
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                </div>
                <div className="mt-auto space-y-2 px-4 pb-6 pt-4">
                  {['Featured', 'Episodes', 'Threads'].map((label, i) => (
                    <div
                      key={label}
                      className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-zinc-900/80 px-3 py-2.5"
                    >
                      <span className="text-xs text-zinc-400">{label}</span>
                      <span
                        className="h-1.5 w-1.5 rounded-full bg-[var(--ivy-accent)]"
                        style={{ opacity: 1 - i * 0.25 }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="relative z-10 border-t border-white/[0.06] px-6 py-8 sm:px-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-center text-xs text-zinc-600 sm:flex-row sm:text-left">
          <span style={{ fontFamily: 'var(--font-display), Georgia, serif' }}>
            Ivy
          </span>
          <div className="flex flex-wrap justify-center gap-6 sm:justify-end">
            <Link className="transition hover:text-zinc-400" href="/pricing">
              Pricing
            </Link>
            <Link className="transition hover:text-zinc-400" href="/sign-in">
              Sign in
            </Link>
            <Link className="transition hover:text-zinc-400" href="/sign-up">
              Sign up
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
