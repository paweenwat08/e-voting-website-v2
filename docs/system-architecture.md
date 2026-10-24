# System Architecture — eVoting V2

> This document describes the high-level structure of the eVoting V2 project. Verify implementation-specific details against the current source code before treating this as a complete specification.

## 1. Overview

eVoting V2 is a full-stack school-election voting website with a frontend, a backend API, and a PostgreSQL database.

The project is an upgraded version of an earlier school-election project and is being developed for learning purposes.

## 2. Main Components

### Frontend

The frontend uses React, TypeScript, Vite, and React Router.

Its responsibilities include rendering the website pages and providing the interface for election-related workflows.

### Backend

The backend uses Node.js, Express, and TypeScript. Its dependencies include `pg` for PostgreSQL access, `bcrypt` for password hashing, `dotenv` for environment-variable configuration, and `cors` for Cross-Origin Resource Sharing configuration.

The backend handles API requests and applies server-side rules. The exact routes, authentication flow, and validation rules should be documented from the current implementation.

### Database

The project uses PostgreSQL, accessed by the backend through the `pg` package.

Document the actual schema, relationships, and constraints in [`database.md`](./database.md) after checking the current SQL schema and queries.

## 3. High-Level Request Flow

```text
User
  |
  v
React Frontend
  |
  | HTTP request
  v
Express Backend
  |
  | SQL query
  v
PostgreSQL Database
  |
  | query result
  v
Express Backend
  |
  | HTTP response
  v
React Frontend
  |
  v
User sees the result
```

This diagram represents the high-level component relationship. Confirm the actual API routes, request formats, and database operations from the code before documenting individual workflows.

## 4. Main Application Workflows

The project includes election management, candidate listing, election scheduling, authentication, an admin dashboard, voting, and vote counting/results.

The exact sequence and authorization rules for each workflow should be described after reviewing the relevant frontend components, backend routes/controllers, and database queries.

## 5. Voting Privacy

Voting privacy is an important design goal for this project.

To verify that the implementation protects ballot secrecy, review the database schema and voting code to confirm whether a voter's identity can be linked to an individual vote. Also verify that duplicate-vote prevention is enforced by the backend and database, rather than relying only on frontend state.

Record detailed findings and limitations in [`security.md`](./security.md).

## 6. Configuration and Secrets

Supply configuration values through environment variables where required. Do not commit real database credentials, passwords, API keys, or other secrets to the repository.

Document required variable names and safe example values in the setup documentation without publishing real secret values.

## 7. Related Documentation

- [`database.md`](./database.md) — database schema and relationships
- [`api.md`](./api.md) — API endpoints and request/response formats
- [`security.md`](./security.md) — security controls, privacy considerations, and known limitations

## 8. Items to Verify Against the Code

Before treating this document as a complete technical specification, verify:

- The actual frontend-to-backend API base URL and route structure.
- The authentication and session/token mechanism, if any.
- Which backend routes require authentication or administrator privileges.
- The actual database tables, constraints, and indexes.
- How ballots are stored and how duplicate voting is prevented.
- How election status and opening/closing times are enforced.
- Error handling and validation behavior.
