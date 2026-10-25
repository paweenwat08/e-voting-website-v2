import { Router } from "express";

import authMiddleware from "../middleware/auth.middleware.js";
import roleMiddleware from "../middleware/role.middleware.js";

import {
    createCandidateController,
    getCandidatesByElectionController,
    getCandidateByIdController,
    getAllCandidatesController
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

//never used , maybe in the future
router.get(
    "/",
    authMiddleware,
    roleMiddleware("admin"),
    getAllCandidatesController
);

export default router;