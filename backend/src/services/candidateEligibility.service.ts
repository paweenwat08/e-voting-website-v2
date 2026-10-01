import connection from "../config/database.js";

export const createCandidateEligibility = async (
    identityId: number,
    electionId: number
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
    identityId: number,
    electionId: number
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
    identityId: number,
    electionId: number
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