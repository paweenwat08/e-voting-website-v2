import { Router } from "express";

import authMiddleware from "../middleware/auth.middleware.js";
import roleMiddleware from "../middleware/role.middleware.js";

import {
    createElectionController,
    openElectionController
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

export default router;