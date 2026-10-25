# Testing — eVoting V2

## 1. Overview

This document records the testing status of eVoting V2, including voting workflows, election restrictions, authentication, authorization, and areas that require further verification.

Test results are recorded according to observed behavior. Features that have not been tested are not considered verified.

## 2. Voting Workflow

| Test case | Expected result | Status |
|---|---|---|
| Cast a valid vote | The vote is accepted | Passed |
| Vote again in the same election | The duplicate vote is rejected | Passed |
| Vote in a different election | The identity can vote in another election when separately authorized | Passed |
| Cast a vote after an election has closed | The vote is rejected | Passed |
| Submit a candidate that does not belong to the election | The vote is rejected | Needs verification |
| Submit concurrent voting requests for the same authorization | At most one vote is accepted | Not tested |

The passed results above reflect the voting scenarios previously tested during development. They do not establish that every possible voting scenario has been tested.

## 3. Database Integrity

| Test case | Expected result | Status |
|---|---|---|
| Create duplicate authorization records for the same identity and election | The database rejects the duplicate | Constraint defined; runtime test not confirmed |
| Consume a voting authorization after a successful vote | The authorization status becomes `consumed` | Observed during development |
| Roll back a failed voting transaction | Partial vote changes are not committed | Needs verification |
| Associate a ballot directly with a voter's username | Ballot storage does not directly store the username | Verified by reviewed ballot insertion query |

The database constraint on `(identity_id, election_id)` in `voting_authorizations` prevents duplicate authorization records for the same identity and election.

This constraint is distinct from the voting transaction and does not, by itself, prove that concurrent voting requests are handled correctly.

## 4. Authentication and Session Management

| Test case | Expected result | Status |
|---|---|---|
| Request a protected endpoint without a session cookie | The request is rejected with `401 Unauthorized` | Implemented; runtime test not confirmed |
| Request with an invalid session token | The request is rejected | Implemented; runtime test not confirmed |
| Request with an expired session | The request is rejected | Implemented; runtime test not confirmed |
| Request with an identity that does not exist | The request is rejected | Implemented; runtime test not confirmed |
| Request with an identity whose status is not `active` | The request is rejected with `403 Forbidden` | Implemented; runtime test not confirmed |
| Logout invalidates the server-side session | The session can no longer authenticate requests | Needs verification |
| Cookie security attributes are configured correctly | Cookie settings match the deployment requirements | Needs verification |

## 5. Authorization

| Test case | Expected result | Status |
|---|---|---|
| Access a protected route without authentication | The request is rejected | Middleware implemented; runtime test not confirmed |
| A voter accesses an admin-only route | The request is rejected with `403 Forbidden` | Middleware implemented; runtime test not confirmed |
| An admin accesses an admin-only route | Access is allowed when authenticated | Needs verification |
| All protected routes use the appropriate middleware | Unauthorized access is blocked | Needs verification |

## 6. Election Scheduling

The election scheduler checks election start and end times periodically.

| Test case | Expected result | Status |
|---|---|---|
| An open election reaches its end time | Its status changes to `closed` | Code implemented; runtime test not confirmed |
| A draft election reaches its start time before its end time | Its status changes to `open` | Code implemented; runtime test not confirmed |
| An election has already passed its end time before opening | It is not opened | Condition implemented; runtime test not confirmed |
| Scheduler execution overlaps within the same process | The overlapping execution is skipped | Code implemented; runtime test not confirmed |

Scheduler behavior must be tested against the actual database schema and application configuration.

## 7. Build Verification

| Check | Status |
|---|---|
| Frontend production build | Previously passed during development |
| Backend build after the latest middleware and scheduler changes | Needs verification |
| Application startup with PostgreSQL connected | Needs verification after the latest changes |

Previously successful builds do not guarantee that the latest changes compile successfully. Run the build commands again before release.

## 8. Known Testing Limitations

The following areas have not been fully verified:

- Concurrent voting requests.
- Complete login, session creation, and logout behavior.
- Cookie security configuration.
- CSRF protection.
- All voter and admin route permissions.
- Election scheduler behavior under real database conditions.
- Full regression testing after recent code changes.

## 9. Test Environment

Record the actual environment used when conducting additional tests.

- Backend: Node.js, Express, TypeScript.
- Database: PostgreSQL.
- Frontend: React, TypeScript, Vite.
- API testing tool: Record the tool used for each test.

Specific software versions, test dates, and test results should be added only when confirmed.

## 10. Conclusion

The voting workflow has passed several basic scenarios during development, including successful voting, duplicate-vote rejection in the same election, voting in a different election when authorized, and rejection of votes after an election has closed.

Authentication, authorization, scheduler behavior, concurrent voting, and other security-related scenarios require additional verification before the system can be considered fully tested.
