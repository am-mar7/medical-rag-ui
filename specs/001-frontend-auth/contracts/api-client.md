# Contract: Centralized API Client

**Feature**: `001-frontend-auth` | **Date**: 2026-08-20

## Overview

The `lib/api/client.ts` module is the sole interface between the frontend application and the FastAPI backend. This contract defines the authenticated request behavior, error handling semantics, and the public API surface that all pages and components consume.

## Public API

### `askRag(payload: RagRequest): Promise<RagResponse>`

Sends an authenticated RAG query to the backend.

- **Method**: `POST /rag`
- **Auth**: Bearer token (automatic)
- **Retry**: Once on 401 (automatic)
- **Throws**: `ApiError` on non-2xx
- **Unchanged from current behavior** except for added auth header and typed error.

### `uploadDocument(file: File): Promise<UploadResponse>`

Uploads a document for moderation review.

- **Method**: `POST /upload`
- **Auth**: Bearer token (automatic)
- **Retry**: Once on 401 (automatic)
- **Throws**: `ApiError` on non-2xx
- **Changed**: Response `status` is now `'pending_review'` (was `'queued'`).

### `getDocumentStatus(documentId: string): Promise<StatusResponse>`

Polls the status of a submitted document (new).

- **Method**: `GET /documents/{documentId}/status`
- **Auth**: Bearer token (automatic)
- **Retry**: Once on 401 (automatic)
- **Throws**: `ApiError(404)` if document not found or not owned by current user.

## Internal Behavior Contract

### Token Attachment

```text
For every request:
  1. Call supabase.auth.getSession()
  2. If session exists, add header: Authorization: Bearer <access_token>
  3. If no session, proceed without header (backend will return 401)
```

### 401 Refresh/Retry Flow

```text
On HTTP 401 response:
  1. Call supabase.auth.refreshSession()
  2. If refresh succeeds:
     a. Get new access_token from refreshed session
     b. Retry the original request exactly once with new token
     c. If retry also returns 401 → call supabase.auth.signOut(), throw ApiError(401)
  3. If refresh fails:
     a. Call supabase.auth.signOut()
     b. Throw ApiError(401, "Session expired. Please log in again.")
```

### Non-Retryable Status Codes

| Status | Behavior |
|--------|----------|
| 403 | Throw `ApiError(403)` immediately. No refresh, no retry. |
| 404 | Throw `ApiError(404)` immediately. No refresh, no retry. |
| 409 | Throw `ApiError(409)` immediately. No refresh, no retry. |
| 422 | Throw `ApiError(422)` immediately. Validation error. |
| 500/503 | Throw `ApiError(status)` immediately. Server error. |

### ApiError Class

```text
class ApiError extends Error {
  status: number    // HTTP status code
  detail: string    // Human-readable error message

  constructor(status: number, detail: string)
}
```

**Parsing behavior**: Extract `detail` from JSON response body `{ "detail": "..." }`. Fall back to `"Request failed (${status})"` if body is not JSON or lacks `detail`.

## Environment Configuration

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Yes | Backend FastAPI base URL (existing) |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL (new) |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Yes | Supabase publishable/anon key (new) |

**Security constraint**: No variable may contain the Supabase service/secret key, JWT signing material, or AWS credentials.
