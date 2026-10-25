# Security and Privacy — eVoting V2

## 1. Overview

This document describes the authentication, authorization, session management, and voting privacy mechanisms implemented in eVoting V2.

The system uses a React and TypeScript frontend, a Node.js and Express backend, and PostgreSQL for persistent data storage.

## 2. Authentication

The backend uses session-based authentication.

### Session validation

The authentication middleware performs the following checks:

1. Checks whether the request contains a session cookie.
2. Extracts the session token from the cookie.
3. Hashes the session token using SHA-256.
4. Looks up the corresponding session in PostgreSQL using the token hash.
5. Verifies that the session has not expired.
6. Retrieves the associated identity.
7. Verifies that the identity status is `active`.
8. Attaches the authenticated identity to the request.

Requests without a valid session are rejected.

### Session token storage

The middleware hashes the session token before querying the database. The database stores the token hash rather than requiring the raw token for session lookup.

This reduces the exposure of usable session credentials if session records are disclosed.

### Session expiration

Session expiration is checked against the database timestamp using `CURRENT_TIMESTAMP`.

Expired sessions are rejected. Expired session records should also be removed through a separate cleanup mechanism.

## 3. Authorization

The system uses role-based middleware to restrict access to protected routes.

The role middleware checks whether an authenticated identity has the required role before allowing access.

The expected roles are:

- `voter`: accesses voter-specific functionality.
- `admin`: accesses administrative functionality.

Authentication and authorization serve different purposes:

- **Authentication** verifies the identity associated with the session.
- **Authorization** determines whether that identity is permitted to perform an action.

Protected routes must apply the appropriate authentication and role checks.

## 4. Identity Status

Only identities with the `active` status are allowed to proceed through the authentication middleware.

Identities with other statuses are rejected.

The accepted status values must remain consistent with the PostgreSQL schema and the identity management logic.

## 5. Voting Privacy and Integrity

The voting workflow is designed to separate voter identity from ballot data.

The ballot record stores the selected candidate through `candidate_id`, rather than directly storing the voter's username.

The voting workflow also checks voting authorization and election conditions before accepting a vote.

Relevant safeguards include:

- Validating that the election is open and within its permitted time window.
- Checking voter eligibility and voting authorization.
- Verifying that the selected candidate belongs to the relevant election.
- Using a database transaction for the vote-casting operation.
- Locking the relevant voting authorization during processing.
- Marking the authorization as `consumed` after a successful vote.

The database enforces a unique constraint on `(identity_id, election_id)` in `voting_authorizations` to prevent duplicate authorization records for the same identity and election.

These mechanisms help protect vote integrity. They do not, by themselves, prove complete ballot anonymity or resistance to every form of attack.

## 6. Database Access

The backend uses PostgreSQL through the `pg` connection pool.

Database operations should use parameterized queries to reduce SQL injection risks.

Database credentials must be kept in environment variables and must not be committed to the repository.

The connection pool configuration includes connection limits and timeout settings.

## 7. Cookie Security

The session cookie must be configured securely when created during login.

The recommended settings are:

- `HttpOnly`: prevents client-side JavaScript from reading the cookie.
- `Secure`: requires HTTPS in production.
- `SameSite`: helps reduce cross-site request risks.
- `Expires` or `Max-Age`: aligns cookie expiration with server-side session expiration.
- `Path`: limits the cookie's applicable URL path.

Cookie settings must be verified in the login and logout implementations.

The authentication middleware alone does not configure these cookie attributes.

## 8. CSRF Protection

Because browsers can automatically attach cookies to requests, cookie-based authentication must consider Cross-Site Request Forgery (CSRF).

Recommended protections include:

- Configuring an appropriate `SameSite` cookie policy.
- Validating request origins where appropriate.
- Restricting CORS to trusted frontend origins.
- Enabling credentials only for the origins that require them.
- Using CSRF tokens when required by the application's deployment and request model.

These protections must be verified in the application configuration and relevant API routes before they can be considered implemented.

## 9. Error Handling

The authentication middleware returns appropriate HTTP status codes for common authentication failures:

| Condition | HTTP status |
|---|---:|
| Missing or invalid session | `401 Unauthorized` |
| Identity is not active | `403 Forbidden` |
| Unexpected server error | `500 Internal Server Error` |

Internal error details should be logged on the server without exposing sensitive information to clients.

## 10. Limitations and Future Improvements

The following items require verification or further implementation:

- Confirm secure cookie settings in login and logout.
- Confirm that logout invalidates the server-side session.
- Implement or verify expired-session cleanup.
- Implement and test CSRF protection where required.
- Review CORS configuration for the production deployment.
- Verify that every protected route uses the correct middleware.
- Test session expiration, disabled identities, and unauthorized role access.
- Conduct security testing of the complete authentication and voting workflows.

## 11. Security Scope

This document describes the intended protections and the behavior visible in the relevant middleware and voting workflow.

It is not a claim of formal security certification, complete anonymity, or resistance to all attacks. Further review and testing are necessary before the system can be considered suitable for a high-stakes election.
