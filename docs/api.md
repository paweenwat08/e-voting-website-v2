# API Reference — eVoting V2 [DRAFT]

## 1. Overview

This document describes the backend API for eVoting V2.

The backend uses Node.js, Express, TypeScript, and PostgreSQL. The API handles application requests and enforces authentication, authorization, and voting-related business rules.

**Base URL:** To be confirmed from the application configuration.

**Content type:** `application/json` for JSON request and response bodies, where applicable.

## 2. Authentication

The application uses session-based authentication.

Protected requests must include a valid session cookie named `session`.

The backend hashes the session token using SHA-256 and looks up the corresponding session record in PostgreSQL.

The authentication middleware checks:
- Whether a session exists.
- Whether the session has expired.
- Whether the associated identity exists.
- Whether the identity status is `active`.

### Authentication responses

| HTTP status | Meaning |
|---|---|
| `401 Unauthorized` | Session is missing, invalid, or expired |
| `403 Forbidden` | The identity is not active or the authenticated user lacks the required role |
| `500 Internal Server Error` | An unexpected server error occurred |

These status codes describe the relevant middleware behavior. Individual controllers may return additional status codes.

## 3. Authorization

The application defines role-based access control for the following roles:

| Role | Intended access |
|---|---|
| `voter` | Voter-related functionality |
| `admin` | Administrative functionality |

The actual permissions depend on the middleware applied to each route.

Refer to the route definitions in the backend source code to determine which role is permitted to access each endpoint.

## 4. API Endpoint Reference

The endpoint paths, HTTP methods, request schemas, and response bodies must be documented from the implemented Express routes.

Do not treat this document as a complete endpoint inventory until the route files have been reviewed.

### 4.1 Authentication

Document the implemented endpoints for:
- Login
- Logout
- Current authenticated identity or session status, if available

For each endpoint, record:
- HTTP method and path
- Whether authentication is required
- Request body and validation rules
- Success response
- Possible error responses
- Session and cookie behavior

### 4.2 Elections

Document the implemented endpoints for:
- Listing or viewing elections
- Creating an election
- Updating election information
- Changing election status, if supported
- Retrieving election results, if supported

Record the permitted roles and any restrictions on election status and scheduled times.

### 4.3 Candidates

Document the implemented endpoints for:
- Listing candidates
- Viewing candidate details
- Creating candidates
- Updating candidate information
- Deleting candidates, if supported

Verify whether candidate operations are restricted to administrators and whether candidates must belong to a valid election.

### 4.4 Voter Eligibility and Voting Authorization

Document the implemented endpoints for:
- Managing voter eligibility
- Creating or assigning voting authorizations
- Retrieving authorization information, if supported

Record how the backend prevents duplicate authorization records and handles authorization status changes.

### 4.5 Voting

Document the implemented endpoint used to cast a vote.

Record the actual request schema, validation rules, and response body from the controller and service.

The voting workflow checks relevant election conditions, voter eligibility, voting authorization, and candidate membership. It uses a database transaction and locks the relevant voting authorization during vote processing.

The ballot insertion stores the selected candidate through `candidate_id` rather than directly storing the voter's username.

Do not publish internal database details or sensitive information unnecessarily in API responses.

### 4.6 Administrative Functions

Document any implemented endpoints for:
- Identity or account management
- Election administration
- Audit logs
- Result management

Include only endpoints that exist in the current implementation.

## 5. Request and Response Documentation

Use the following format for each endpoint.

### Endpoint template

**Name:** To be documented

- **Method:** Verify from the route definition.
- **Path:** Verify from the route definition.
- **Authentication:** Required / Not required.
- **Required role:** Verify from the applied middleware.

**Request body**

Document the actual accepted fields, data types, required fields, and validation rules.

**Success response**

Document the actual HTTP status and response schema returned by the controller.

**Error responses**

Document the actual status codes and error messages returned by the middleware, controller, and service.

**Notes**

Describe relevant business rules and database constraints.

## 6. Error Handling

The authentication middleware uses the following response structure for authentication failures:

```json
{
  "success": false,
  "message": "Unauthorized"
}
```

Other authentication-related responses include messages for expired sessions, inactive identities, and forbidden access.

Response formats may differ between controllers. Confirm the implementation before documenting a universal error response schema.

## 7. Security Considerations

- Protected endpoints must apply the appropriate authentication middleware.
- Administrative endpoints must enforce role-based authorization.
- Database queries should use parameterized values.
- Session tokens should not be returned unnecessarily or written to application logs.
- Cookie settings must be verified in the login implementation.
- CSRF protections and CORS configuration must be reviewed for the deployment environment.
- API responses must not expose credentials or sensitive internal information.

## 8. API Verification

Before considering this document complete:

- [ ] Inspect all Express route files.
- [ ] Record the actual HTTP method and path for each endpoint.
- [ ] Verify authentication and role middleware on protected routes.
- [ ] Record request validation and response schemas from controllers.
- [ ] Verify success and failure status codes.
- [ ] Test representative endpoints using the configured development environment.
- [ ] Confirm that this document matches the current source code.

## 9. Maintenance

Update this document whenever routes, request schemas, response formats, authentication rules, or authorization policies change.

The implementation is the source of truth for the API reference.
