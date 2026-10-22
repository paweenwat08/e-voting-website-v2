import { Router } from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import roleMiddleware from "../middleware/role.middleware.js";
import {
    checkVoterEligibilityController,
    createVoterEligibilityController
} from "../controllers/voterEligibility.controller.js";

const router = Router();

router.get(
    "/:electionId",
    authMiddleware,
    roleMiddleware('voter'),
    checkVoterEligibilityController
);

// Admin กำหนดสิทธิเลือกตั้ง
router.post(
    "/",
    authMiddleware,
    roleMiddleware("admin"),
    createVoterEligibilityController
);

export default router;