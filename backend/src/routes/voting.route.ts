import { Router } from "express";

import authMiddleware from "../middleware/auth.middleware.js";
import roleMiddleware from "../middleware/role.middleware.js";

import {
    vote,
    createAuthorization,
    getAuthorization,
    revokeAuthorization,
    checkCanVote,
    createVoterEligibilityController,
    getVoterEligibilityController,
    checkVoterEligibilityController,
    getVoterEligibilitiesByElectionController
} from "../controllers/voting.controller.js";

const router = Router();

// ลงคะแนนเสียง
router.post(
    "/",
    authMiddleware,
    roleMiddleware("voter"),
    vote
);

// เช็คว่ามีสิทธิโหวตในการเลือกตั้งนี้มั้ย
router.get(
    "/:electionId/can-vote",
    authMiddleware,
    checkCanVote
);

// สร้าง/กำหนดสิทธิ์ผู้ลงคะแนน (Admin เท่านั้น)
router.post(
    "/eligibility",
    authMiddleware,
    roleMiddleware("admin"),
    createVoterEligibilityController
);

// ดูสิทธิ์ผู้ลงคะแนนของตัวเองใน Election นั้น
router.get(
    "/eligibility/:electionId",
    authMiddleware,
    getVoterEligibilityController
);

// ตรวจสอบสิทธิ์ผู้ลงคะแนน
router.get(
    "/eligibility/:electionId/check",
    authMiddleware,
    checkVoterEligibilityController
);

// ดูรายชื่อผู้มีสิทธิ์ทั้งหมดใน Election (Admin เท่านั้น)
router.get(
    "/eligibility/:electionId/all",
    authMiddleware,
    roleMiddleware("admin"),
    getVoterEligibilitiesByElectionController
);

// 🟢 [POST /api/voting/authorization] -> สร้าง Authorization ให้ผู้ลงคะแนน (Admin เท่านั้น)
router.post(
    "/authorization",
    authMiddleware,
    roleMiddleware("admin"),
    createAuthorization
);

// 🔵 [GET /api/voting/authorization/:electionId] -> ดูข้อมูล Authorization ตาม Election
router.get(
    "/authorization/:electionId",
    authMiddleware,
    getAuthorization
);

// 🟡 [PATCH /api/voting/authorization/revoke] -> ยกเลิก/ริบ Authorization (Admin เท่านั้น)
router.patch(
    "/authorization/revoke",
    authMiddleware,
    roleMiddleware("admin"),
    revokeAuthorization
);

export default router;