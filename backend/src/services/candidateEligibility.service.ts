import connection from "../config/database.js";

export const createCandidateEligibility = async (
    identityId: string,
    electionId: string
) => {
    const result = await connection.query(
        `
        INSERT INTO candidate_eligibilities (
            identity_id,
            election_id,
            status
        )
        VALUES (
            $1,
            $2,
            'eligible'
        )
        RETURNING
            id,
            identity_id,
            election_id,
            status,
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

export const findCandidateEligibility = async (
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
            created_at,
            updated_at
        FROM candidate_eligibilities
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

export const checkCandidateEligibility = async (
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
            created_at,
            updated_at
        FROM candidate_eligibilities
        WHERE identity_id = $1
          AND election_id = $2
          AND status = 'eligible'
        LIMIT 1
        `,
        [
            identityId,
            electionId
        ]
    );

    return result.rows[0] ?? null;
};

export const getCandidateEligibilitiesByElection = async (
    electionId: string
) => {
    const result = await connection.query(
        `
        SELECT
            ce.id,
            ce.identity_id,
            ce.election_id,
            ce.status,
            ce.created_at,
            ce.updated_at,
            i.user_id,
            i.firstname,
            i.lastname
        FROM candidate_eligibilities ce
        INNER JOIN identities i
            ON ce.identity_id = i.id
        WHERE ce.election_id = $1
        ORDER BY ce.id ASC
        `,
        [electionId]
    );

    return result.rows;
};

export const revokeCandidateEligibility = async (
    identityId: string,
    electionId: string
) => {
    const result = await connection.query(
        `
        UPDATE candidate_eligibilities
        SET
            status = 'ineligible',
            updated_at = CURRENT_TIMESTAMP
        WHERE identity_id = $1
          AND election_id = $2
          AND status = 'eligible'
        RETURNING
            id,
            identity_id,
            election_id,
            status,
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