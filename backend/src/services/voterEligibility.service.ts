import connection from "../config/database.js";

export const getVoterEligibilities = async (
    electionId: string
) => {
    const result = await connection.query(
        `
        SELECT
            ve.id,
            ve.identity_id,
            ve.election_id,
            ve.created_at,
            i.user_id,
            i.firstname,
            i.lastname,
            i.role,
            i.status AS identity_status
        FROM voter_eligibilities ve
        INNER JOIN identities i
            ON ve.identity_id = i.id
        WHERE ve.election_id = $1
        ORDER BY i.user_id ASC
        `,
        [electionId]
    );

    return result.rows;
};

export const checkVoterEligibility = async (
    identityId: string,
    electionId: string
) => {
    const result = await connection.query(
        `
        SELECT EXISTS (
            SELECT 1
            FROM voter_eligibilities
            WHERE identity_id = $1
              AND election_id = $2
        ) AS is_eligible
        `,
        [identityId, electionId]
    );

    return result.rows[0].is_eligible as boolean;
};

export const addVoterEligibility = async (
    electionId: string,
    identityId: string
) => {
    // ตรวจสอบว่า Election มีอยู่จริง
    const electionResult = await connection.query(
        `SELECT id FROM elections WHERE id = $1`,
        [electionId]
    );

    if (electionResult.rowCount === 0) {
        throw new Error("Election not found");
    }

    // ตรวจสอบว่า Identity มีอยู่จริง
    const identityResult = await connection.query(
        `
        SELECT id, status
        FROM identities
        WHERE id = $1
        `,
        [identityId]
    );

    if (identityResult.rowCount === 0) {
        throw new Error("Identity not found");
    }

    if (identityResult.rows[0].status !== "active") {
        throw new Error("Identity is not active");
    }

    // เพิ่มสิทธิเลือกตั้ง
    const result = await connection.query(
        `
        INSERT INTO voter_eligibilities (
            identity_id,
            election_id
        )
        VALUES ($1, $2)
        ON CONFLICT (identity_id, election_id) DO NOTHING
        RETURNING *
        `,
        [identityId, electionId]
    );

    if (result.rowCount === 0) {
        throw new Error("Voter is already eligible");
    }

    return result.rows[0];
};