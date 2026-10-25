import pool from "../config/database.js";

export const createCandidate = async (
    identityId: string,
    electionId: string,
    candidateNumber: string,
    description: string | null
) => {

    const electionResult = await pool.query(
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
            reason: "Cannot add candidate if election is opened or closed"
        };
    }

    const existingCandidate = await pool.query(
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
        const result = await pool.query(
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
        description
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
    const result = await pool.query(
        `
        SELECT
            c.id,
            c.identity_id,
            c.election_id,
            c.candidate_number,
            c.description,
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
    const result = await pool.query(
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

export const getAllCandidates = async () => {
    const result = await pool.query(
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
            e.title AS election_title
        FROM candidates AS c
        INNER JOIN identities AS i
            ON c.identity_id = i.id
        INNER JOIN elections AS e
            ON c.election_id = e.id
        ORDER BY
            c.election_id ASC,
            c.candidate_number ASC
        `
    );

    return result.rows;
};
