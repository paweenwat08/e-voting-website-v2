import { Request, Response } from "express";

import connection from "../config/database.js";

import { createAuditLog } from "../services/auditLog.service.js";

import {
    castVote,
    findVotingAuthorization,
    createVotingAuthorization,
    revokeVotingAuthorization,
    canVote,
    createVoterEligibility,
    findVoterEligibility,
    checkVoterEligibility,
    getVoterEligibilitiesByElection,
    getElectionResults,
    getVoterEligibilitiesByIdentity
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

const revokeAuthorization = async (
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

        const result =
            await revokeVotingAuthorization(
                identityId,
                electionId
            );

        if (!result) {
            return res.status(404).json({
                success: false,
                message:
                    "Voting authorization not found or cannot be revoked"
            });
        }

        try {
            await createAuditLog(
                "ADMIN_ACTION",
                req.identity.id,
                {
                    action: "REVOKE_VOTING_AUTHORIZATION",
                    identityId,
                    electionId
                }
            );
        } catch (auditError) {
            console.error(
                "Failed to revoke voting authorization audit log:",
                auditError
            );
        }

        return res.status(200).json({
            success: true,
            message: "Voting authorization revoked successfully",
            authorization: result
        });

    } catch (error) {
        console.error(
            "Revoke voting authorization error:",
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
};

const createVoterEligibilityController = async (
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

        const identityResult = await connection.query(
            `
            SELECT id
            FROM identities
            WHERE id = $1
            LIMIT 1
            `,
            [identityId]
        );

        if (!identityResult.rows[0]) {
            return res.status(404).json({
                success: false,
                message: "Identity not found"
            });
        }

        const electionResult = await connection.query(
            `
            SELECT id
            FROM elections
            WHERE id = $1
            LIMIT 1
            `,
            [electionId]
        );

        if (!electionResult.rows[0]) {
            return res.status(404).json({
                success: false,
                message: "Election not found"
            });
        }

        const result = await createVoterEligibility(
            identityId,
            electionId
        );

        if (!result.success) {
            return res.status(409).json({
                success: false,
                message: result.reason
            });
        }

        try {
            await createAuditLog(
                "ADMIN_ACTION",
                req.identity.id,
                {
                    action: "CREATE_VOTER_ELIGIBILITY",
                    identityId,
                    electionId
                }
            );
        } catch (auditError) {
            console.error(
                "Failed to create voter eligibility audit log:",
                auditError
            );
        }

        return res.status(201).json({
            success: true,
            message: "Voter eligibility created successfully",
            eligibility: result.eligibility,
            authorization: result.authorization
        });

    } catch (error) {
        console.error(
            "Create voter eligibility error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

const getVoterEligibilityController = async (
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

        const { electionId } = req.params;

        if (
            typeof electionId !== "string" ||
            electionId.trim() === ""
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid election ID"
            });
        }

        const eligibility = await findVoterEligibility(
            String(req.identity.id),
            electionId
        );

        if (!eligibility) {
            return res.status(404).json({
                success: false,
                message: "Voter eligibility not found"
            });
        }

        return res.status(200).json({
            success: true,
            eligibility
        });

    } catch (error) {
        console.error(
            "Get voter eligibility error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

const checkVoterEligibilityController = async (
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

        const { electionId } = req.params;

        if (
            typeof electionId !== "string" ||
            electionId.trim() === ""
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid election ID"
            });
        }

        const eligibility = await checkVoterEligibility(
            String(req.identity.id),
            electionId
        );

        return res.status(200).json({
            success: true,
            eligible: Boolean(eligibility)
        });

    } catch (error) {
        console.error(
            "Check voter eligibility error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

const getVoterEligibilitiesByElectionController = async (
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

        const { electionId } = req.params;

        if (
            typeof electionId !== "string" ||
            electionId.trim() === ""
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid election ID"
            });
        }

        const electionResult = await connection.query(
            `
            SELECT id
            FROM elections
            WHERE id = $1
            LIMIT 1
            `,
            [electionId]
        );

        if (!electionResult.rows[0]) {
            return res.status(404).json({
                success: false,
                message: "Election not found"
            });
        }

        const eligibilities =
            await getVoterEligibilitiesByElection(
                electionId
            );

        return res.status(200).json({
            success: true,
            eligibilities
        });

    } catch (error) {
        console.error(
            "Get voter eligibilities error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

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

const getMyVoterEligibilitiesController = async (
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

        const eligibilities =
            await getVoterEligibilitiesByIdentity(
                String(req.identity.id)
            );

        return res.status(200).json({
            success: true,
            eligibilities
        });

    } catch (error) {
        console.error(
            "Get my voter eligibilities error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
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
    revokeAuthorization,
    checkCanVote,
    createVoterEligibilityController,
    getVoterEligibilityController,
    checkVoterEligibilityController,
    getVoterEligibilitiesByElectionController,
    getElectionResultsController,
    getMyVoterEligibilitiesController,
    checkVoteStatus
};