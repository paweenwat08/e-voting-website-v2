import connection from "../config/database.js";

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

export const revokeVotingAuthorization = async (
    identityId: string,
    electionId: string
) => {
    const result = await connection.query(
        `
        UPDATE voting_authorizations
        SET
            status = 'revoked',
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

export const canVote = async (
    identityId: string,
    electionId: string
) => {
    // Check eligibility
    const eligibilityResult = await connection.query(
        `
        SELECT
            id,
            identity_id,
            election_id,
            status,
            created_at,
            updated_at
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

    const eligibility = eligibilityResult.rows[0] ?? null;

    if (!eligibility) {
        return false;
    }

    if (eligibility.status !== "eligible") {
        return false;
    }


    // Check voting authorization
    const authorizationResult = await connection.query(
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

    const authorization =
        authorizationResult.rows[0] ?? null;

    if (!authorization) {
        return false;
    }

    if (authorization.status !== "unused") {
        return false;
    }

    return true;
};
