import type { PoolClient } from "pg";
import pool from "../config/database.js";

import {
    createAuditLog
} from "./auditLog.service.js";

export const findVotingAuthorization = async (
    identityId: string,
    electionId: string
) => {
    const result = await pool.query(
        `
        SELECT
            id,
            identity_id,
            election_id,
            status,
            consumed_at,
            created_at,
            updated_at
        FROM voting_authorizations
        WHERE identity_id = $1
          AND election_id = $2
        LIMIT 1
        `,
        [
            identityId,
            electionId
        ]
    );

    return result.rows[0] ?? null;
};

export const createVotingAuthorization = async (
    identityId: string,
    electionId: string
) => {
    const result = await pool.query(
        `
        INSERT INTO voting_authorizations (
            identity_id,
            election_id
        )
        VALUES ($1, $2)
        RETURNING
            id,
            identity_id,
            election_id,
            status,
            consumed_at,
            created_at,
            updated_at
        `,
        [
            identityId,
            electionId
        ]
    );

    return result.rows[0];
};

export const consumeVotingAuthorization = async (
    identityId: string,
    electionId: string,
    client: PoolClient
) => {
    const result = await client.query(
        `
        UPDATE voting_authorizations
        SET status = 'consumed',
            consumed_at = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP
        WHERE identity_id = $1
          AND election_id = $2
          AND status = 'unused'
        RETURNING id
        `,
        [identityId, electionId]
    );

    if (result.rowCount !== 1) {
        throw new Error("Voting authorization could not be consumed");
    }
};


export const castVote = async (
    identityId: string,
    electionId: string,
    candidateId: string
) => {
    const client = await pool.connect();
    let transactionStarted = false;

    try {
        await client.query("BEGIN");
        transactionStarted = true;

        // 1. Check election
        const electionResult = await client.query(
            `
            SELECT id, title, description, start_at, end_at, status
            FROM elections
            WHERE id = $1
            LIMIT 1
            `,
            [electionId]
        );

        const election = electionResult.rows[0] ?? null;

        if (!election) {
            await client.query("ROLLBACK");
            transactionStarted = false;

            return {
                success: false,
                reason: "Election not found",
            };
        }

        if (election.status !== "open") {
            await client.query("ROLLBACK");
            transactionStarted = false;

            return {
                success: false,
                reason: "Election is not open",
            };
        }

        // 2. Check election time
        const now = new Date();
        const startAt = new Date(election.start_at);
        const endAt = new Date(election.end_at);

        if (now < startAt) {
            await client.query("ROLLBACK");
            transactionStarted = false;

            return {
                success: false,
                reason: "Election has not started",
            };
        }

        if (now >= endAt) {
            await client.query("ROLLBACK");
            transactionStarted = false;

            return {
                success: false,
                reason: "Election has ended",
            };
        }

        // 3. Check eligibility
        const eligibilityResult = await client.query(
            `
            SELECT id
            FROM voter_eligibilities
            WHERE identity_id = $1
              AND election_id = $2
            LIMIT 1
            `,
            [identityId, electionId]
        );

        if (eligibilityResult.rows.length === 0) {
            await client.query("ROLLBACK");
            transactionStarted = false;

            return {
                success: false,
                reason: "Voter is not eligible for this election",
            };
        }

        // 4. Check candidate belongs to this election
        const candidateResult = await client.query(
            `
            SELECT id
            FROM candidates
            WHERE id = $1
              AND election_id = $2
            LIMIT 1
            `,
            [candidateId, electionId]
        );

        if (candidateResult.rows.length === 0) {
            await client.query("ROLLBACK");
            transactionStarted = false;

            return {
                success: false,
                reason: "Candidate does not belong to this election",
            };
        }

        // 5. Lock voting authorization
        const authorizationResult = await client.query(
            `
            SELECT id, status
            FROM voting_authorizations
            WHERE identity_id = $1
              AND election_id = $2
            LIMIT 1
            FOR UPDATE
            `,
            [identityId, electionId]
        );

        const authorization = authorizationResult.rows[0] ?? null;

        if (!authorization) {
            await client.query("ROLLBACK");
            transactionStarted = false;

            return {
                success: false,
                reason: "Voting authorization not found",
            };
        }

        if (authorization.status !== "unused") {
            await client.query("ROLLBACK");
            transactionStarted = false;

            return {
                success: false,
                reason: "Voting authorization is not available",
            };
        }

        // 6. Create ballot
        const ballotResult = await client.query(
            `
            INSERT INTO ballots (candidate_id)
            VALUES ($1)
            RETURNING id, candidate_id, created_at, updated_at
            `,
            [candidateId]
        );

        const ballot = ballotResult.rows[0];

        // 7. Consume authorization using the SAME transaction client
        await consumeVotingAuthorization(
            identityId,
            electionId,
            client
        );

        // 8. Commit
        await client.query("COMMIT");
        transactionStarted = false;

        // Audit logging happens after the vote transaction commits.
        try {
            await createAuditLog("VOTE_CAST", null, {
                electionId,
            });
        } catch (auditError) {
            console.error("Failed to create vote audit log:", auditError);
        }

        return {
            success: true,
            ballot,
        };
    } catch (error) {
        if (transactionStarted) {
            try {
                await client.query("ROLLBACK");
            } catch (rollbackError) {
                console.error("Rollback error:", rollbackError);
            }
        }

        console.error("Cast vote error:", error);

        return {
            success: false,
            reason: "Internal Server Error",
        };
    } finally {
        client.release();
    }
};


