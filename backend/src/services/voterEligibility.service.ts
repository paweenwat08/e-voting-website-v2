import pool from "../config/database.js";

export const getVoterEligibilities = async (
    electionId: string
) => {
    const result = await pool.query(
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
    const result = await pool.query(
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
    const client = await pool.connect();
    let transactionStarted = false;

    try {
        await client.query("BEGIN");
        transactionStarted = true;

        // 1. Check election
        const electionResult = await client.query(
            `SELECT id FROM elections WHERE id = $1`,
            [electionId]
        );

        if (electionResult.rowCount === 0) {
            throw new Error("Election not found");
        }

        // 2. Check identity
        const identityResult = await client.query(
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

        // 3. Create voter eligibility
        const eligibilityResult = await client.query(
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

        if (eligibilityResult.rowCount === 0) {
            throw new Error("Voter is already eligible");
        }

        // 4. Create voting authorization
        await client.query(
            `
            INSERT INTO voting_authorizations (
                identity_id,
                election_id
            )
            VALUES ($1, $2)
            `,
            [identityId, electionId]
        );

        // 5. Commit both changes
        await client.query("COMMIT");
        transactionStarted = false;

        return eligibilityResult.rows[0];
    } catch (error) {
        if (transactionStarted) {
            try {
                await client.query("ROLLBACK");
            } catch (rollbackError) {
                console.error("Eligibility rollback error:", rollbackError);
            }
        }

        throw error;
    } finally {
        client.release();
    }
};

export const getElectionEligibilityUsers  = async (
    electionId: string,
    query = ""
) => {
    const result = await pool.query(
        `
        SELECT
            i.id,
            i.user_id,
            i.firstname,
            i.lastname,
            i.role,
            i.status,
            i.created_at,
            i.updated_at,
            EXISTS (
                SELECT 1
                FROM voter_eligibilities ve
                WHERE ve.identity_id = i.id
                  AND ve.election_id = $1
            ) AS is_eligible
        FROM identities i
        WHERE
            ($2 = '' OR i.user_id ILIKE '%' || $2 || '%')
        ORDER BY i.id ASC
        `,
        [electionId, query.trim()]
    );

    return result.rows;
};