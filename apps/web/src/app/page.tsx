export default function HomePage() {
  return (
    <main style={{ padding: 24, maxWidth: 560 }}>
      <h1 style={{ marginTop: 0 }}>Ivy</h1>
      <p>Next.js + tRPC + Prisma monorepo web app.</p>
      <p>
        tRPC endpoint: <code>/api/trpc</code> (e.g. call <code>health.ping</code> from a client).
      </p>
    </main>
  );
}
