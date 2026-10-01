import { Router } from "express";

import authMiddleware from "../middleware/auth.middleware.js";
import roleMiddleware from "../middleware/role.middleware.js";

import {
    createCandidateController,
    getCandidatesByElectionController,
    getCandidateByIdController,
    createCandidateEligibilityController,
    getCandidateEligibilitiesByElectionController,
    revokeCandidateEligibilityController
} from "../controllers/candidate.controller.js";

const router = Router();

// สร้างผู้สมัครคนใหม่ -> ต้องมีสิทธิก่อน
router.post(
    "/",
    authMiddleware,
    roleMiddleware("admin"),
    createCandidateController
);

// ดูรายการผู้สมัครตาม Election ID
router.get(
    "/election/:electionId",
    authMiddleware,
    getCandidatesByElectionController
);

// ดูข้อมูลผู้สมัครรายคน
router.get(
    "/:candidateId",
    authMiddleware,
    getCandidateByIdController
);

// มอบสิทธิ์ให้ผู้ที่สามารถสมัครเป็นผู้สมัคร
router.post(
    "/eligibility",
    authMiddleware,
    roleMiddleware("admin"),
    createCandidateEligibilityController
);

// ดูรายการสิทธิ์ของผู้สมัครใน Election นั้นๆ
router.get(
    "/eligibility/election/:electionId/candidates",
    authMiddleware,
    roleMiddleware("admin"),
    getCandidateEligibilitiesByElectionController
);

// ถอนสิทธิ์ผู้สมัคร
router.patch(
    "/eligibility/revoke",
    authMiddleware,
    roleMiddleware("admin"),
    revokeCandidateEligibilityController
);

export default router;