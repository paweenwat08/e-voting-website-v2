import pool from "../config/database.js";

let isRunning = false;

const closeExpiredElections = async () => {
    if (isRunning) {
        return;
    }

    isRunning = true;

    try {
        const result = await pool.query(
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

    } catch (error) {
        console.error("Election scheduler error:", error);
    } finally {
        isRunning = false;
    }
};

const openScheduleElections = async () => {
    if (isRunning) {
        return;
    }

    isRunning = true;

    try {
        const result = await pool.query(
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
    } catch (error) {
        console.error("Election scheduler error:", error);
    } finally {
        isRunning = false;
    }
}

export const runElectionSchedules = async () => {
    try {
        await openScheduleElections();
        await closeExpiredElections();
    } catch (error) {
        console.error("Election schedule error:", error);
    }
};