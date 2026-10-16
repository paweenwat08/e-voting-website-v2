import { Router } from "express";

import {
    loginUser,
    getCurrentUser,
    logoutUser,
    registerUser,
    searchUsers
} from "../controllers/auth.controller.js";

import authMiddleware from "../middleware/auth.middleware.js";
import roleMiddleware from "../middleware/role.middleware.js";

const router = Router();

router.post(
    "/register",
    authMiddleware,
    roleMiddleware("admin"),
    registerUser
);

router.get(
    "/users",
    authMiddleware,
    roleMiddleware("admin"),
    searchUsers
);

router.route("/login").post(loginUser);

router.route("/me").get(
    authMiddleware,
    getCurrentUser
);

router.route("/logout").post(logoutUser);

export default router;