import { Router } from "express";

import authMiddleware from "../middleware/auth.middleware.js";

import {
    createAuthorization,
    getAuthorization,
    checkCanVote
} from "../controllers/votingAuthorization.controller.js";

const router = Router();

router.post(
    "/",
    authMiddleware,
    createAuthorization
);

router.get(
    "/:electionId",
    authMiddleware,
    getAuthorization
);

router.get(
    "/:electionId/can-vote",
    authMiddleware,
    checkCanVote
);

export default router;