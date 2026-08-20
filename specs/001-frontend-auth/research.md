# Research: Frontend Authentication & Centralized API Client

**Feature**: `001-frontend-auth` | **Date**: 2026-08-20

## R1: Supabase Auth Browser SDK Integration

**Decision**: Use `@supabase/supabase-js` v2 browser singleton with `createBrowserClient` pattern.

**Rationale**: The Supabase JS SDK v2 provides `createBrowserClient()` which handles browser-local storage for sessions, automatic token refresh via `onAuthStateChange`, and auth state event subscriptions. This aligns with the spec requirement (FR-005) for automatic session restore without custom token management. The SDK is the officially supported browser integration for Supabase Auth.

**Alternatives considered**:
- `@supabase/ssr` — Designed for server-side rendering flows and cookie-based auth. The technical plan explicitly states the frontend communicates directly with Supabase Auth (not through a BFF), so the simpler browser client is appropriate.
- Manual `fetch` against Supabase Auth REST API — Would require reimplementing token storage, refresh logic, and auth state management that the SDK already provides reliably.

**Key details**:
- Create one singleton via `createClient(NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)` in `lib/supabase/client.ts`.
- Import only in client components (`'use client'`); no server-side usage in this phase.
- SDK stores tokens in `localStorage` by default and handles refresh transparently.

## R2: AuthProvider Architecture

**Decision**: React Context provider wrapping `AppShell`, exposing session state, user/role info, and auth methods (login, register, logout).

**Rationale**: A Context-based provider is the standard React pattern for sharing auth state across the component tree without prop drilling. It naturally integrates with `onAuthStateChange` for reactive updates across tabs and token refresh events. This matches the technical plan's requirement for a client `AuthProvider` around `AppShell` (section 14.2).

**Alternatives considered**:
- Zustand/Jotai external store — Adds a dependency for state that is inherently tied to a single external subscription (Supabase SDK). Context is sufficient and idiomatic.
- Server-side middleware auth — Would require a BFF proxy pattern, which the technical plan explicitly rejects.

**Key details**:
- State: `{ session: Session | null; user: User | null; isAdmin: boolean; loading: boolean }`.
- On mount: call `supabase.auth.getSession()` for restore, then `supabase.auth.onAuthStateChange()` for reactive events (`INITIAL_SESSION`, `SIGNED_IN`, `SIGNED_OUT`, `TOKEN_REFRESHED`).
- Cleanup: unsubscribe from auth state listener on unmount.
- Role detection: `session.user.app_metadata?.app_role === 'admin'`.

## R3: Route Protection Strategy

**Decision**: Client-side `AuthGate` wrapper component that renders children, redirects, or shows a loading state based on auth context.

**Rationale**: Next.js App Router middleware cannot access client-side Supabase session state (no cookies in this architecture). A client-side gate component is the recommended approach when auth state lives in browser storage. The loading state prevents the "flash of unauthenticated content" (FR-016).

**Alternatives considered**:
- Next.js middleware with `@supabase/ssr` — Requires cookie-based session architecture, which the technical plan does not use (Bearer tokens only).
- Per-page `useEffect` guards — Duplicates logic across every protected page; a centralized gate is cleaner and testable.

**Key details**:
- Wrap inside `AuthProvider` in the root layout.
- Routes classified as: `public` (login, register), `protected` (chat, upload, admin/*), `auth-only-redirect` (login/register redirect authenticated users to /chat).
- During `loading=true`: render a neutral full-screen spinner or skeleton.
- After restore: redirect unauthenticated users to `/login`, authenticated users away from auth pages to `/chat`.

## R4: API Client Token Attachment and Refresh/Retry

**Decision**: Modify existing `lib/api/client.ts` to centralize token attachment and implement single-retry-on-401.

**Rationale**: The spec (FR-009, FR-010, FR-011) requires automatic Bearer attachment and exactly-once retry on 401. Centralizing this in the existing API module avoids scattering auth logic across pages and matches the technical plan's guidance (section 14.8).

**Alternatives considered**:
- Axios interceptors — Would add a new HTTP client dependency; `fetch` is already used and sufficient.
- Separate auth middleware wrapper — Adds indirection; modifying the existing module is simpler and maintains the single-module pattern.

**Key details**:
- Before each request: get the current session via `supabase.auth.getSession()` and attach `Authorization: Bearer <access_token>`.
- On 401 response: call `supabase.auth.refreshSession()` once, get the new token, and retry the original request.
- On second 401 or refresh failure: call `supabase.auth.signOut()` and throw a typed `ApiError` with status 401.
- Never retry on 403, 404, or 409 (FR-012).
- Replace the existing `Error` throwing with a typed `ApiError(status, detail)` class (FR-013).

## R5: Testing Framework Selection

**Decision**: Vitest + `@testing-library/react` + `jsdom` environment.

**Rationale**: Vitest provides near-instant startup, native TypeScript/ESM support, and Jest-compatible APIs. React Testing Library is the standard for component testing in React. This combination has minimal configuration overhead and works well with Next.js projects.

**Alternatives considered**:
- Jest + ts-jest — Slower startup, requires more configuration for ESM/TypeScript, and is being superseded by Vitest in the ecosystem.
- Playwright component testing — Heavier setup; better suited for E2E tests, not unit/component tests.
- Next.js built-in testing — Experimental and not production-ready for component testing.

**Key details**:
- Install: `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`, `@vitejs/plugin-react`.
- Config: `vitest.config.ts` at project root with `environment: 'jsdom'` and path alias resolution.
- Test files: `__tests__/*.test.ts(x)` at project root.
- Mock Supabase client for auth provider tests; mock `fetch` for API client tests.
