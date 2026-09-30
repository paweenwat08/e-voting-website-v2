import { Request, Response, NextFunction } from "express";
import crypto from "node:crypto";

import connection from "../config/database.js";


const authMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const cookieHeader = req.headers.cookie;

        // No cookie
        if (!cookieHeader) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        // Find session cookie
        const cookies = cookieHeader
            .split(";")
            .map(cookie => cookie.trim());

        const sessionCookie = cookies.find(
            cookie => cookie.startsWith("session=")
        );

        if (!sessionCookie) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        // Get raw session token
        const sessionToken = sessionCookie
            .substring("session=".length);

        if (!sessionToken) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        // Hash session token
        const sessionTokenHash = crypto
            .createHash("sha256")
            .update(sessionToken)
            .digest("hex");

        // Find valid session
        const sessionResult = await connection.query(
            `
            SELECT
                id,
                identity_id,
                expires_at
            FROM sessions
            WHERE session_token_hash = $1
            LIMIT 1
            `,
            [sessionTokenHash]
        );

        const session = sessionResult.rows[0];

        if (!session) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        // Check session expiration
        if (new Date(session.expires_at) <= new Date()) {

            // Delete expired session
            await connection.query(
                `
                DELETE FROM sessions
                WHERE id = $1
                `,
                [session.id]
            );

            return res.status(401).json({
                success: false,
                message: "Session expired"
            });
        }

        // Find identity
        const identityResult = await connection.query(
            `
            SELECT
                id,
                user_id,
                firstname,
                lastname,
                role,
                status
            FROM identities
            WHERE id = $1
            LIMIT 1
            `,
            [session.identity_id]
        );

        const identity = identityResult.rows[0];

        if (!identity) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        // Check identity status
        if (identity.status === "disabled") {
            return res.status(403).json({
                success: false,
                message: "Identity is disabled"
            });
        }

        // Attach identity to request
        req.identity = {
            id: identity.id,
            userId: identity.user_id,
            firstname: identity.firstname,
            lastname: identity.lastname,
            role: identity.role,
            status: identity.status
        };

        next();

    } catch (error) {
        console.error("Auth middleware error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};


export default authMiddleware;