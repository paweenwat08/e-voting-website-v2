import { Router } from "express";

import authMiddleware from "../middleware/auth.middleware.js";
import roleMiddleware from "../middleware/role.middleware.js";

import {
    createCandidateController,
    getCandidatesByElectionController,
    getCandidateByIdController
} from "../controllers/candidate.controller.js";

const router = Router();

router.post(
    "/",
    authMiddleware,
    roleMiddleware("admin"),
    createCandidateController
);

router.get(
    "/election/:electionId",
    authMiddleware,
    getCandidatesByElectionController
);

router.get(
    "/:candidateId",
    authMiddleware,
    getCandidateByIdController
);

export default router;