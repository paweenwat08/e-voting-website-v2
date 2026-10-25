# Architecture Decisions — eVoting V2 [DRAFT]

This document records key technical decisions made during the development of eVoting V2.

## ADR-001: Use PostgreSQL as the Database

**Status:** Accepted

**Decision**

Use PostgreSQL as the primary relational database.

**Context**

The system manages identities, elections, candidates, voter eligibility, voting authorizations, ballots, sessions, and audit records. These entities have relationships and require data integrity constraints.

**Rationale**

- Supports relational data and foreign key constraints.
- Supports transactions for operations that must succeed or fail together.
- Supports row-level locking for coordinating concurrent database operations.
- Supports unique constraints for enforcing data integrity.

## ADR-002: Use Session-Based Authentication

**Status:** Accepted

**Decision**

Use server-side sessions to authenticate users.

**Context**

The backend needs to identify users across requests and restrict access to protected endpoints.

**Rationale**

- Session validity can be checked against PostgreSQL.
- Sessions can expire and be invalidated server-side.
- The backend can associate an authenticated session with an identity.

**Implementation note**

The authentication middleware hashes the session token before looking up the corresponding session record. Cookie configuration and logout behavior require verification through testing.

## ADR-003: Separate Identity from Ballot Data

**Status:** Accepted

**Decision**

Avoid storing the voter's username directly in the ballot record.

**Context**

Voting data should not directly expose the voter's username through the ballot record.

**Rationale**

- Reduces direct linkage between identity information and stored ballot data.
- Keeps identity and vote records conceptually separate.

**Limitation**

This design decision alone does not prove complete ballot anonymity. Database relationships, logs, access permissions, and the overall system architecture must also be reviewed.

## ADR-004: Use Transactions for Vote Casting

**Status:** Accepted

**Decision**

Perform the critical vote-casting database operations within a transaction.

**Context**

Casting a vote involves validating authorization, checking election conditions, inserting a ballot, and consuming the voting authorization.

**Rationale**

- Helps prevent partial database updates.
- Allows failed operations to be rolled back.
- Supports consistent handling of voting authorization.

**Implementation note**

The voting workflow uses a database transaction and row-level locking on the relevant voting authorization. Concurrent voting behavior still requires dedicated testing.

## ADR-005: Use Role-Based Authorization

**Status:** Accepted

**Decision**

Use role-based middleware to restrict access to voter and administrative endpoints.

**Context**

Voters and administrators require different permissions.

**Rationale**

- Centralizes role checks in middleware.
- Separates authentication from authorization.
- Makes access rules easier to review.

**Implementation note**

Protected routes must apply the appropriate middleware. Route coverage requires verification.

## ADR-006: Use a PostgreSQL Connection Pool

**Status:** Accepted

**Decision**

Use the `pg` connection pool for backend database access.

**Context**

The backend performs database operations across API requests and scheduled election updates.

**Rationale**

- Reuses database connections.
- Configures connection limits and timeouts.
- Provides a shared database access mechanism.

## ADR-007: Use a Scheduled Election Status Updater

**Status:** Accepted

**Decision**

Run a periodic scheduler to update election statuses based on their configured start and end times.

**Context**

Election status should reflect its scheduled lifecycle.

**Rationale**

- Automatically closes open elections after their end time.
- Opens eligible draft elections when their start time is reached.
- Reduces the need for manual status updates.

**Limitation**

The scheduler checks periodically, so status updates may occur after the exact scheduled time. Runtime behavior and deployment requirements must be tested.

## Future Decisions

Additional architecture decisions may be recorded when the design changes, including:

- CSRF protection strategy.
- Session cleanup strategy.
- Audit logging behavior and failure handling.
- Production deployment and database security.
