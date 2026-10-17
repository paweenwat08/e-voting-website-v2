import { Router } from "express";

import authMiddleware from "../middleware/auth.middleware.js";
import roleMiddleware from "../middleware/role.middleware.js";

import {
    vote,
    createVoterEligibilityController,
    getVoterEligibilitiesByElectionController,
    getMyVoterEligibilitiesController,
    checkVoteStatus
} from "../controllers/voting.controller.js";

const router = Router();

// ลงคะแนนเสียง
router.post(
    "/",
    authMiddleware,
    roleMiddleware("voter"),
    vote
);

// สร้าง/กำหนดสิทธิ์ผู้ลงคะแนน (Admin เท่านั้น)
router.post(
    "/eligibility",
    authMiddleware,
    roleMiddleware("admin"),
    createVoterEligibilityController
);

// ดูรายชื่อผู้มีสิทธิ์ทั้งหมดใน Election (Admin เท่านั้น)
router.get(
    "/eligibility/:electionId/all",
    authMiddleware,
    roleMiddleware("admin"),
    getVoterEligibilitiesByElectionController
);

router.get(
    "/eligibility/me",
    authMiddleware,
    roleMiddleware("voter"),
    getMyVoterEligibilitiesController
);

router.get(
    "/status/:electionId",
    authMiddleware,
    roleMiddleware("voter"),
    checkVoteStatus
);

export default router;