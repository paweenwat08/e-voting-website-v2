import { Router } from "express";

import authMiddleware from "../middleware/auth.middleware.js";
import roleMiddleware from "../middleware/role.middleware.js";

const router = Router();

router.get(
    "/admin-test",
    authMiddleware,
    roleMiddleware("admin"),
    (req, res) => {
        return res.status(200).json({
            success: true,
            message: "Admin access granted"
        });
    }
);

export default router;