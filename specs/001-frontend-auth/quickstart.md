# Quickstart Validation Guide: Frontend Authentication & Centralized API Client

**Feature**: `001-frontend-auth` | **Date**: 2026-08-20

## Prerequisites

1. **Backend (Phase 1)** running at `http://127.0.0.1:8000` with JWT auth enabled.
2. **Supabase project** with:
   - Email signup enabled (`disable_signup=false`)
   - Email auto-confirm disabled (`mailer_autoconfirm=false`)
   - ES256 asymmetric signing confirmed
   - At least one admin user bootstrapped via `app_metadata.app_role = "admin"` in Supabase Dashboard
3. **Environment variables** configured in `.env.local`:
   ```text
   NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
   NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<your-publishable-key>
   ```

## Setup

```bash
# Install dependencies (includes @supabase/supabase-js and test deps)
npm install

# Start development server
npm run dev
```

## Validation Scenarios

### V1: Registration Flow (User Story 1)

1. Navigate to `http://localhost:3000/register`
2. Enter a new email and password
3. Submit the form
4. **Expected**: "Check your email for confirmation" message displayed; NOT redirected to chat
5. Check the email inbox and click the confirmation link
6. **Expected**: Redirected to `/login` page

### V2: Login and Session Restore (User Story 2)

1. Navigate to `http://localhost:3000/login`
2. Enter confirmed user credentials
3. Submit the form
4. **Expected**: Redirected to `/chat`; application shell shows user email and logout button
5. Refresh the page (F5)
6. **Expected**: Still on `/chat`; no flash of login page; session restored automatically

### V3: Token Attachment (User Story 3)

1. While logged in, send a chat query
2. Open browser dev tools → Network tab
3. **Expected**: The `/rag` request includes `Authorization: Bearer <token>` header
4. **Expected**: Response returns successfully (200)

### V4: Logout (User Story 4)

1. While logged in, click the logout control in the sidebar
2. **Expected**: Redirected to `/login`
3. Attempt to navigate to `/chat` directly
4. **Expected**: Redirected back to `/login`

### V5: Route Protection (User Story 5)

1. While NOT logged in, navigate to `/chat`
2. **Expected**: Redirected to `/login`
3. While NOT logged in, navigate to `/upload`
4. **Expected**: Redirected to `/login`
5. Log in, then navigate to `/login`
6. **Expected**: Redirected to `/chat`
7. Navigate to `/register`
8. **Expected**: Redirected to `/chat`

### V6: Admin UI (User Story 6)

1. Log in as the admin user (bootstrapped via Supabase Dashboard)
2. **Expected**: Sidebar shows "Review" or "Admin" navigation link
3. **Expected**: Chat input shows "Dev Mode" toggle
4. Log out and log in as a regular user
5. **Expected**: No admin navigation link visible
6. **Expected**: No Dev Mode toggle visible

### V7: Error Handling

1. Log in with incorrect credentials
2. **Expected**: Generic error message (not revealing which field is wrong)
3. Attempt to register with an already-used email
4. **Expected**: Error displayed without confirming the email exists

## Automated Validation

```bash
# Run test suite
npx vitest run

# Type check
npx tsc --noEmit

# Build check
npm run build
```

**Expected**: All tests pass; zero type errors; build succeeds.

## Success Criteria Verification

| Criterion | How to Verify |
|-----------|---------------|
| SC-001: Registration < 30s | Time V1 steps 2-4 |
| SC-002: Login < 5s | Time V2 steps 2-4 |
| SC-003: No login flash | Observe V2 step 6 — loading state then chat, no login page |
| SC-004: 100% token attachment | Verify V3 — all requests have Authorization header |
| SC-005: Invisible token refresh | Simulate expired token; verify request succeeds |
| SC-006: Redirect < 1s | Time V5 redirects |
| SC-007: No admin UI for users | Verify V6 steps 4-6 |
| SC-008: Meaningful error messages | Verify V7 — user-friendly, not raw errors |
| SC-009: Build + type-check pass | Run automated validation commands |
| SC-010: No backend changes | Confirm no backend modifications were needed |
