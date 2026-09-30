import express from "express";
import cors from "cors";

// routes import
import authRouter from './routes/auth.route.js'
import votingAuthorizationRouter from "./routes/votingAuthorization.route.js";
import votingRouter from "./routes/voting.route.js";

// import testRouter from './routes/test.route.js'



const app = express(); // create an express app

app.use(express.json());
app.use(cors());

// routes declaration
app.use("/api/v2/voting-authorizations",votingAuthorizationRouter);
app.use("/api/v2/votes",votingRouter);
app.use("/api/v2/auth", authRouter);

// app.use("/api/v2/test", testRouter);

// example routes: http://localhost:5432/api/v1/voters/register

export default app;