import { Request, Response } from "express";

import connection from "../config/database.js";
import { createAuditLog } from "../services/auditLog.service.js";

import {
    createCandidate,
    getCandidatesByElection,
    getCandidateById,
    createCandidateEligibility,
    findCandidateEligibility,
    getCandidateEligibilitiesByElection,
    revokeCandidateEligibility
} from "../services/candidate.service.js";


const createCandidateController = async (
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
            electionId,
            candidateNumber,
            description
        } = req.body;

        // 1. Validate identityId
        if (
            typeof identityId !== "string" ||
            identityId.trim() === ""
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid identity ID"
            });
        }

        // 2. Validate electionId
        if (
            typeof electionId !== "string" ||
            electionId.trim() === ""
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid election ID"
            });
        }

        // 3. Validate candidateNumber
        if (
            typeof candidateNumber !== "string" ||
            candidateNumber.trim() === ""
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid candidate number"
            });
        }

        // 4. Validate description
        if (
            description !== null &&
            typeof description !== "string"
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid description"
            });
        }

        const result = await createCandidate(
            identityId,
            electionId,
            candidateNumber,
            description
        );

        if (!result.success) {
            switch (result.reason) {
                case "Candidate is not eligible":
                    return res.status(403).json({
                        success: false,
                        message: result.reason
                    });

                case "Election not found":
                    return res.status(404).json({
                        success: false,
                        message: result.reason
                    });

                case "Candidate number already exists":
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

        try {
            await createAuditLog(
                "ADMIN_ACTION",
                req.identity.id,
                {
                    action: "CREATE_CANDIDATE",
                    identityId,
                    electionId,
                    candidateNumber
                }
            );
        } catch (auditError) {
            console.error(
                "Failed to create candidate audit log:",
                auditError
            );
        }

        return res.status(201).json({
            success: true,
            message: "Candidate created successfully",
            candidate: result.candidate
        });

    } catch (error) {
        console.error(
            "Create candidate error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

const getCandidatesByElectionController = async (
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

        const candidates =
            await getCandidatesByElection(
                electionId
            );

        return res.status(200).json({
            success: true,
            candidates
        });

    } catch (error) {
        console.error(
            "Get candidates error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

const getCandidateByIdController = async (
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

        const { candidateId } = req.params;

        if (
            typeof candidateId !== "string" ||
            candidateId.trim() === ""
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid candidate ID"
            });
        }

        const candidate =
            await getCandidateById(
                candidateId
            );

        if (!candidate) {
            return res.status(404).json({
                success: false,
                message: "Candidate not found"
            });
        }

        return res.status(200).json({
            success: true,
            candidate
        });

    } catch (error) {
        console.error(
            "Get candidate error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

const createCandidateEligibilityController = async (
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

        // 1. Validate identityId
        if (
            typeof identityId !== "string" ||
            identityId.trim() === ""
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid identity ID"
            });
        }

        // 2. Validate electionId
        if (
            typeof electionId !== "string" ||
            electionId.trim() === ""
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid election ID"
            });
        }

        // 3. Check identity exists
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

        // 4. Check election exists
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

        // 5. Check duplicate eligibility
        const existingEligibility =
            await findCandidateEligibility(
                identityId,
                electionId
            );

        if (existingEligibility) {
            return res.status(409).json({
                success: false,
                message: "Candidate eligibility already exists"
            });
        }

        // 6. Create eligibility
        const eligibility =
            await createCandidateEligibility(
                identityId,
                electionId
            );

        try {
            await createAuditLog(
                "ADMIN_ACTION",
                req.identity.id,
                {
                    action: "CREATE_CANDIDATE_ELIGIBILITY",
                    identityId,
                    electionId
                }
            );
        } catch (auditError) {
            console.error(
                "Failed to create candidate eligibility audit log:",
                auditError
            );
        }

        return res.status(201).json({
            success: true,
            message: "Candidate eligibility created successfully",
            eligibility
        });

    } catch (error) {
        console.error(
            "Create candidate eligibility error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

const getCandidateEligibilitiesByElectionController = async (
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
            await getCandidateEligibilitiesByElection(
                electionId
            );

        return res.status(200).json({
            success: true,
            eligibilities
        });

    } catch (error) {
        console.error(
            "Get candidate eligibilities error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

const revokeCandidateEligibilityController = async (
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

        // Validate identityId
        if (
            typeof identityId !== "string" ||
            identityId.trim() === ""
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid identity ID"
            });
        }

        // Validate electionId
        if (
            typeof electionId !== "string" ||
            electionId.trim() === ""
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid election ID"
            });
        }

        // Check identity exists
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

        // Check election exists
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

        // Revoke eligibility
        const result =
            await revokeCandidateEligibility(
                identityId,
                electionId
            );

        // No eligible record found
        if (!result) {
            return res.status(404).json({
                success: false,
                message:
                    "Candidate eligibility not found or already revoked"
            });
        }

        try {
            await createAuditLog(
                "ADMIN_ACTION",
                req.identity.id,
                {
                    action: "REVOKE_CANDIDATE_ELIGIBILITY",
                    identityId,
                    electionId
                }
            );
        } catch (auditError) {
            console.error(
                "Failed to revoke candidate eligibility audit log:",
                auditError
            );
        }

        return res.status(200).json({
            success: true,
            message: "Candidate eligibility revoked successfully",
            eligibility: result
        });

    } catch (error) {
        console.error(
            "Revoke candidate eligibility controller error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

export {
    createCandidateController,
    getCandidatesByElectionController,
    getCandidateByIdController,
    createCandidateEligibilityController,
    getCandidateEligibilitiesByElectionController,
    revokeCandidateEligibilityController
};