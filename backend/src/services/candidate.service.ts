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
        VALUES ($1, $2, 'eligible')
        RETURNING
            id,
            identity_id,
            election_id,
            status,
            created_at,
            updated_at
        `,
        [identityId, electionId]
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
        [identityId, electionId]
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
            status
        FROM candidate_eligibilities
        WHERE identity_id = $1
          AND election_id = $2
          AND status = 'eligible'
        LIMIT 1
        `,
        [identityId, electionId]
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
        [identityId, electionId]
    );

    return result.rows[0] ?? null;
};

export const createCandidate = async (
    identityId: string,
    electionId: string,
    candidateNumber: string,
    description: string | null
) => {
    const eligibility = await checkCandidateEligibility(
        identityId,
        electionId
    );

    if (!eligibility) {
        return {
            success: false as const,
            reason: "Candidate is not eligible"
        };
    }

    const electionResult = await connection.query(
        `
        SELECT id, status
        FROM elections
        WHERE id = $1
        LIMIT 1
        `,
        [electionId]
    );

    const election = electionResult.rows[0];

    if (!election) {
        return {
            success: false as const,
            reason: "Election not found"
        };
    }

    if (
        election.status !== "draft" &&
        election.status !== "scheduled"
    ) {
        return {
            success: false as const,
            reason: "Election is not accepting candidates"
        };
    }

    const existingCandidate = await connection.query(
        `
        SELECT id
        FROM candidates
        WHERE election_id = $1
          AND candidate_number = $2
        LIMIT 1
        `,
        [electionId, candidateNumber]
    );

    if (existingCandidate.rows.length > 0) {
        return {
            success: false as const,
            reason: "Candidate number already exists"
        };
    }

    try {
        const result = await connection.query(
            `
            INSERT INTO candidates (
                identity_id,
                election_id,
                candidate_number,
                description
            )
            VALUES ($1, $2, $3, $4)
            RETURNING
                id,
                identity_id,
                election_id,
                candidate_number,
                description,
                created_at,
                updated_at
            `,
            [
                identityId,
                electionId,
                candidateNumber,
                description
            ]
        );

        return {
            success: true as const,
            candidate: result.rows[0]
        };
    } catch (error: unknown) {
        const databaseError = error as {
            code?: string;
            constraint?: string;
        };

        // Handle duplicate candidate numbers even if two requests
        // attempt to create the same number at nearly the same time.
        if (
            databaseError.code === "23505" &&
            databaseError.constraint?.includes(
                "candidate"
            )
        ) {
            return {
                success: false as const,
                reason: "Candidate number already exists"
            };
        }

        throw error;
    }
};

export const getCandidatesByElection = async (
    electionId: string
) => {
    const result = await connection.query(
        `
        SELECT
            c.id,
            c.identity_id,
            c.election_id,
            c.candidate_number,
            c.description,
            c.created_at,
            c.updated_at,
            i.firstname,
            i.lastname,
            COUNT(b.id)::int AS votes
        FROM candidates c
        INNER JOIN identities i
            ON c.identity_id = i.id
        LEFT JOIN ballots b
            ON b.candidate_id = c.id
        WHERE c.election_id = $1
        GROUP BY
            c.id,
            c.identity_id,
            c.election_id,
            c.candidate_number,
            c.description,
            c.created_at,
            c.updated_at,
            i.firstname,
            i.lastname
        ORDER BY c.candidate_number ASC
        `,
        [electionId]
    );

    return result.rows;
};

export const getCandidateById = async (
    candidateId: string
) => {
    const result = await connection.query(
        `
        SELECT
            c.id,
            c.identity_id,
            c.election_id,
            c.candidate_number,
            c.description,
            c.created_at,
            c.updated_at,
            i.firstname,
            i.lastname
        FROM candidates c
        INNER JOIN identities i
            ON c.identity_id = i.id
        WHERE c.id = $1
        LIMIT 1
        `,
        [candidateId]
    );

    return result.rows[0] ?? null;
};