import connection from "./config/database.js";
import app from "./app.js";

import { 
    closeExpiredElections,
    openScheduleElections
} from "./Schedule/ElectionSchedule.js";

const startServer = async () => {
    try {
        await connection.connect();

        const PORT = process.env.PORT || 4000;

        const server = app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
            
        });

        server.on("error", (error) => {
            console.log("Server ERROR:", error);
            
        })

        openScheduleElections();
        closeExpiredElections();
        setInterval(
            () => {
                openScheduleElections();
                closeExpiredElections();
            }, 30 * 1000);

    } catch (error) {
        console.log("PostgreSQL connection failed", error);
        
    }
}

startServer();
