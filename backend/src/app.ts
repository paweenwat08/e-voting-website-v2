import express from "express";
import cors from "cors";

// routes import
import voterRouter from './routes/voter.route.js';
import partyRouter from './routes/party.route.js';
import candidateRouter from './routes/candidate.route.js';
import voteRouter from './routes/vote.route.js'

const app = express(); // create an express app

app.use(express.json());
app.use(cors());

// routes declaration
app.use("/api/v1/vote", voteRouter)
app.use("/api/v1/voters", voterRouter);
app.use("/api/v1/parties", partyRouter);
app.use("/api/v1/candidates", candidateRouter);

// example routes: http://localhost:4000/api/v1/voters/register

export default app;