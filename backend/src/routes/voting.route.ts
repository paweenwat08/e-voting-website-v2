import { Router } from "express";

import authMiddleware from "../middleware/auth.middleware.js";
import roleMiddleware from "../middleware/role.middleware.js";

import {
    vote,
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

router.get(
    "/status/:electionId",
    authMiddleware,
    roleMiddleware("voter"),
    checkVoteStatus
);

export default router;