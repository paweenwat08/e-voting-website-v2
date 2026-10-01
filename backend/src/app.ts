import express from "express";
import cors from "cors";

// routes import
import electionRouter from './routes/election.route.js'
import authRouter from './routes/auth.route.js'
import votingAuthorizationRouter from "./routes/votingAuthorization.route.js";
import votingRouter from "./routes/voting.route.js";
import candidateRouter from "./routes/candidate.route.js";
import candidateEligibilityRouter from "./routes/candidateEligibility.route.js";
import voterEligibilityRouter from "./routes/voterEligibility.route.js"

const app = express(); // create an express app

app.use(express.json());
app.use(cors());

// routes declaration
app.use(
    "/api/v2/elections",
    electionRouter);

app.use(
    "/api/v2/voting-authorizations",
    votingAuthorizationRouter);

app.use(
    "/api/v2/votes",
    votingRouter);

app.use(
    "/api/v2/auth", 
    authRouter);

app.use(
    "/api/v2/candidates",
    candidateRouter);

app.use(
    "/api/v2/candidate-eligibilities",
    candidateEligibilityRouter
);

app.use(
    "/api/v2/voter-eligibilities",
    voterEligibilityRouter
)

// example routes: http://localhost:5432/api/v1/voters/register

export default app;