import { Router } from "express";

import authMiddleware from "../middleware/auth.middleware.js";
import roleMiddleware from "../middleware/role.middleware.js";

import {
    vote
} from "../controllers/voting.controller.js";

const router = Router();

router.post(
    "/",
    authMiddleware,
    roleMiddleware("voter"),
    vote
);

export default router;