import { Router } from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import {
    checkVoterEligibilityController,
} from "../controllers/voterEligibility.controller.js";

const router = Router();

router.get(
    "/:electionId",
    authMiddleware,
    checkVoterEligibilityController
);

export default router;