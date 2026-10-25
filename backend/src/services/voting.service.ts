import connection from "../config/database.js";

import {
    createAuditLog
} from "./auditLog.service.js";

export const findVotingAuthorization = async (
    identityId: string,
    electionId: string
) => {
    const result = await connection.query(
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
    const result = await connection.query(
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
    electionId: string
) => {
    const result = await connection.query(
        `
        UPDATE voting_authorizations
        SET
            status = 'consumed',
            consumed_at = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP
        WHERE identity_id = $1
          AND election_id = $2
          AND status = 'unused'
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

    return result.rows[0] ?? null;
};

export const castVote = async (
    identityId: string,
    electionId: string,
    candidateId: string
) => {
    try {
        await connection.query("BEGIN");

        // ==========================================
        // 1. Check election
        // ==========================================

        const electionResult = await connection.query(
            `
            SELECT
                id,
                title,
                description,
                start_at,
                end_at,
                status
            FROM elections
            WHERE id = $1
            LIMIT 1
            `,
            [electionId]
        );

        const election = electionResult.rows[0] ?? null;

        if (!election) {
            await connection.query("ROLLBACK");

            return {
                success: false,
                reason: "Election not found"
            };
        }

        // Election must be open
        if (election.status !== "open") {
            await connection.query("ROLLBACK");

            return {
                success: false,
                reason: "Election is not open"
            };
        }

        // ==========================================
        // 2. Check election time
        // ==========================================

        const now = new Date();

        const startAt = new Date(election.start_at);
        const endAt = new Date(election.end_at);

        if (now < startAt) {
            await connection.query("ROLLBACK");

            return {
                success: false,
                reason: "Election has not started"
            };
        }

        if (now >= endAt) {
            await connection.query("ROLLBACK");

            return {
                success: false,
                reason: "Election has ended"
            };
        }

        // ==========================================
        // 3. Check eligibility
        // ==========================================

        const eligibilityResult = await connection.query(
            `
            SELECT 1
            FROM voter_eligibilities
            WHERE identity_id = $1
              AND election_id = $2
            LIMIT 1
            `,
            [
                identityId,
                electionId
            ]
        );

        const eligibility =
            eligibilityResult.rows[0] ?? null;

        if (!eligibility) {
            await connection.query("ROLLBACK");

            return {
                success: false,
                reason: "Voter is not eligible"
            };
        }

        if (eligibility.status !== "eligible") {
            await connection.query("ROLLBACK");

            return {
                success: false,
                reason: "Voter is not eligible"
            };
        }

        // ==========================================
        // 4. Check candidate
        // ==========================================

        const candidateResult = await connection.query(
            `
            SELECT
                id,
                election_id,
                candidate_number,
                description,
                identity_id
            FROM candidates
            WHERE id = $1
              AND election_id = $2
            LIMIT 1
            `,
            [
                candidateId,
                electionId
            ]
        );

        const candidate =
            candidateResult.rows[0] ?? null;

        if (!candidate) {
            await connection.query("ROLLBACK");

            return {
                success: false,
                reason: "Candidate does not belong to this election"
            };
        }

        // ==========================================
        // 5. Find and lock voting authorization
        // ==========================================

        const votingAuthorizationResult =
            await connection.query(
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
                FOR UPDATE
                `,
                [
                    identityId,
                    electionId
                ]
            );

        const votingAuthorization =
            votingAuthorizationResult.rows[0] ?? null;

        if (!votingAuthorization) {
            await connection.query("ROLLBACK");

            return {
                success: false,
                reason: "Voting authorization not found"
            };
        }

        if (votingAuthorization.status !== "unused") {
            await connection.query("ROLLBACK");

            return {
                success: false,
                reason: "Voting authorization is not available"
            };
        }

        // ==========================================
        // 6. Create ballot
        // ==========================================

        const ballotResult = await connection.query(
            `
            INSERT INTO ballots (
                candidate_id
            )
            VALUES ($1)
            RETURNING
                id,
                candidate_id,
                created_at,
                updated_at
            `,
            [
                candidateId
            ]
        );

        const ballot = ballotResult.rows[0];

        // ==========================================
        // 7. Consume voting authorization
        // ==========================================

        await consumeVotingAuthorization(identityId, electionId)

        // ==========================================
        // 8. Commit
        // ==========================================

        await connection.query("COMMIT");

        try {
            await createAuditLog(
                "VOTE_CAST",
                null,
                {
                    electionId: electionId
                }
            );
        } catch (auditError) {
            console.error(
                "Failed to create vote audit log:",
                auditError
            );
        }

        return {
            success: true,
            ballot,
        };

    } catch (error) {

        try {
            await connection.query("ROLLBACK");
        } catch (rollbackError) {
            console.error(
                "Rollback error:",
                rollbackError
            );
        }

        console.error(
            "Cast vote error:",
            error
        );

        return {
            success: false,
            reason: "Internal Server Error"
        };
    }
};

