# Data Model: Frontend Authentication & Centralized API Client

**Feature**: `001-frontend-auth` | **Date**: 2026-08-20

## Entities

### AuthState

The core state managed by `AuthProvider` and consumed throughout the application.

| Field | Type | Description |
|-------|------|-------------|
| `session` | `Session \| null` | Current Supabase session object (contains access/refresh tokens, user info). `null` when not authenticated. |
| `user` | `User \| null` | Convenience reference to `session.user`. Contains `id` (UUID), `email`, `app_metadata`. |
| `isAdmin` | `boolean` | Derived from `session.user.app_metadata.app_role === 'admin'`. Defaults to `false`. |
| `loading` | `boolean` | `true` during initial session restoration. `false` once auth state is determined. |

**State transitions**:

```text
[Page Load] → loading=true, session=null
    │
    ├── getSession() succeeds with session → loading=false, session=Session, user=User
    │
    └── getSession() returns null → loading=false, session=null, user=null
         │
         ├── [Login] → session=Session, user=User
         │
         └── [Register] → session=null (email confirmation pending)

[Authenticated] → session=Session
    │
    ├── [TOKEN_REFRESHED event] → session=updated Session (transparent)
    │
    ├── [Logout] → session=null, user=null, isAdmin=false
    │
    └── [SIGNED_OUT event from another tab] → session=null, redirect to /login
```

### AuthContextValue

The interface exposed by the AuthProvider context.

| Field | Type | Description |
|-------|------|-------------|
| `session` | `Session \| null` | Current session. |
| `user` | `User \| null` | Current user. |
| `isAdmin` | `boolean` | Whether current user has admin role. |
| `loading` | `boolean` | Whether auth state is being restored. |
| `signIn` | `(email: string, password: string) => Promise<void>` | Sign in and update context. Throws on failure. |
| `signUp` | `(email: string, password: string) => Promise<{ confirmationRequired: boolean }>` | Register. Returns whether email confirmation is needed. |
| `signOut` | `() => Promise<void>` | Sign out and clear context. |

### ApiError

Typed error class for HTTP error responses from the backend.

| Field | Type | Description |
|-------|------|-------------|
| `status` | `number` | HTTP status code (401, 403, 404, 409, 422, 500, 503). |
| `detail` | `string` | Human-readable error message from `response.detail` or fallback. |

**Extends**: `Error` (standard JavaScript Error class).

**Usage**: Thrown by the API client on non-2xx responses. Consumers use `error.status` to distinguish auth expiry (401), forbidden (403), not found (404), and conflict (409).

### DocumentStatus (extended)

The frontend type representing all possible document statuses from the backend.

| Value | Description |
|-------|-------------|
| `'pending_review'` | Submitted, awaiting admin review. |
| `'queued'` | Approved, waiting for ingestion. |
| `'processing'` | Being ingested by a worker. |
| `'completed'` | Successfully ingested and searchable. |
| `'rejected'` | Rejected by admin with reason. |
| `'failed'` | Ingestion failed due to technical error. |

### UploadResponse (updated)

Updated to reflect the moderation-first upload flow.

| Field | Type | Description |
|-------|------|-------------|
| `document_id` | `string` | UUID of the created document. |
| `filename` | `string` | Original filename. |
| `file_type` | `string` | File extension/type. |
| `status` | `DocumentStatus` | Always `'pending_review'` for new uploads. |
| `message` | `string` | Human-readable status message. |

### StatusResponse

Response from the document status polling endpoint.

| Field | Type | Description |
|-------|------|-------------|
| `document_id` | `string` | UUID of the document. |
| `filename` | `string` | Original filename. |
| `status` | `DocumentStatus` | Current lifecycle status. |
| `total_pages` | `number \| null` | Page count (available after processing). |
| `rejection_reason` | `string \| null` | Reason provided by admin (only for `rejected`). |
| `failure_message` | `string \| null` | Safe user-facing failure message (only for `failed`). |

## Relationships

```text
AuthProvider (1) ──provides──> AuthContextValue
    │
    ├── AuthGate (1) ──consumes──> AuthContextValue.loading, .session
    │       │
    │       └── Renders protected routes OR redirects to /login
    │
    ├── AppShell (1) ──consumes──> AuthContextValue.user, .isAdmin, .signOut
    │       │
    │       └── Shows user info, logout button, admin nav (conditional)
    │
    ├── API Client (1) ──reads──> supabase.auth.getSession()
    │       │
    │       └── Attaches Bearer token, retries on 401
    │
    ├── ChatThread (1) ──consumes──> API Client (askRag)
    │       │
    │       └── Handles ApiError(401) → signs out
    │
    ├── MessageInput (1) ──consumes──> AuthContextValue.isAdmin
    │       │
    │       └── Shows/hides Dev toggle
    │
    └── DocumentUpload (1) ──consumes──> API Client (uploadDocument)
            │
            └── Handles ApiError → displays typed errors
```

## Validation Rules

| Rule | Source | Applied Where |
|------|--------|---------------|
| Email must be valid format | FR-001 | Registration form (client-side + Supabase validation) |
| Password must meet minimum requirements | User Story 1, Scenario 4 | Registration form (Supabase enforces; show client error) |
| Rejection reason 1–500 characters, trimmed | Technical plan section 8 | Admin review UI (Phase 4, not this phase) |
| `app_metadata.app_role` must be exact string `'admin'` | Constitution Principle II | AuthProvider role derivation |
| No secret keys in `NEXT_PUBLIC_*` vars | FR-022, Constitution Principle V | `.env.example` and environment config |
