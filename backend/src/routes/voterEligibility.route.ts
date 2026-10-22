import { Router } from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import roleMiddleware from "../middleware/role.middleware.js";
import {
    checkVoterEligibilityController,
} from "../controllers/voterEligibility.controller.js";

const router = Router();

router.get(
    "/:electionId",
    authMiddleware,
    roleMiddleware('voter'),
    checkVoterEligibilityController
);

export default router;