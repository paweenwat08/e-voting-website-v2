import pool from "./config/database.js";
import app from "./app.js";

import { runElectionSchedules } from "./Schedule/ElectionSchedule.js";

const PORT = Number(process.env.PORT) || 4000;

const startServer = async () => {
    try {
        // Verify PostgreSQL connection without holding a client
        await pool.query("SELECT 1");

        console.log("PostgreSQL connected successfully");

        const server = app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });

        server.on("error", (error) => {
            console.error("Server ERROR:", error);
        });

        // Run election schedules once at startup
        await runElectionSchedules();

        // Check election schedules every 30 seconds
        const scheduler = setInterval(() => {
            void runElectionSchedules();
        }, 30_000);

        // Prevent the interval from keeping the process alive during shutdown
        const shutdown = async () => {
            console.log("Shutting down server...");

            clearInterval(scheduler);

            server.close(async () => {
                try {
                    await pool.end();
                    console.log("PostgreSQL pool closed");
                    process.exit(0);
                } catch (error) {
                    console.error("Error closing PostgreSQL pool:", error);
                    process.exit(1);
                }
            });
        };

        process.once("SIGINT", shutdown);
        process.once("SIGTERM", shutdown);

    } catch (error) {
        console.error("Server startup failed:", error);
        process.exitCode = 1;
    }
};

void startServer();