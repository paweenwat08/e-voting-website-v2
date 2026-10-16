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
