---
name: Clerk auth web mobile
overview: Wire Clerk into the Next.js web app (middleware + hosted SignIn/SignUp UI + env) and the Expo app (`@clerk/expo` + secure token cache + custom sign-in/sign-up screens replacing the mock auth context), while keeping `/api/trpc` reachable from mobile until you optionally add JWT forwarding.
todos:
  - id: web-env-clerk-provider
    content: Add Clerk env vars to web .env.example; wrap apps/web/src/app/layout.tsx with ClerkProvider; add src/middleware.ts (public sign-in/up; exclude /api from protect).
    status: completed
  - id: web-sign-routes-trpc
    content: Add sign-in/[[...sign-in]] and sign-up/[[...sign-up]] pages with SignIn/SignUp; optional credentials include on trpc httpBatchLink.
    status: completed
  - id: mobile-clerk-install-layout
    content: expo install @clerk/expo expo-secure-store; ClerkProvider + tokenCache in _layout.tsx; replace splash gating with Clerk isLoaded.
    status: completed
  - id: mobile-auth-screens
    content: Rewrite (auth) layout redirect; implement login + sign-up with useSignIn/useSignUp; update index + profile sign-out; remove auth-context.tsx.
    status: completed
  - id: mobile-env-example
    content: Document EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in apps/mobile/.env.example.
    status: completed
isProject: false
---

# Clerk authentication for web and mobile

## Security and configuration (do this first)

- **Do not commit secrets.** Put keys only in local env files (e.g. [`apps/web/.env.local`](apps/web/.env.local), [`apps/mobile/.env`](apps/mobile/.env) or `.env.local` per your Expo setup). Extend [`apps/web/.env.example`](apps/web/.env.example) and [`apps/mobile/.env.example`](apps/mobile/.env.example) with **placeholder** variable names only.
- **Web requires two keys:** `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and **`CLERK_SECRET_KEY`** (from [Clerk Dashboard → API keys](https://dashboard.clerk.com/~/api-keys)). The secret key is server-only; without it, session validation and middleware behavior will not work in production-like setups.
- **Mobile:** only `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` is required at runtime. In the dashboard, open **Native applications** and ensure the **Native API** is enabled (required per [Clerk Expo quickstart](https://clerk.com/docs/quickstarts/expo)).
- You shared a `pk_test_…` key in chat; rotating it in the dashboard is optional for test keys but good hygiene.

## Web ([`apps/web`](apps/web)) — Next.js App Router

[`@clerk/nextjs`](apps/web/package.json) is already a dependency; integrate it as follows:

1. **`ClerkProvider` in root layout** — Wrap the existing tree in [`apps/web/src/app/layout.tsx`](apps/web/src/app/layout.tsx) so `ClerkProvider` wraps `TRPCProvider` and `children` (Clerk docs: root layout).

2. **Middleware for “sign in first”** — Add [`apps/web/src/middleware.ts`](apps/web/src/middleware.ts) using `clerkMiddleware` and `createRouteMatcher` from `@clerk/nextjs/server`:
   - **Public routes:** `/sign-in(.*)`, `/sign-up(.*)` (match your chosen paths).
   - **Important:** Treat **`/api/*` as not subject to `auth.protect()`** for now. Your Expo app calls [`${EXPO_PUBLIC_API_URL}/api/trpc`](apps/mobile/src/lib/trpc.tsx) **without** Clerk session cookies; protecting `/api/trpc` in middleware would break mobile until you add a `Authorization: Bearer <jwt>` header from `getToken()` and validate it server-side. Pages remain protected; API stays open at the edge until you tighten it deliberately.

3. **Sign-in and sign-up pages** — Add App Router routes that render Clerk’s prebuilt components (supported on Next.js), e.g.:
   - [`apps/web/src/app/sign-in/[[...sign-in]]/page.tsx`](apps/web/src/app/sign-in/[[...sign-in]]/page.tsx) → `<SignIn />`
   - [`apps/web/src/app/sign-up/[[...sign-up]]/page.tsx`](apps/web/src/app/sign-up/[[...sign-up]]/page.tsx) → `<SignUp />`
   - Import `SignIn` / `SignUp` from `@clerk/nextjs` (confirmed exported in v7.1.0 typings).

4. **Optional but recommended for cookies:** In [`apps/web/src/lib/trpc-client.ts`](apps/web/src/lib/trpc-client.ts), configure `httpBatchLink` with a custom `fetch` that sets **`credentials: 'include'`** so browser tRPC calls send Clerk session cookies when you later enforce auth inside procedures.

5. **Home behavior** — Keep [`apps/web/src/app/page.tsx`](apps/web/src/app/page.tsx) as the post-login experience; unauthenticated visitors hitting `/` will be redirected to sign-in by middleware (Clerk default sign-in URL can be set via env or component props if needed).

**Reference:** [Clerk Next.js quickstart](https://clerk.com/docs/quickstarts/nextjs) (your dashboard app links to the same instance-specific docs).

## Mobile ([`apps/mobile`](apps/mobile)) — Expo Router

1. **Install** (Expo-compatible versions): `npx expo install @clerk/expo expo-secure-store` per [Clerk Expo quickstart](https://clerk.com/docs/quickstarts/expo).

2. **Root provider** — In [`apps/mobile/src/app/_layout.tsx`](apps/mobile/src/app/_layout.tsx), wrap the tree with:
   - `ClerkProvider` from `@clerk/expo`
   - `tokenCache` from `@clerk/expo/token-cache`
   - `publishableKey` from `process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` (throw a clear error if missing in dev).
   - Remove [`AuthProvider`](apps/mobile/src/contexts/auth-context.tsx) and use Clerk’s session loading for the splash gate: e.g. `useAuth()` from `@clerk/expo` with `isLoaded` instead of mock `isReady`.

3. **Auth group layout** — Update [`apps/mobile/src/app/(auth)/_layout.tsx`](<apps/mobile/src/app/(auth)/_layout.tsx>) to match Clerk’s pattern: if `isLoaded` and `isSignedIn`, `<Redirect href="/home" />`; otherwise render the stack.

4. **Sign-in / sign-up screens** — Clerk’s **prebuilt `<SignIn />` / `<SignUp />` are for Expo web only**; on iOS/Android you use **custom flows** or **beta native components** (dev build). For broad compatibility (including Expo Go), implement **email/password (and optional verification)** with `useSignIn` / `useSignUp` from `@clerk/expo` following the [custom flow](https://clerk.com/docs/quickstarts/expo) section of the quickstart:
   - Evolve [`apps/mobile/src/app/(auth)/login.tsx`](<apps/mobile/src/app/(auth)/login.tsx>) into a real sign-in screen (keep Ivy styling: `GoldGradientButton`, `IvyHeading`, etc.).
   - Add `sign-up.tsx` in the same group with a parallel flow and a **link** between the two routes.
   - Register both screens in [`(auth)/_layout.tsx`](<apps/mobile/src/app/(auth)/_layout.tsx>).

5. **Entry redirect** — Update [`apps/mobile/src/app/index.tsx`](apps/mobile/src/app/index.tsx) to use Clerk’s `isSignedIn` / `isLoaded`: signed-in → `/home`, else → `/login` (or `/sign-in` if you rename the file).

6. **Profile sign-out** — In [`apps/mobile/src/app/(tabs)/profile.tsx`](<apps/mobile/src/app/(tabs)/profile.tsx>), replace mock `signOut` with `useClerk().signOut()` from `@clerk/expo`, then `router.replace` to the auth route.

7. **Delete** [`apps/mobile/src/contexts/auth-context.tsx`](apps/mobile/src/contexts/auth-context.tsx) once all imports are migrated.

8. **iOS native deps** — After adding `@clerk/expo`, run `npx pod-install` (or `expo prebuild` workflow as you already use) so native modules align; your repo already references Clerk iOS tooling in places—expect lockfile and pod updates.

## Optional next steps (not required for “see auth first”)

- **tRPC + Clerk:** Extend [`packages/api/src/context.ts`](packages/api/src/context.ts) / [`apps/web/src/app/api/trpc/[[...trpc]]/route.ts`](apps/web/src/app/api/trpc/[[...trpc]]/route.ts) to pass `auth()` from `@clerk/nextjs/server` into context; on mobile, add `getToken()` to [`httpBatchLink` headers](apps/mobile/src/lib/trpc.tsx) and verify JWT with `@clerk/backend` in the API route. Then you can protect `/api/trpc` in middleware or per-procedure.
- **Native prebuilt UI:** If you adopt dev builds, consider Clerk’s beta [`AuthView`](https://clerk.com/docs/reference/expo/native-components/overview) to replace custom forms later.

## Architecture (high level)

```mermaid
flowchart LR
  subgraph web [Next_web]
    MW[middleware_auth_protect_pages]
    SI[sign-in_sign-up_routes]
    HP[protected_home]
    MW --> SI
    MW --> HP
    API["/api/trpc_open_at_edge_initially"]
  end
  subgraph mobile [Expo_mobile]
    CP[ClerkProvider_tokenCache]
    AUTH[(auth)_sign-in_sign-up]
    TABS[(tabs)_app]
    CP --> AUTH
    CP --> TABS
    mobile --> API
  end
```
