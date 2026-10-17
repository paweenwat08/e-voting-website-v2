import connection from "../config/database.js";

let isRunning = false;

export const closeExpiredElections = async () => {
    if (isRunning) {
        return;
    }

    isRunning = true;

    try {
        const result = await connection.query(
            `
            UPDATE elections
            SET
                status = 'closed',
                updated_at = CURRENT_TIMESTAMP
            WHERE status = 'open'
              AND end_at <= CURRENT_TIMESTAMP
            RETURNING id;
            `
        );

        if (result.rowCount && result.rowCount > 0) {
            console.log(
                `Closed ${result.rowCount} expired election(s)`
            );
        }
    } catch (error) {
        console.error("Election scheduler error:", error);
    } finally {
        isRunning = false;
    }
};

export const openScheduleElections = async () => {
    if (isRunning) {
        return;
    }

    isRunning = true;

    try {
        const result = await connection.query(
            `
            UPDATE elections
            SET
                status = 'open',
                updated_at = CURRENT_TIMESTAMP
            WHERE status = 'draft'
              AND start_at <= CURRENT_TIMESTAMP
            RETURNING id;
            `
        );

        if (result.rowCount && result.rowCount > 0) {
            console.log(
                `opened ${result.rowCount} election(s)`
            );
        }
    } catch (error) {
        console.error("Election scheduler error:", error);
    } finally {
        isRunning = false;
    }
}