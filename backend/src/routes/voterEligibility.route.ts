import { Router } from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import roleMiddleware from "../middleware/role.middleware.js";
import {
    checkVoterEligibilityController,
    createVoterEligibilityController,
    getElectionEligibilityUsersController
} from "../controllers/voterEligibility.controller.js";

const router = Router();

router.get(
    "/:electionId",
    authMiddleware,
    roleMiddleware('voter'),
    checkVoterEligibilityController
);

router.post(
    "/",
    authMiddleware,
    roleMiddleware("admin"),
    createVoterEligibilityController
);

router.get(
    "/:electionId/users",
    authMiddleware,
    roleMiddleware("admin"),
    getElectionEligibilityUsersController
);

export default router;