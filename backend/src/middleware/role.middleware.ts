import { Request, Response, NextFunction } from "express";

type AllowedRole = "voter" | "admin";

const roleMiddleware = (requiredRole: AllowedRole) => {
    return (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {
            // User must be authenticated first
            if (!req.identity) {
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized"
                });
            }

            // Check user's role
            if (req.identity.role !== requiredRole) {
                return res.status(403).json({
                    success: false,
                    message: "Forbidden"
                });
            }

            next();

        } catch (error) {
            console.error("Role middleware error:", error);

            return res.status(500).json({
                success: false,
                message: "Internal Server Error"
            });
        }
    };
};

export default roleMiddleware;