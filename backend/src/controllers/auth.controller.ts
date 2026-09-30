import { Request, Response } from "express";
import crypto from "node:crypto";

import {
  authenticateUser,
  createSession,
  createUser,
  findIdentityByUserId
} from "../services/auth.service.js";
import { createAuditLog } from "../services/auditLog.service.js";

import connection from "../config/database.js";

const registerUser = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      userId,
      firstname,
      lastname,
      password
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
        message: "Invalid user information"
      });
    }

    const existingUser = await findIdentityByUserId(userId);

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User ID already exists"
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
      user
    });

  } catch (error) {
    console.error("Create user error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};

const loginUser = async (
    req: Request,
    res: Response
) => {
    try {
        const { userId, password } = req.body;

        // Validate request body
        if (
            typeof userId !== "string" ||
            typeof password !== "string" ||
            userId.trim() === "" ||
            password === ""
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid login credentials"
            });
        }

        // Authenticate user
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
                        userId: userId.trim()
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
                message: "Invalid login credentials"
            });
        }

        // Create session
        const { sessionToken, session } =
            await createSession(identity.id);

        // Set session cookie
        res.cookie("session", sessionToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            expires: session.expires_at
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
            message: "Login successful"
        });

    } catch (error) {
        console.error(
            "Login error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
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
        message: "Unauthorized"
      });
    }

    return res.status(200).json({
      success: true,
      identity: req.identity
    });

  } catch (error) {
    console.error("Get current user error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};


const logoutUser = async (
  req: Request,
  res: Response
) => {
  try {
    const cookieHeader = req.headers.cookie;

    if (!cookieHeader) {
      res.clearCookie("session", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict"
      });

      return res.status(200).json({
        success: true,
        message: "Logout successful"
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
      res.clearCookie("session", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict"
      });

      return res.status(200).json({
        success: true,
        message: "Logout successful"
      });
    }

    const sessionToken = sessionCookie
      .substring("session=".length);

    // Hash token to find the session in database
    const sessionTokenHash = crypto
      .createHash("sha256")
      .update(sessionToken)
      .digest("hex");

    // Delete current session
    await connection.query(
      `
            DELETE FROM sessions
            WHERE session_token_hash = $1
            `,
      [sessionTokenHash]
    );

    // Remove cookie from browser
    res.clearCookie("session", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict"
    });

    return res.status(200).json({
      success: true,
      message: "Logout successful"
    });

  } catch (error) {
    console.error("Logout error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};


export {
  registerUser,
  loginUser,
  getCurrentUser,
  logoutUser
};