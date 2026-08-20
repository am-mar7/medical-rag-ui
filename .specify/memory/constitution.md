<!--
Sync Impact Report:
- Version change: Unratified Draft -> v1.0.0
- Added Principles:
  - I. Stateless Authentication & Token Verification (NON-NEGOTIABLE)
  - II. Strict Role-Based Access Control (RBAC)
  - III. Authoritative Transactional State & Multi-Worker Safety
  - IV. Idempotent Ingestion & Knowledge Consistency
  - V. Fail-Closed Security & Storage Isolation
  - VI. Verification & Contract Testing (NON-NEGOTIABLE)
- Added Sections:
  - Security & Moderation Governance
  - Multi-Worker & Ingestion Architecture Constraints
- Removed Sections:
  - None (initial ratification from template)
- Deferred Intents:
  - Full execution/implementation of Phase 0 through Phase 6 technical tasks described in AUTH_IMPLEMENTATION_TECHNICAL_PLAN.md.
-->
# Medical RAG System Constitution

## Core Principles

### I. Stateless Authentication & Token Verification (NON-NEGOTIABLE)
All incoming API requests to protected endpoints MUST be authenticated statelessly via Bearer access tokens. Token verification MUST occur locally using asymmetric public keys (ES256 JWKS) fetched from the central identity provider (Supabase Auth). Symmetric secret fallbacks or unverified header algorithms (such as `none`) MUST be rejected. FastAPI services MUST NEVER store, log, or accept raw user passwords or refresh tokens. Keys MUST be cached and refreshed only on unknown `kid`; a valid key MUST be obtainable or the request fails closed.

### II. Strict Role-Based Access Control (RBAC)
The application MUST strictly distinguish between exactly two roles: `user` and `admin`. Authorization MUST rely exclusively on verified `app_metadata.app_role` claims embedded within validated JWT tokens. Role claims supplied in request bodies, headers, `user_metadata`, or client state MUST be ignored. Endpoint authorization policies MUST fail closed: `401 Unauthorized` for missing or invalid credentials, `403 Forbidden` for insufficient privileges. All endpoints MUST require authentication by default, except explicitly designated public routes (`GET /health`). Resource-scoped queries MUST prevent user enumeration by returning `404 Not Found` for another user's resources rather than `403`.

### III. Authoritative Transactional State & Multi-Worker Safety
The application MUST support multi-process deployments (e.g., two Uvicorn workers) without reliance on process-local singletons or in-memory state authority. Supabase/PostgreSQL is the sole authoritative source of truth for document lifecycle state, moderation decisions, and queue jobs. Work claiming and state transitions MUST be atomic and guarded using database row-level locking (`FOR UPDATE SKIP LOCKED`) and conditional updates. Ingestion execution MUST be fenced using claim tokens (`ingestion_claim_id`) and recovery leases (`ingestion_lease_expires_at`) to ensure crash safety and eliminate race conditions. In-memory data structures (DocumentStore maps, TaskQueues) MAY serve as caches or local executors but MUST NEVER be authoritative for API decisions or worker claims.

### IV. Idempotent Ingestion & Knowledge Consistency
Ingestion pipelines and external resource writes MUST be fully idempotent. Point IDs in vector stores (Qdrant) MUST be deterministically generated (UUIDv5 of chunk IDs), and database chunk persistence MUST merge or deduplicate identical chunk identifiers upon retry. Sparse retrieval indexes (BM25) operating in process-local memory MUST synchronize with authoritative database state via corpus-fingerprint polling, ensuring cross-worker index consistency for completed documents. Completed documents are immutable in the current version; all retrieval is global across the approved knowledge base.

### V. Fail-Closed Security & Storage Isolation
Uploaded files MUST be stored durably in private storage (S3 in deployed mode) before any database record is created, establishing an unindexed `pending_review` document entry. Unapproved submissions MUST NOT be parsed, embedded, or exposed to RAG retrieval under any circumstance. Document moderation rejections MUST be atomic, require a mandatory reason (1–500 characters, trimmed), and trigger post-commit deletion of the original file. Sensitive operational parameters (`dev=true` traces) and administrative routes (`/dev/*`, `/evaluate`) MUST be restricted to `admin` principals. The frontend MUST NEVER store secret keys, service keys, or signing material in client-accessible configuration. Storage mode MUST be explicit; silent fallback between S3 and local storage is prohibited.

### VI. Verification & Contract Testing (NON-NEGOTIABLE)
All security controls, role-based access rules, atomic state transitions, and multi-worker execution flows MUST be validated through automated test suites prior to deployment. Concurrency and transactional locking behaviors MUST be tested against real database constraints rather than memory-only mocks. Two-worker correctness (atomic claims, lease recovery, stale-owner fencing, BM25 peer sync) MUST be demonstrated by instantiating independent service graphs sharing only the database and external stores. Frontend authentication flows (session restore, token refresh/retry, route guards, role-based UI) MUST be covered by focused component and integration tests. System changes MUST NOT weaken security bounds or introduce process-local state dependencies.

## Security & Moderation Governance

1. **Document Lifecycle State Machine**: Documents MUST adhere to the strict six-state transitions: `pending_review` → (`queued` | `rejected`), `queued` → `processing` → (`completed` | `failed`). Direct transitions bypassing `pending_review` or unauthorized state jumps are prohibited and MUST return `409 Conflict`. `completed`, `rejected`, and `failed` are terminal states. Correction or resubmission creates a new document.
2. **Storage Isolation**: Ingestion processes MUST download private originals to temporary worker-isolated paths, materializing files strictly for the duration of processing, and cleaning only the temporary copy upon completion or failure — never the durable original.
3. **Data Integrity & Traceability**: All document status queries and moderation actions MUST be scoped and audited (`submitted_by`, `reviewed_by`, `reviewed_at`). Submitter status requests for unauthorized document IDs MUST return `404 Not Found` to prevent resource enumeration. Critical persistence operations MUST raise typed failures and fail closed; best-effort semantics are permitted only for non-authoritative trace logging.
4. **Error Semantics**: Authentication failures return `401`, authorization denials return `403`, hidden/nonexistent resources return `404`, state-race conflicts return `409`, validation errors return `422`, and infrastructure unavailability returns `503`. Error responses MUST NOT reveal token internals, storage paths, claim tokens, or stack traces.

## Multi-Worker & Ingestion Architecture Constraints

1. **Worker Independence**: No worker process MAY assume exclusive memory visibility or directly invoke in-memory tasks on peer processes. The deployment MUST retain exactly two Uvicorn workers; coordination uses PostgreSQL, not process-local locks or shared memory.
2. **Sparse Index Synchronization**: BM25 indexes MUST hydrate only from chunks belonging to `completed` documents and MUST atomically rebuild upon detecting corpus-fingerprint changes. On sync failure, the last valid index MUST be retained and degraded freshness logged.
3. **Lease Renewal & Fencing**: Ingestion workers MUST maintain active lease heartbeats during long-running tasks. Stale workers whose leases expire MUST be fenced from finalizing ingestion state. Lease duration MUST exceed normal heartbeat jitter; heartbeat interval MUST be materially shorter than the lease. A normal shutdown stops claiming new work and lets the current task finish within the service stop timeout.
4. **Durable Queue Semantics**: The `queued` database status is the durable work signal, not any in-memory queue entry. Coordinators continuously poll persistent rows and recover `queued` documents missed during downtime and `processing` documents whose leases have expired.

## Governance

This Constitution supersedes all informal architectural decisions, pull requests, and implementation plans. Any amendments to this Constitution require formal documentation, a major/minor version increment, rationale evaluation, and explicit ratification.

- **MAJOR version bump**: Removal or fundamental redefinition of core security principles or governance rules.
- **MINOR version bump**: Addition of new principles, architectural constraints, or governance sections.
- **PATCH version bump**: Wording clarifications, typo fixes, or non-semantic formatting updates.

**Version**: 1.0.0 | **Ratified**: 2026-08-20 | **Last Amended**: 2026-08-20
