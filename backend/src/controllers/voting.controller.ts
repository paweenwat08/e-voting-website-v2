import { Request, Response } from "express";

import connection from "../config/database.js";

import { createAuditLog } from "../services/auditLog.service.js";

import {
    castVote,
    findVotingAuthorization,
    createVotingAuthorization,
    canVote,
    getElectionResults
} from "../services/voting.service.js";

const vote = async (
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

            try {
                await createAuditLog(
                    "VOTE_REJECTED",
                    null,
                    {
                        electionId,
                        reason: result.reason
                    }
                );
            } catch (auditError) {
                console.error(
                    "Failed to create vote rejection audit log:",
                    auditError
                );
            }

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

const createAuthorization = async (
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

        const {
            identityId,
            electionId
        } = req.body;

        if (
            typeof identityId !== "string" ||
            identityId.trim() === ""
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid identity ID"
            });
        }

        if (
            typeof electionId !== "string" ||
            electionId.trim() === ""
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid election ID"
            });
        }

        const existingAuthorization =
            await findVotingAuthorization(
                identityId,
                electionId
            );

        if (existingAuthorization) {
            return res.status(409).json({
                success: false,
                message: "Voting authorization already exists"
            });
        }

        const authorization =
            await createVotingAuthorization(
                identityId,
                electionId
            );

        try {
            await createAuditLog(
                "ADMIN_ACTION",
                req.identity.id,
                {
                    action: "CREATE_VOTING_AUTHORIZATION",
                    identityId,
                    electionId
                }
            );
        } catch (auditError) {
            console.error(
                "Failed to create voting authorization audit log:",
                auditError
            );
        }

        return res.status(201).json({
            success: true,
            message: "Voting authorization created",
            authorization
        });

    } catch (error) {
        console.error(
            "Create voting authorization error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

const getAuthorization = async (
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

        const electionId =
            String(req.params.electionId);

        if (electionId.trim() === "") {
            return res.status(400).json({
                success: false,
                message: "Invalid election ID"
            });
        }

        const authorization =
            await findVotingAuthorization(
                String(req.identity.id),
                electionId
            );

        if (!authorization) {
            return res.status(404).json({
                success: false,
                message: "Voting authorization not found"
            });
        }

        return res.status(200).json({
            success: true,
            authorization
        });

    } catch (error) {
        console.error(
            "Get voting authorization error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

const checkCanVote = async (
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

        const electionId =
            String(req.params.electionId);

        if (electionId.trim() === "") {
            return res.status(400).json({
                success: false,
                message: "Invalid election ID"
            });
        }

        const allowed = await canVote(
            String(req.identity.id),
            electionId
        );

        return res.status(200).json({
            success: true,
            canVote: allowed
        });

    } catch (error) {
        console.error(
            "Check can vote error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
}

const getElectionResultsController = async (
    req: Request,
    res: Response
) => {
    try {
        const { electionId } = req.params;

        // 1. Validate election ID
        if (
            typeof electionId !== "string" ||
            !/^[1-9]\d*$/.test(electionId)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid election ID",
            });
        }

        // 2. Get election results
        const result = await getElectionResults(electionId);

        // 3. Handle failure
        if (!result.success) {
            if (result.reason === "Election not found") {
                return res.status(404).json({
                    success: false,
                    message: result.reason,
                });
            }

            if (
                result.reason ===
                "Results are available only after the election closes"
            ) {
                return res.status(403).json({
                    success: false,
                    message: result.reason,
                });
            }

            return res.status(500).json({
                success: false,
                message: "Internal Server Error",
            });
        }

        // 4. Success
        return res.status(200).json(result);
    } catch (error) {
        console.error(
            "Get election results controller error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};

const checkVoteStatus = async (req: Request, res: Response) => {
    try {
        if (!req.identity) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        const electionId = String(req.params.electionId);

        if (electionId.trim() === "") {
            return res.status(400).json({
                success: false,
                message: "Invalid election ID"
            });
        }

        const authorization = await findVotingAuthorization(
            String(req.identity.id),
            electionId
        );

        return res.status(200).json({
            success: true,
            hasVoted: authorization?.status === "consumed"
        });
    } catch (error) {
        console.error("Check vote status error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

export {
    vote,
    createAuthorization,
    getAuthorization,
    checkCanVote,
    getElectionResultsController,
    checkVoteStatus
};
