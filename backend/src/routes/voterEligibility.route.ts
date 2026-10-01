import { Router } from "express";

import authMiddleware from "../middleware/auth.middleware.js";
import roleMiddleware from "../middleware/role.middleware.js";

import {
    createVoterEligibilityController,
    getVoterEligibilityController,
    checkVoterEligibilityController,
    getVoterEligibilitiesByElectionController
} from "../controllers/voterEligibility.controller.js";


const router = Router();


router.post(
    "/",
    authMiddleware,
    roleMiddleware("admin"),
    createVoterEligibilityController
);


router.get(
    "/:electionId",
    authMiddleware,
    getVoterEligibilityController
);


router.get(
    "/:electionId/check",
    authMiddleware,
    checkVoterEligibilityController
);


router.get(
    "/:electionId/all",
    authMiddleware,
    roleMiddleware("admin"),
    getVoterEligibilitiesByElectionController
);


export default router;