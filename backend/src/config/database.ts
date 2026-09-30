import dotenv from "dotenv";

dotenv.config({
    path: "./.env"
});

import { Client } from "pg";

const connection = new Client({
    user: "postgres",
    host: "localhost",
    database: "evoting_v2",
    password: process.env.DB_PASSWORD,
    port: 5432,
});

export default connection;