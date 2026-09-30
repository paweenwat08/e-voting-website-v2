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