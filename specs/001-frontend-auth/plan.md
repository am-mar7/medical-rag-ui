# Implementation Plan: Frontend Authentication & Centralized API Client

**Branch**: `001-frontend-auth` | **Date**: 2026-08-20 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/001-frontend-auth/spec.md`

## Summary

Add frontend authentication (registration, email confirmation, login, session restore, logout) using the Supabase Auth browser SDK, centralize Bearer token attachment and 401-refresh-retry logic in the existing API client, implement client-side route guards with loading states, and adapt the application shell and chat interface to show Admin-only UI elements based on verified role metadata. No backend changes are required; this phase consumes the stable Phase 1 API contract.

## Technical Context

**Language/Version**: TypeScript 5.8.2 on Next.js 14.2.31, React 18.3.1

**Primary Dependencies**: `@supabase/supabase-js` (new), `next`, `react`, `react-dom`, `react-markdown`, `remark-gfm` (existing)

**Storage**: Browser-local session storage managed by the Supabase SDK; no server-side session store

**Testing**: Vitest + React Testing Library (new; chosen for zero-config Vite-based speed with Next.js compatibility)

**Target Platform**: Modern browsers (desktop and mobile responsive); Next.js App Router client components

**Project Type**: Web application (frontend only for this phase)

**Performance Goals**: Login-to-chat redirect < 5s; session restore < 1s with no login page flash; token refresh invisible to user

**Constraints**: No backend changes; no secret keys in frontend config; no social/MFA/passwordless auth; existing Tailwind CSS design language preserved

**Scale/Scope**: Two user roles (`user`, `admin`); 6 user stories; 22 functional requirements; 13 files to create/modify

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Evidence |
|-----------|--------|----------|
| I. Stateless Auth & Token Verification | ✅ Pass | Frontend sends Bearer tokens; backend verifies ES256 JWKS. Frontend never handles passwords after form submission to Supabase Auth. |
| II. Strict RBAC | ✅ Pass | UI role detection reads `app_metadata.app_role` from verified session only. Backend remains authoritative; UI adaptation is presentation-only. |
| III. Authoritative Transactional State | ✅ N/A | This phase has no database state mutations; all data authority is backend-side. |
| IV. Idempotent Ingestion | ✅ N/A | No ingestion changes in this phase. |
| V. Fail-Closed Security & Storage Isolation | ✅ Pass | FR-022 prohibits secret keys in frontend config. Only publishable key and public URL are client-exposed. Token refresh fails closed to logout. |
| VI. Verification & Contract Testing | ✅ Pass | Frontend auth flows (session restore, token refresh/retry, route guards, role-based UI) covered by focused component and integration tests per spec SC-009. |

**Gate result: PASS** — No violations. No complexity justifications required.

## Project Structure

### Documentation (this feature)

```text
specs/001-frontend-auth/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── api-client.md    # Centralized API client contract
└── tasks.md             # Phase 2 output (/speckit-tasks command)
```

### Source Code (repository root)

```text
app/
├── layout.tsx              # Modified: wrap with AuthProvider
├── page.tsx                # Modified: auth-aware redirect
├── globals.css             # Existing (unchanged)
├── chat/
│   └── page.tsx            # Existing (unchanged)
├── upload/
│   └── page.tsx            # Existing (unchanged)
├── login/
│   └── page.tsx            # New: login page
├── register/
│   └── page.tsx            # New: registration page
└── admin/
    └── documents/
        └── page.tsx        # New: placeholder admin route (content in Phase 4)

components/
├── auth/
│   ├── AuthProvider.tsx    # New: session state + auth methods context
│   └── AuthGate.tsx        # New: route protection + redirect logic
├── layout/
│   └── AppShell.tsx        # Modified: user/logout display, admin nav, auth-page hiding
├── chat/
│   ├── ChatThread.tsx      # Modified: auth-aware error handling
│   └── MessageInput.tsx    # Modified: admin-only Dev toggle
└── documents/
    ├── DocumentUpload.tsx   # Modified: auth-aware error handling
    └── UploadStatus.tsx     # Existing (unchanged for this phase)

lib/
├── api/
│   └── client.ts           # Modified: Bearer attachment, refresh/retry, typed errors
└── supabase/
    └── client.ts            # New: browser-only Supabase singleton

types/
└── api.ts                   # Modified: add auth types, ApiError, document statuses

__tests__/                   # New: test directory
├── auth-provider.test.tsx
├── auth-gate.test.tsx
├── api-client.test.ts
└── app-shell.test.tsx
```

**Structure Decision**: Frontend-only web application using Next.js App Router conventions. New auth components follow existing `components/` directory pattern. Tests placed in a root `__tests__/` directory using Vitest + React Testing Library.
