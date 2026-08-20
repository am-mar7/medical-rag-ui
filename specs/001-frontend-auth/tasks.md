# Tasks: Frontend Authentication & Centralized API Client

**Feature**: `001-frontend-auth` | **Branch**: `001-frontend-auth` | **Spec**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md)

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, dependency installation, and testing framework configuration

- [X] T001 Install `@supabase/supabase-js` and test runner dependencies (`vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`, `@vitejs/plugin-react`) in package.json
- [X] T002 [P] Configure Vitest test setup and path aliases in vitest.config.ts
- [X] T003 [P] Add Supabase environment variable placeholders (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`) to .env.example

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core auth client, context provider, and API client refactoring that MUST be complete before user stories

- [X] T004 Create browser-only Supabase client singleton in lib/supabase/client.ts
- [X] T005 Update API and authentication TypeScript definitions (`ApiError`, `AuthState`, `AuthContextValue`, `DocumentStatus`, `UploadResponse`, `StatusResponse`) in types/api.ts
- [X] T006 Refactor centralized API client to attach Bearer tokens, perform single 401 refresh/retry, and throw typed `ApiError` instances in lib/api/client.ts
- [X] T007 [P] Create unit test suite verifying token attachment, 401 refresh/retry logic, and error handling in __tests__/api-client.test.ts
- [X] T008 Create `AuthProvider` context component managing session restoration, auth methods (`signIn`, `signUp`, `signOut`), and role derivation in components/auth/AuthProvider.tsx
- [X] T009 [P] Create unit test suite for session restoration and auth context in __tests__/auth-provider.test.tsx

---

## Phase 3: User Story 1 - New User Registration (Priority: P1)

**Goal**: Allow new users to register with email and password, enforcing email confirmation flow.

**Independent Test**: Navigate to `/register`, submit email/password, verify "check your email" confirmation message is displayed, and immediate session access is not granted.

- [X] T010 [P] [US1] Create registration form page component with email/password inputs and confirmation pending message in app/register/page.tsx
- [X] T011 [US1] Connect registration form to `signUp` method in `AuthProvider` with input validation and error display in app/register/page.tsx

---

## Phase 4: User Story 2 - User Login and Session Restore (Priority: P1)

**Goal**: Allow confirmed users to log in with email/password and automatically restore their session on page reload.

**Independent Test**: Submit valid credentials on `/login`, verify redirect to `/chat` and session restoration upon page refresh.

- [X] T012 [P] [US2] Create login form page component with email/password fields and error notification area in app/login/page.tsx
- [X] T013 [US2] Connect login form to `signIn` method in `AuthProvider` with redirect to `/chat` on success in app/login/page.tsx
- [X] T014 [US2] Ensure `onAuthStateChange` listener handles `INITIAL_SESSION` and `TOKEN_REFRESHED` events in components/auth/AuthProvider.tsx

---

## Phase 5: User Story 3 - Authenticated API Communication (Priority: P1)

**Goal**: Seamlessly attach Bearer tokens to all chat and upload requests, handling token refresh retries and surface typed API errors.

**Independent Test**: Perform a chat query and file upload, verifying `Authorization: Bearer` header presence and graceful handling of 401/403 responses.

- [X] T015 [US3] Update `ChatThread` component to handle `ApiError` (redirect to login on 401, display access denied on 403) in components/chat/ChatThread.tsx
- [X] T016 [US3] Update `DocumentUpload` component to handle `pending_review` upload status and surface typed `ApiError` details in components/documents/DocumentUpload.tsx

---

## Phase 6: User Story 4 - User Logout (Priority: P2)

**Goal**: Provide a clear logout action in the app navigation that clears the user session and redirects to login.

**Independent Test**: Click logout button in application sidebar, verify session clearance and immediate redirect to `/login`.

- [X] T017 [US4] Update `AppShell` to display user email, role indicator, and a logout button calling `signOut` in components/layout/AppShell.tsx
- [X] T018 [P] [US4] Create unit test verifying user email display and logout handler invocation in __tests__/app-shell.test.tsx

---

## Phase 7: User Story 5 - Route Protection and Redirect Logic (Priority: P2)

**Goal**: Protect application routes by redirecting unauthenticated users to `/login` and authenticated users away from auth pages.

**Independent Test**: Navigate to `/chat` without a session to verify redirect to `/login`; navigate to `/login` with an active session to verify redirect to `/chat`.

- [X] T019 [P] [US5] Create `AuthGate` client component to enforce route protection rules and render neutral loading spinner during session restore in components/auth/AuthGate.tsx
- [X] T020 [US5] Wrap root layout with `AuthProvider` and `AuthGate` in app/layout.tsx
- [X] T021 [US5] Update root page `/` to perform auth-aware redirection in app/page.tsx
- [X] T022 [P] [US5] Create unit test suite for `AuthGate` route protection and loading state in __tests__/auth-gate.test.tsx

---

## Phase 8: User Story 6 - Admin UI Adaptation (Priority: P3)

**Goal**: Adapt UI elements for Admin users (document review link, Dev toggle) based on verified `app_metadata.app_role === 'admin'`.

**Independent Test**: Log in as admin user to verify review navigation link and Dev toggle are visible; log in as regular user to verify they are hidden.

- [X] T023 [US6] Add conditional admin document review link in sidebar navigation based on `isAdmin` in components/layout/AppShell.tsx
- [X] T024 [US6] Create placeholder admin documents review page in app/admin/documents/page.tsx
- [X] T025 [US6] Update `MessageInput` to conditionally render the Dev Mode toggle only when `isAdmin` is true in components/chat/MessageInput.tsx

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Type safety, automated testing verification, and quickstart validation

- [X] T026 [P] Run TypeScript type checker (`npx tsc --noEmit`) to verify zero type errors
- [X] T027 [P] Execute Vitest test suite (`npx vitest run`) to verify all unit and component tests pass
- [X] T028 Run manual quickstart scenarios from specs/001-frontend-auth/quickstart.md to validate end-to-end user journeys

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User Story 1 (P1): Can proceed after Phase 2
  - User Story 2 (P1): Can proceed after Phase 2
  - User Story 3 (P1): Depends on US2 (login required for API calls)
  - User Story 4 (P2): Depends on US2 (session required for logout)
  - User Story 5 (P2): Depends on US1, US2 (login/register pages must exist)
  - User Story 6 (P3): Depends on US2, US5 (authenticated app shell & routes)
- **Polish (Phase 9)**: Depends on all desired user stories being complete

### Parallel Opportunities

- **Setup Phase**: T002 and T003 can be executed in parallel after T001
- **Foundational Phase**: T007 and T009 test creation can run in parallel with implementation tasks
- **User Story Implementation**:
  - T010 (US1 Registration Page) and T012 (US2 Login Page) can be built in parallel
  - T018 (US4 AppShell Test) and T022 (US5 AuthGate Test) can run in parallel
  - T026 and T027 in Polish phase can run in parallel

---

## Implementation Strategy

### MVP First (User Stories 1 & 2 Only)

1. Complete Phase 1 (Setup) and Phase 2 (Foundational)
2. Implement Phase 3 (US1 Registration) and Phase 4 (US2 Login & Session Restore)
3. **STOP and VALIDATE**: Verify users can create accounts, log in, and maintain sessions

### Incremental Delivery

1. Foundation + Registration + Login (MVP)
2. Add Authenticated API Communication (US3) -> Verify API requests carry Bearer tokens
3. Add Logout (US4) and Route Protection (US5) -> Secure application shell & routes
4. Add Admin UI Adaptation (US6) -> Enable privileged controls for admin role
5. Final Polish & Automated Test Suite (Phase 9)
