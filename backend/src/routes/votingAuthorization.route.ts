import { Router } from "express";

import authMiddleware from "../middleware/auth.middleware.js";
import roleMiddleware from "../middleware/role.middleware.js";

import {
    createAuthorization,
    getAuthorization,
    revokeAuthorization,
    checkCanVote
} from "../controllers/votingAuthorization.controller.js";

const router = Router();

router.post(
    "/",
    authMiddleware,
    roleMiddleware("admin"),
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

router.patch(
    "/revoke",
    authMiddleware,
    roleMiddleware("admin"),
    revokeAuthorization
);

export default router;