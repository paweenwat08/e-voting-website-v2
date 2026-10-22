import connection from "../config/database.js";

export const createElection = async (
    title: string,
    description: string,
    startAt: Date,
    endAt: Date
) => {
    const result = await connection.query(
        `
        INSERT INTO elections (
            title,
            description,
            start_at,
            end_at,
            status
        )
        VALUES (
            $1,
            $2,
            $3,
            $4,
            'draft'
        )
        RETURNING
            id,
            title,
            description,
            start_at,
            end_at,
            status,
            created_at,
            updated_at
        `,
        [
            title.trim(),
            description.trim(),
            startAt,
            endAt
        ]
    );

    return result.rows[0];
};

export const openElection = async (
    electionId: string
) => {
    const result = await connection.query(
        `
        UPDATE elections
        SET
            status = 'open',
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
          AND status IN ('draft', 'scheduled')
        RETURNING
            id,
            title,
            description,
            start_at,
            end_at,
            status,
            created_at,
            updated_at
        `,
        [electionId]
    );

    return result.rows[0] ?? null;
};

export const closeElection = async (
    electionId: string
) => {
    const result = await connection.query(
        `
        UPDATE elections
        SET
            status = 'closed',
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
          AND status = 'open'
        RETURNING
            id,
            title,
            description,
            start_at,
            end_at,
            status,
            created_at,
            updated_at
        `,
        [electionId]
    );

    return result.rows[0] ?? null;
};

export const getAllElections = async () => {
    const result = await connection.query(`
        SELECT
            id,
            title,
            description,
            start_at AS "startAt",
            end_at AS "endAt",
            status,
            created_at AS "createdAt",
            updated_at AS "updatedAt"
        FROM elections
        ORDER BY start_at DESC
    `);

    return result.rows;
};

export const getElectionById = async (
    electionId: number
) => {
    const result = await connection.query(
        `
        SELECT
            id,
            title,
            description,
            start_at AS "startAt",
            end_at AS "endAt",
            status,
            created_at AS "createdAt",
            updated_at AS "updatedAt"
        FROM elections
        WHERE id = $1
        `,
        [electionId]
    );

    return result.rows[0] ?? null;
};

export const updateElection = async (
    electionId: string,
    title: string,
    description: string,
    startAt: Date,
    endAt: Date
) => {
    const result = await connection.query(
        `
        UPDATE elections
        SET
            title = $2,
            description = $3,
            start_at = $4,
            end_at = $5,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
          AND status IN ('draft', 'scheduled')
        RETURNING
            id,
            title,
            description,
            start_at AS "startAt",
            end_at AS "endAt",
            status,
            created_at AS "createdAt",
            updated_at AS "updatedAt"
        `,
        [
            electionId,
            title.trim(),
            description.trim(),
            startAt,
            endAt
        ]
    );

    return result.rows[0] ?? null;
};

export const getElectionResults = async (electionId: string) => {
    // ตรวจสอบสถานะการเลือกตั้งก่อนเปิดเผยผลคะแนน
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
            success: false,
            reason: "Election not found",
        };
    }

    if (election.status !== "closed") {
        return {
            success: false,
            reason: "Results are available only after the election closes",
        };
    }

    const result = await connection.query(
        `
        SELECT
            c.id AS candidate_id,
            c.candidate_number,
            c.description,
            i.firstname,
            i.lastname,
            COUNT(b.id)::int AS total_votes
        FROM candidates c
        INNER JOIN identities i
            ON i.id = c.identity_id
        LEFT JOIN ballots b
            ON b.candidate_id = c.id
        WHERE c.election_id = $1
        GROUP BY
            c.id,
            c.candidate_number,
            c.description,
            i.firstname,
            i.lastname
        ORDER BY c.candidate_number ASC
        `,
        [electionId]
    );

    const totalVotes = result.rows.reduce(
        (total: number, candidate: { total_votes: number }) =>
            total + candidate.total_votes,
        0
    );

    return {
        success: true,
        electionId,
        totalVotes,
        candidates: result.rows,
    };
};
