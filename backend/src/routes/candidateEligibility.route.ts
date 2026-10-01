import { Router } from "express";

import authMiddleware from "../middleware/auth.middleware.js";
import roleMiddleware from "../middleware/role.middleware.js";

import {
    createCandidateEligibilityController,
    getCandidateEligibilitiesByElectionController,
    revokeCandidateEligibilityController
} from "../controllers/candidateEligibility.controller.js";

const router = Router();

router.post(
    "/",
    authMiddleware,
    roleMiddleware("admin"),
    createCandidateEligibilityController
);

router.get(
    "/election/:electionId",
    authMiddleware,
    roleMiddleware("admin"),
    getCandidateEligibilitiesByElectionController
);

router.patch(
    "/revoke",
    authMiddleware,
    roleMiddleware("admin"),
    revokeCandidateEligibilityController
);

export default router;