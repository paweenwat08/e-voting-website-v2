# V2 Data Model

## Overview

The V2 database is designed to separate user identity,
voting eligibility, voting authorization, and ballot data.

The main models are:

- Identity
- Election
- Candidate
- Eligibility
- VotingAuthorization
- Ballot
- AuditLog

## Core Relationships

Identity
 ├── Eligibility
 │       └── Election
 │
 ├── VotingAuthorization
 │       └── Election
 │
 └── AuditLog

Election
 └── Candidate
         └── Ballot

## Model Responsibilities

### Identity

Represents who the user is and stores authentication-related
identity information.

Identity contains:

- `identityId` — internal identity identifier
- `userId` — user/student ID used for login
- `passwordHash` — hashed password
- `role` — `voter` or `admin`
- `status` — `active` or `disabled`

It does not store the user's vote choice.

Passwords must never be stored in plaintext.

### Election

Represents an election event, including its title,
description, schedule, and status.

### Candidate

Represents a candidate participating in an election.

Each candidate belongs to one election.

### Eligibility

Determines whether an Identity is eligible to vote
in a specific Election.

### VotingAuthorization

Represents the user's ability to exercise their voting right.

The authorization can be:

- `unused`
- `consumed`
- `revoked`

It replaces the V1 `hasVoted` approach.

The backend is responsible for controlling and consuming
the authorization.

### Ballot

Stores the voting result.

A Ballot references the selected Candidate and does not
directly store the voter's Identity.

This separation is intended to reduce direct linkage
between voter identity and vote choice.

### AuditLog

Records important system and security events.

It should not contain the user's vote choice.

## Important Design Decisions

### Identity ≠ Ballot

V2 does not directly store `identityId` inside Ballot.

The identity and ballot responsibilities are separated
at the data-model level.

This separation does not by itself guarantee complete
real-world ballot anonymity if other system logs or
processes can correlate voting activity.

### No client-side voting authority

The frontend must not be trusted to determine whether
a user has already voted.

VotingAuthorization is controlled by the backend.

### V1 `hasVoted` is not used

V1 stored voting state directly on the Voter model.

V2 separates this responsibility into VotingAuthorization.

### Authentication

V2 uses `userId + password` as the primary authentication
mechanism.

Passwords are stored only as secure hashes.

Google authentication may be added as an optional
authentication or account-linking mechanism in the future.

### V1 models

The old V1 models such as Voter, Vote, Party, and District
are kept separately as legacy/reference code and are not
part of the V2 core data model.