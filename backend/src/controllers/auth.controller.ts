
import type { Request, Response } from "express";

import {
    authenticateUser,
    createSession,
    createUser,
    findIdentityByUserId,
    searchUsers,
    updateUser as updateUserService,
    deleteSession,
} from "../services/auth.service.js";

import { createAuditLog } from "../services/auditLog.service.js";

const registerUser = async (
    req: Request,
    res: Response
) => {
    try {
        const {
            userId,
            firstname,
            lastname,
            password,
        } = req.body;

        if (
            typeof userId !== "string" ||
            typeof firstname !== "string" ||
            typeof lastname !== "string" ||
            typeof password !== "string" ||
            userId.trim() === "" ||
            firstname.trim() === "" ||
            lastname.trim() === "" ||
            password === ""
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid user information",
            });
        }

        const existingUser = await findIdentityByUserId(
            userId
        );

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "User ID already exists",
            });
        }

        const user = await createUser(
            userId,
            firstname,
            lastname,
            password
        );

        return res.status(201).json({
            success: true,
            message: "User created successfully",
            user: {
                id: user.id,
                user_id: user.user_id,
                firstname: user.firstname,
                lastname: user.lastname,
                role: user.role,
                status: user.status,
                created_at: user.created_at,
                updated_at: user.updated_at,
            },
        });
    } catch (error) {
        console.error("Create user error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};

const loginUser = async (
    req: Request,
    res: Response
) => {
    try {
        const { userId, password } = req.body;

        if (
            typeof userId !== "string" ||
            typeof password !== "string" ||
            userId.trim() === "" ||
            password === ""
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid login credentials",
            });
        }

        const identity = await authenticateUser(
            userId,
            password
        );

        if (!identity) {
            try {
                await createAuditLog(
                    "LOGIN_FAILED",
                    null,
                    {
                        userId: userId.trim(),
                    }
                );
            } catch (auditError) {
                console.error(
                    "Failed to create login audit log:",
                    auditError
                );
            }

            return res.status(401).json({
                success: false,
                message: "Invalid login credentials",
            });
        }

        const { sessionToken, session } =
            await createSession(identity.id);

        res.cookie("session", sessionToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            expires: session.expires_at,
        });

        try {
            await createAuditLog(
                "LOGIN_SUCCESS",
                identity.id
            );
        } catch (auditError) {
            console.error(
                "Failed to create login audit log:",
                auditError
            );
        }

        return res.status(200).json({
            success: true,
            message: "Login successful",
        });
    } catch (error) {
        console.error("Login error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};

const getCurrentUser = async (
    req: Request,
    res: Response
) => {
    try {
        if (!req.identity) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        return res.status(200).json({
            success: true,
            identity: req.identity,
        });
    } catch (error) {
        console.error("Get current user error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};

const logoutUser = async (
    req: Request,
    res: Response
) => {
    try {
        const cookieHeader = req.headers.cookie;

        const sessionCookie = cookieHeader
            ?.split(";")
            .map((cookie) => cookie.trim())
            .find((cookie) => cookie.startsWith("session="));

        if (sessionCookie) {
            const sessionToken = sessionCookie.substring(
                "session=".length
            );

            if (sessionToken) {
                await deleteSession(sessionToken);
            }
        }

        res.clearCookie("session", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        });

        return res.status(200).json({
            success: true,
            message: "Logout successful",
        });
    } catch (error) {
        console.error("Logout error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};

const searchUsersController = async (
    req: Request,
    res: Response
) => {
    try {
        const query =
            typeof req.query.q === "string"
                ? req.query.q.trim()
                : "";

        const users = await searchUsers(query);

        return res.status(200).json({
            success: true,
            users,
        });
    } catch (error) {
        console.error("Search users error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};

const updateUser = async (
    req: Request,
    res: Response
) => {
    try {
        if (!req.identity) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        const identityId = req.params.userId;
        const { firstname, lastname, status } = req.body;

        if (
            typeof identityId !== "string" ||
            !/^\d+$/.test(identityId) ||
            typeof firstname !== "string" ||
            typeof lastname !== "string" ||
            typeof status !== "string" ||
            firstname.trim() === "" ||
            lastname.trim() === "" ||
            !["active", "disabled"].includes(status)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid user information",
            });
        }

        const user = await updateUserService(
            identityId,
            {
                firstname: firstname.trim(),
                lastname: lastname.trim(),
                status: status as "active" | "disabled",
            }
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        try {
            await createAuditLog(
                "ADMIN_ACTION",
                Number(req.identity.id),
                {
                    action: "USER_UPDATED",
                    targetIdentityId: user.id,
                    targetUserId: user.user_id,
                    updatedFields: [
                        "firstname",
                        "lastname",
                        "status",
                    ],
                    newStatus: user.status,
                }
            );
        } catch (auditError) {
            console.error(
                "Failed to create user update audit log:",
                auditError
            );
        }

        return res.status(200).json({
            success: true,
            message: "User updated successfully",
            user,
        });
    } catch (error) {
        console.error("Update user error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};

export {
    registerUser,
    loginUser,
    getCurrentUser,
    logoutUser,
    searchUsersController,
    updateUser,
};
