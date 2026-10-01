import { Request, Response } from "express";

import { createAuditLog } from "../services/auditLog.service.js";

import {
    castVote
} from "../services/voting.service.js";

export const vote = async (
    req: Request,
    res: Response
) => {
    try {

        // ==========================================
        // 1. Authentication
        // ==========================================

        if (!req.identity) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        // ==========================================
        // 2. Get request data
        // ==========================================

        const {
            electionId,
            candidateId
        } = req.body;

        // ==========================================
        // 3. Validate input
        // ==========================================

        if (
            typeof electionId !== "string" ||
            typeof candidateId !== "string" ||
            electionId.trim() === "" ||
            candidateId.trim() === ""
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid election ID or candidate ID"
            });
        }

        // ==========================================
        // 4. Cast vote
        // ==========================================

        const result = await castVote(
            String(req.identity.id),
            electionId,
            candidateId
        );

        // ==========================================
        // 5. Handle failure
        // ==========================================

        if (!result.success) {

            await createAuditLog(
                "VOTE_REJECTED",
                null,
                {
                    electionId,
                    reason: result.reason
                }
            );

            switch (result.reason) {

                case "Election not found":
                    return res.status(404).json({
                        success: false,
                        message: result.reason
                    });

                case "Election is not open":
                case "Election has not started":
                case "Election has ended":
                    return res.status(403).json({
                        success: false,
                        message: result.reason
                    });

                case "Voter is not eligible":
                    return res.status(403).json({
                        success: false,
                        message: result.reason
                    });

                case "Candidate does not belong to this election":
                    return res.status(400).json({
                        success: false,
                        message: result.reason
                    });

                case "Voting authorization not found":
                    return res.status(403).json({
                        success: false,
                        message: result.reason
                    });

                case "Voting authorization is not available":
                    return res.status(409).json({
                        success: false,
                        message: result.reason
                    });

                case "Failed to consume voting authorization":
                    return res.status(409).json({
                        success: false,
                        message: result.reason
                    });

                default:
                    return res.status(500).json({
                        success: false,
                        message: "Internal Server Error"
                    });
            }
        }

        // ==========================================
        // 6. Success
        // ==========================================

        return res.status(201).json({
            success: true,
            message: "Vote cast successfully"
        });

    } catch (error) {

        console.error(
            "Voting controller error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};