# Feature Specification: Frontend Authentication & Centralized API Client

**Feature Branch**: `001-frontend-auth`

**Created**: 2026-08-20

**Status**: Draft

**Input**: User description: "Phase 2 — Frontend authentication and centralized API client for the Medical RAG system. Users must be able to register, confirm their email, log in, maintain sessions, and log out. All API calls must automatically include authentication. Admin users see additional UI controls. Unauthenticated users are redirected to login."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - New User Registration (Priority: P1)

A new user visits the Medical RAG application for the first time and needs to create an account. They navigate to the registration page, enter their email and password, and submit the form. The system tells them to check their email for a confirmation link. After clicking the confirmation link in their email, their account is activated and they can log in.

**Why this priority**: Registration is the entry point for all new users. Without it, no one can access the system. Email confirmation is required by the identity provider configuration (auto-confirm is disabled).

**Independent Test**: Can be fully tested by submitting the registration form and verifying the confirmation-pending state is displayed. Delivers the ability for new users to join the system.

**Acceptance Scenarios**:

1. **Given** an unregistered user on the registration page, **When** they submit a valid email and password, **Then** the system displays a "check your email for confirmation" message and does not grant immediate access.
2. **Given** a user who has received a confirmation email, **When** they click the confirmation link, **Then** they are redirected to the login page and can now sign in.
3. **Given** a user on the registration page, **When** they submit an email that is already registered, **Then** the system displays an appropriate error without revealing whether the email exists (to prevent enumeration).
4. **Given** a user on the registration page, **When** they submit a password that does not meet minimum requirements, **Then** the system displays a clear validation error before submission.

---

### User Story 2 - User Login and Session Restore (Priority: P1)

A confirmed user returns to the application and needs to sign in. They enter their email and password on the login page. Upon successful authentication, they are redirected to the chat interface. If they close and reopen their browser, their session is automatically restored without requiring re-login (until the session expires).

**Why this priority**: Login and session persistence are equally critical as registration — they are the mechanism by which every returning user accesses the system.

**Independent Test**: Can be fully tested by logging in with valid credentials and verifying redirect to chat. Session restore can be tested by refreshing the page and confirming the user remains authenticated.

**Acceptance Scenarios**:

1. **Given** a confirmed user on the login page, **When** they submit valid credentials, **Then** they are redirected to the chat page and see the authenticated application shell.
2. **Given** a confirmed user on the login page, **When** they submit incorrect credentials, **Then** the system displays a generic authentication error (not revealing which field is wrong).
3. **Given** an authenticated user who refreshes the page or reopens the browser, **When** the page loads, **Then** their session is automatically restored and they see the authenticated interface without logging in again.
4. **Given** a user whose session has expired, **When** the page loads, **Then** they are redirected to the login page.
5. **Given** a user who has registered but not confirmed their email, **When** they attempt to log in, **Then** the system displays an appropriate message indicating email confirmation is required.

---

### User Story 3 - Authenticated API Communication (Priority: P1)

An authenticated user interacts with the chat or upload features. Every request the application makes to the backend automatically includes the user's authentication token. If the token expires mid-session, the application silently refreshes it and retries the request once, so the user experiences no interruption.

**Why this priority**: Without automatic token attachment and refresh, users would face authentication errors during normal usage, breaking the core chat and upload workflows.

**Independent Test**: Can be tested by performing a chat query and verifying the request includes the authorization header. Token refresh can be tested by simulating an expired token and verifying the request succeeds after one automatic retry.

**Acceptance Scenarios**:

1. **Given** an authenticated user, **When** they send a chat query, **Then** the request includes the user's access token and the backend accepts it.
2. **Given** an authenticated user whose token has just expired, **When** they send a chat query, **Then** the application refreshes the token automatically, retries the request once, and the user receives their response without seeing an error.
3. **Given** an authenticated user whose token cannot be refreshed (e.g., session fully expired), **When** they attempt any action, **Then** they are signed out and redirected to the login page with a clear message.
4. **Given** an authenticated user, **When** the backend returns a 403 Forbidden, **Then** the application displays a meaningful "access denied" message without attempting to refresh or retry.

---

### User Story 4 - User Logout (Priority: P2)

An authenticated user decides to end their session. They click the logout control visible in the application navigation. The system clears their session and redirects them to the login page. Subsequent attempts to access protected pages redirect to login.

**Why this priority**: Logout is essential for shared-device security and user control, but ranks below login/registration since users must first be able to get in.

**Independent Test**: Can be tested by clicking logout and verifying redirect to login, then attempting to navigate to a protected page and confirming redirect.

**Acceptance Scenarios**:

1. **Given** an authenticated user, **When** they click the logout control, **Then** their session is cleared and they are redirected to the login page.
2. **Given** a user who has just logged out, **When** they attempt to navigate directly to a protected page (e.g., `/chat`), **Then** they are redirected to the login page.
3. **Given** a user who has logged out, **When** they use the browser back button, **Then** they do not see cached authenticated content or are redirected to login.

---

### User Story 5 - Route Protection and Redirect Logic (Priority: P2)

The application prevents unauthenticated users from accessing protected pages and prevents authenticated users from seeing unnecessary auth pages. When an unauthenticated user tries to access `/chat`, `/upload`, or any admin route, they are redirected to `/login`. When an authenticated user tries to access `/login` or `/register`, they are redirected to `/chat`.

**Why this priority**: Route guarding prevents confusion and unauthorized browsing. It's critical for security posture but depends on authentication being functional first.

**Independent Test**: Can be tested by navigating to protected URLs without authentication and verifying redirect behavior.

**Acceptance Scenarios**:

1. **Given** an unauthenticated user, **When** they navigate to `/chat`, **Then** they are redirected to `/login`.
2. **Given** an unauthenticated user, **When** they navigate to `/upload`, **Then** they are redirected to `/login`.
3. **Given** an unauthenticated user, **When** they navigate to `/admin/documents`, **Then** they are redirected to `/login`.
4. **Given** an authenticated user, **When** they navigate to `/login`, **Then** they are redirected to `/chat`.
5. **Given** an authenticated user, **When** they navigate to `/register`, **Then** they are redirected to `/chat`.
6. **Given** a user whose session is being restored (page loading), **When** the auth state is undetermined, **Then** a neutral loading indicator is shown (no flash of login page or protected content).

---

### User Story 6 - Admin UI Adaptation (Priority: P3)

An Admin user logs in and sees additional navigation elements and controls that regular users do not see. Specifically, Admins see a link to the document review area and the Dev toggle on chat queries. Regular users see neither. This is a presentation-layer adaptation only; the backend remains the authoritative enforcer.

**Why this priority**: Admin UX enhances productivity for privileged users but does not block core functionality. Backend authorization is the security boundary, not the UI.

**Independent Test**: Can be tested by logging in as an Admin and verifying the review navigation link and Dev toggle are visible, then logging in as a regular user and verifying they are absent.

**Acceptance Scenarios**:

1. **Given** an authenticated Admin user, **When** the application shell renders, **Then** a "Review" or "Admin" navigation link to the document review area is visible.
2. **Given** an authenticated Admin user in the chat interface, **When** composing a query, **Then** a Dev toggle control is visible and functional.
3. **Given** an authenticated regular user, **When** the application shell renders, **Then** no Admin navigation links are visible.
4. **Given** an authenticated regular user in the chat interface, **When** composing a query, **Then** no Dev toggle is visible.
5. **Given** a regular user who manually navigates to an admin-only page (e.g., `/admin/documents`), **When** the page loads, **Then** they are redirected away or shown an access-denied message.

---

### Edge Cases

- What happens when the identity provider is temporarily unavailable during login or registration? The system displays a clear connectivity/service error and does not show misleading credential errors.
- What happens when a user's session refresh fails due to network interruption? The application retries refresh once; on failure, it signs the user out and redirects to login with an appropriate message.
- What happens when multiple browser tabs are open and the user logs out in one tab? Other tabs detect the auth state change and redirect to login on their next interaction.
- What happens when a user navigates to the application root `/`? They are redirected to `/chat` if authenticated, or `/login` if not.
- What happens when the backend returns a 401 during an SSE streaming response? The stream is terminated, the token is refreshed, but the stream request is not automatically retried (user must resubmit the query).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow new users to register with email and password.
- **FR-002**: System MUST require email confirmation before granting login access (no auto-confirm).
- **FR-003**: System MUST display a "check your email" message after successful registration rather than granting immediate access.
- **FR-004**: System MUST allow confirmed users to log in with email and password.
- **FR-005**: System MUST automatically restore the user's session on page load or browser reopen without requiring re-login.
- **FR-006**: System MUST redirect authenticated users to `/chat` after successful login.
- **FR-007**: System MUST provide a visible logout control in the application navigation for authenticated users.
- **FR-008**: System MUST clear the user's session and redirect to `/login` on logout.
- **FR-009**: System MUST automatically attach the current access token to every API request to the backend.
- **FR-010**: System MUST automatically refresh an expired token and retry the failed request exactly once on receiving a 401 response from the backend.
- **FR-011**: System MUST sign the user out and redirect to login if token refresh fails or a second 401 is received.
- **FR-012**: System MUST NOT retry requests on 403, 404, or 409 responses.
- **FR-013**: System MUST expose a typed error structure that distinguishes 401 (auth expired), 403 (forbidden), 404 (not found), and 409 (conflict) responses.
- **FR-014**: System MUST redirect unauthenticated users from protected pages (`/`, `/chat`, `/upload`, `/admin/*`) to `/login`.
- **FR-015**: System MUST redirect authenticated users from `/login` and `/register` to `/chat`.
- **FR-016**: System MUST show a neutral loading state while the authentication session is being restored (no flash of unauthorized content or login page).
- **FR-017**: System MUST show Admin-only navigation elements (document review link) only when the authenticated user has the `admin` role.
- **FR-018**: System MUST show the Dev toggle in the chat interface only for Admin users.
- **FR-019**: System MUST hide the application shell (navigation, sidebar) on authentication pages (login, register).
- **FR-020**: System MUST display user-friendly error messages for all authentication failures (invalid credentials, unconfirmed email, network errors, service unavailability).
- **FR-021**: System MUST configure the identity provider's email confirmation redirect to point to the application's login page.
- **FR-022**: System MUST NOT store any secret keys, service keys, or signing material in frontend-accessible configuration.

### Key Entities

- **Session**: Represents the authenticated user's current browser session, including access token, refresh token (managed by the identity provider SDK), user identity (UUID), email, and role metadata. Sessions are persisted in browser storage by the SDK and restored automatically.
- **Principal (UI)**: A lightweight representation of the current user derived from the session, containing user ID, email, and application role (`user` or `admin`). Used to drive UI presentation decisions (route guards, admin visibility). Not a security boundary — the backend is authoritative.
- **API Error**: A structured error object containing HTTP status code and detail message, used to distinguish authentication failures from authorization denials, missing resources, and state conflicts throughout the application.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: New users can complete the registration flow (form submission to confirmation message) in under 30 seconds.
- **SC-002**: Confirmed users can complete login (page load to chat interface) in under 5 seconds on a standard connection.
- **SC-003**: Session restore on page refresh completes without any visible login page flash — the user sees either a loading indicator or the authenticated interface.
- **SC-004**: 100% of API requests from authenticated users include the authorization token without manual user intervention.
- **SC-005**: Token refresh and request retry on 401 is invisible to the user — the original action completes successfully without user re-intervention.
- **SC-006**: All protected routes redirect unauthenticated users to login within 1 second.
- **SC-007**: Admin-only UI elements are never visible to regular users under any navigation sequence.
- **SC-008**: All authentication error states (invalid credentials, unconfirmed email, network failure, provider unavailability) display meaningful, user-friendly messages rather than raw errors or blank screens.
- **SC-009**: The application builds and type-checks with zero errors after all authentication changes are integrated.
- **SC-010**: Frontend authentication changes do not require any backend modifications beyond the stable Phase 1 API contract.

## Assumptions

- The backend (Phase 1) already provides a stable, authenticated API with JWT-based Bearer token validation, returning proper 401/403 status codes. No backend changes are required for this phase.
- The identity provider (Supabase Auth) is configured with email signup enabled, email auto-confirm disabled, and ES256 asymmetric signing. These settings were verified as preconditions.
- The identity provider's browser SDK manages token storage, automatic refresh, and auth state change events. The frontend relies on these SDK capabilities rather than implementing custom token management.
- The application uses the existing Next.js 14 App Router architecture, React 18, TypeScript, and Tailwind CSS. No framework or architectural changes are introduced.
- Admin role is determined by `app_metadata.app_role === "admin"` in the identity provider's session data. Admin users are bootstrapped manually through the identity provider dashboard — no role management UI is needed.
- The existing `lib/api/client.ts` centralized API module is the sole integration point for backend communication. Authentication headers and error handling are added here rather than in individual pages or components.
- The confirmation redirect URL must be configured in the identity provider's settings to point to the application's login page.
- No social authentication, multi-factor authentication, passwordless login, or user profile management is in scope.
- Streaming responses (`/rag/stream`) use `fetch`-based POST requests with manual SSE parsing, not the native `EventSource` API, because `EventSource` cannot send POST bodies or custom headers.
