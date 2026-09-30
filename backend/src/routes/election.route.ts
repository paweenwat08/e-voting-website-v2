import { Router } from "express";

import authMiddleware from "../middleware/auth.middleware.js";
import roleMiddleware from "../middleware/role.middleware.js";

import {
    createElectionController,
    openElectionController,
    closeElectionController
} from "../controllers/election.controller.js";

const router = Router();

router.post(
    "/",
    authMiddleware,
    roleMiddleware("admin"),
    createElectionController
);

router.patch(
    "/:electionId/open",
    authMiddleware,
    roleMiddleware("admin"),
    openElectionController
);

router.patch(
    "/:electionId/close",
    authMiddleware,
    roleMiddleware("admin"),
    closeElectionController
);

export default router;