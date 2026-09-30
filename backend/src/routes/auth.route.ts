import { Router } from "express";

import {
    loginUser,
    getCurrentUser,
    logoutUser,
    registerUser
} from "../controllers/auth.controller.js";

import authMiddleware from "../middleware/auth.middleware.js";

const router = Router();

router.route("/register").post(registerUser);

router.route("/login").post(loginUser);

router.route("/me").get(
    authMiddleware,
    getCurrentUser
);

router.route("/logout").post(logoutUser);

export default router;