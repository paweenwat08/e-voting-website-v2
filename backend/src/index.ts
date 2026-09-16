import dotenv from "dotenv";
dotenv.config({
    path: './.env'
});

import connectDB from "./config/database.js";
import app from "./app.js";

const startServer = async () => {
    try {
        await connectDB();

        const PORT = process.env.PORT || 4000

        const server = app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
            
        });

        server.on("error", (error) => {
            console.log("Server ERROR:", error);
            
        })

    } catch (error) {
        console.log("MongoDB connection failed !!!", error);
        
    }
}

startServer();
