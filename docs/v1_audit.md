# V1 Codebase Audit

## 1. Project Architecture
- **Current architecture**: Monolithic backend with frontend, database, and ESP32 voting machine components.
- **Frontend**: Single-page application (SPA) with client-side logic for voting and displaying results.
- **Backend**: REST API with Express.js, handling user authentication, voting, and result retrieval.
- **Database**: MongoDB with collections for users, votes, and election results.
- **ESP32**: Embedded device communicating with the backend via HTTP requests.
- **External services**: None identified.

## 2. KEEP
| File/Module | Purpose | Reason |
|------------|---------|--------|
| `frontend/index.html` | Main frontend page | Simple and functional for basic voting UI |
| `frontend/vote.js` | Client-side voting logic | Minimal and straightforward |
| `backend/models/user.js` | User model | Basic structure for user authentication |
| `backend/models/vote.js` | Vote model | Simple structure for tracking votes |
| `backend/controllers/voteController.js` | Vote handling | Basic logic for managing votes |

## 3. REFACTOR
| File/Module | Current Problem | What should change |
|------------|----------------|------------------|
| `backend/controllers/voteController.js` | No input validation | Add input validation for vote submissions |
| `backend/models/vote.js` | No unique constraint on student ID | Add unique constraint to prevent duplicate votes |
| `backend/models/user.js` | No password hashing | Use password hashing for security |
| `frontend/vote.js` | No client-side validation | Add client-side validation for form inputs |
| `backend/routes/vote.js` | No rate limiting | Add rate limiting to prevent abuse |

## 4. REWRITE
| File/Module | Current Problem | Why rewrite |
|------------|----------------|-----------|
| `backend/controllers/voteController.js` | No server-side validation | Needs robust validation and error handling |
| `backend/models/vote.js` | No secure voting logic | Needs secure logic to prevent duplicate votes |
| `backend/models/user.js` | No secure password storage | Needs secure password storage and hashing |
| `frontend/vote.js` | No secure client-side logic | Needs secure client-side logic to prevent manipulation |
| `backend/routes/vote.js` | No secure routing | Needs secure routing and authentication checks |

## 5. REMOVE
| File/Module | Reason |
|------------|--------|
| `frontend/old-ui/` | Obsolete frontend UI |
| `backend/old-controllers/` | Obsolete controllers |
| `backend/old-models/` | Obsolete models |

## 6. Authentication & Authorization Audit
- **Authentication**: Uses JWT tokens, but no password hashing is implemented.
- **Authorization**: No role-based access control (RBAC) is implemented.
- **User Identity**: User's student ID is directly connected to their selected candidate.
- **Admin Access**: No clear separation between admin and user roles.
- **Secrets**: No secrets are exposed in frontend code.

## 7. Voting Security Audit
- **1. Identity Connection**: Yes, a user's student ID is directly connected to their selected candidate.
- **2. Client Manipulation**: Yes, the client can manipulate `hasVoted` to vote multiple times.
- **3. Server Enforcement**: No, the server does not independently enforce one-vote-only.
- **4. Race Conditions**: Yes, race conditions and duplicate/replay vote possibilities exist.
- **5. Authentication/Authorization**: Not properly separated.
- **6. Admin Access**: Yes, normal users can access admin functionality.
- **7. Secrets**: No secrets are exposed in frontend code.
- **8. API Trust**: Yes, API endpoints trust client-provided identity or permissions.
- **9. ESP32 Authentication**: ESP32 authenticates using a hardcoded token.
- **10. Impersonation**: Yes, someone can impersonate an ESP32 or replay its requests.
- **11. Database Safety**: No, database operations are not safe and logically consistent.
- **12. Dependencies**: No unnecessary dependencies identified.
- **13. Architecture**: Monolithic architecture is problematic and should be refactored.

## 8. Database & Privacy Audit
- **Database Operations**: Not safe and logically consistent.
- **Privacy**: No privacy measures are implemented.
- **Data Exposure**: No data exposure identified.
- **Data Security**: No data security measures are implemented.

## 9. ESP32 Security Audit
- **Authentication**: ESP32 authenticates using a hardcoded token.
- **Impersonation**: Yes, someone can impersonate an ESP32 or replay its requests.
- **Data Security**: No data security measures are implemented.
- **Secure Communication**: No secure communication is implemented.

## 10. Critical Findings
### Critical
- **1. Identity Connection**: User's student ID is directly connected to their selected candidate.
- **2. Server Enforcement**: Server does not independently enforce one-vote-only.
- **3. Race Conditions**: Race conditions and duplicate/replay vote possibilities exist.
- **4. Admin Access**: Normal users can access admin functionality.
- **5. ESP32 Impersonation**: Someone can impersonate an ESP32 or replay its requests.
- **6. Database Safety**: Database operations are not safe and logically consistent.

### High
- **1. Client Manipulation**: Client can manipulate `hasVoted` to vote multiple times.
- **2. API Trust**: API endpoints trust client-provided identity or permissions.
- **3. No Password Hashing**: No password hashing is implemented.
- **4. No Role-Based Access**: No role-based access control (RBAC) is implemented.

### Medium
- **1. No Client-Side Validation**: No client-side validation for form inputs.
- **2. No Secure Communication**: No secure communication is implemented between ESP32 and backend.
- **3. No Input Validation**: No input validation for vote submissions.
- **4. No Unique Constraint**: No unique constraint on student ID in vote model.

### Low
- **1. No Rate Limiting**: No rate limiting is implemented.
- **2. No Frontend Secrets**: No secrets are exposed in frontend code.
- **3. No Privacy Measures**: No privacy measures are implemented.
- **4. No Data Security**: No data security measures are implemented.

## 11. V2 Recommendations
- Implement secure authentication and authorization using JWT with password hashing.
- Add role-based access control (RBAC) for admin and user roles.
- Refactor the monolithic backend into a microservices architecture.
- Implement secure communication between ESP32 and backend using TLS.
- Add input validation and error handling for all API endpoints.
- Add unique constraints to prevent duplicate votes.
- Implement rate limiting to prevent abuse.
- Add client-side validation for form inputs.
- Implement secure database operations and logical consistency.
- Add privacy measures and data security features.
- Refactor the frontend to use a more modern framework like React or Vue.js.

## 12. Files That Need Further Manual Review
- `backend/models/user.js`
- `backend/models/vote.js`
- `backend/controllers/voteController.js`
- `backend/routes/vote.js`
- `frontend/vote.js`
- `ESP32/voting-machine-code.js`