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

export const createCandidateController = async (
    req: Request,
    res: Response
) => {
    try {
        if (!req.identity) {
            return res.status(401).json({
                message: "Unauthorized"
            });
        }

        const {
            identityId,
            electionId,
            candidateNumber,
            description
        } = req.body;

        if (
            identityId === undefined ||
            identityId === null ||
            String(identityId).trim() === "" ||
            electionId === undefined ||
            electionId === null ||
            String(electionId).trim() === "" ||
            candidateNumber === undefined ||
            candidateNumber === null ||
            String(candidateNumber).trim() === ""
        ) {
            return res.status(400).json({
                message: "identityId, electionId and candidateNumber are required"
            });
        }

        if (
            description !== undefined &&
            description !== null &&
            typeof description !== "string"
        ) {
            return res.status(400).json({
                message: "description must be a string or null"
            });
        }

        const normalizedIdentityId = String(identityId).trim();
        const normalizedElectionId = String(electionId).trim();
        const normalizedCandidateNumber = String(candidateNumber).trim();

        const normalizedDescription =
            typeof description === "string" && description.trim() !== ""
                ? description.trim()
                : null;

        const result = await createCandidate(
            normalizedIdentityId,
            normalizedElectionId,
            normalizedCandidateNumber,
            normalizedDescription
        );

        if (!result.success) {
            if (result.reason === "Candidate is not eligible") {
                return res.status(403).json({
                    message: result.reason
                });
            }

            if (result.reason === "Election not found") {
                return res.status(404).json({
                    message: result.reason
                });
            }

            if (
                result.reason === "Candidate number already exists"
            ) {
                return res.status(409).json({
                    message: result.reason
                });
            }

            if (
                result.reason === "Election is not accepting candidates"
            ) {
                return res.status(409).json({
                    message: result.reason
                });
            }

            return res.status(400).json({
                message: result.reason
            });
        }

        try {
            await createAuditLog(
                "ADMIN_ACTION",
                req.identity.id,
                {
                    action: "CREATE_CANDIDATE",
                    identityId: normalizedIdentityId,
                    electionId: normalizedElectionId,
                    candidateNumber: normalizedCandidateNumber
                }
            );
        } catch (auditError) {
            console.error(
                "Failed to create candidate audit log:",
                auditError
            );
        }

        return res.status(201).json({
            message: "Candidate created successfully",
            candidate: result.candidate
        });
    } catch (error) {
        console.error("Create candidate error:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};

export const getCandidatesByElectionController = async (
    req: Request,
    res: Response
) => {
    try {
        if (!req.identity) {
            return res.status(401).json({
                message: "Unauthorized"
            });
        }

        const electionId = req.params.electionId;

        if (
            typeof electionId !== "string" ||
            electionId.trim() === ""
        ) {
            return res.status(400).json({
                message: "electionId is required"
            });
        }

        const candidates = await getCandidatesByElection(
            electionId.trim()
        );

        return res.status(200).json({
            candidates
        });
    } catch (error) {
        console.error("Get candidates by election error:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};

export const getCandidateByIdController = async (
    req: Request,
    res: Response
) => {
    try {
        if (!req.identity) {
            return res.status(401).json({
                message: "Unauthorized"
            });
        }

        const candidateId = req.params.candidateId;

        if (
            typeof candidateId !== "string" ||
            candidateId.trim() === ""
        ) {
            return res.status(400).json({
                message: "candidateId is required"
            });
        }

        const candidate = await getCandidateById(
            candidateId.trim()
        );

        if (!candidate) {
            return res.status(404).json({
                message: "Candidate not found"
            });
        }

        return res.status(200).json({
            candidate
        });
    } catch (error) {
        console.error("Get candidate by ID error:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};

export const createCandidateEligibilityController = async (
    req: Request,
    res: Response
) => {
    try {
        if (!req.identity) {
            return res.status(401).json({
                message: "Unauthorized"
            });
        }

        const { identityId, electionId } = req.body;

        if (
            identityId === undefined ||
            identityId === null ||
            String(identityId).trim() === "" ||
            electionId === undefined ||
            electionId === null ||
            String(electionId).trim() === ""
        ) {
            return res.status(400).json({
                message: "identityId and electionId are required"
            });
        }

        const normalizedIdentityId = String(identityId).trim();
        const normalizedElectionId = String(electionId).trim();

        const identityResult = await connection.query(
            `
            SELECT id
            FROM identities
            WHERE id = $1
            LIMIT 1
            `,
            [normalizedIdentityId]
        );

        if (identityResult.rows.length === 0) {
            return res.status(404).json({
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
            [normalizedElectionId]
        );

        if (electionResult.rows.length === 0) {
            return res.status(404).json({
                message: "Election not found"
            });
        }

        const existingEligibility = await findCandidateEligibility(
            normalizedIdentityId,
            normalizedElectionId
        );

        if (existingEligibility) {
            return res.status(409).json({
                message: "Candidate eligibility already exists"
            });
        }

        const eligibility = await createCandidateEligibility(
            normalizedIdentityId,
            normalizedElectionId
        );

        try {
            await createAuditLog(
                "ADMIN_ACTION",
                req.identity.id,
                {
                    action: "CREATE_CANDIDATE_ELIGIBILITY",
                    identityId: normalizedIdentityId,
                    electionId: normalizedElectionId
                }
            );
        } catch (auditError) {
            console.error(
                "Failed to create candidate eligibility audit log:",
                auditError
            );
        }

        return res.status(201).json({
            message: "Candidate eligibility created successfully",
            eligibility
        });
    } catch (error) {
        console.error(
            "Create candidate eligibility error:",
            error
        );

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};

export const getCandidateEligibilitiesByElectionController = async (
    req: Request,
    res: Response
) => {
    try {
        if (!req.identity) {
            return res.status(401).json({
                message: "Unauthorized"
            });
        }

        const electionId = req.params.electionId;

        if (
            typeof electionId !== "string" ||
            electionId.trim() === ""
        ) {
            return res.status(400).json({
                message: "electionId is required"
            });
        }

        const normalizedElectionId = electionId.trim();

        const electionResult = await connection.query(
            `
            SELECT id
            FROM elections
            WHERE id = $1
            LIMIT 1
            `,
            [normalizedElectionId]
        );

        if (electionResult.rows.length === 0) {
            return res.status(404).json({
                message: "Election not found"
            });
        }

        const eligibilities =
            await getCandidateEligibilitiesByElection(
                normalizedElectionId
            );

        return res.status(200).json({
            eligibilities
        });
    } catch (error) {
        console.error(
            "Get candidate eligibilities by election error:",
            error
        );

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};

export const revokeCandidateEligibilityController = async (
    req: Request,
    res: Response
) => {
    try {
        if (!req.identity) {
            return res.status(401).json({
                message: "Unauthorized"
            });
        }

        const { identityId, electionId } = req.body;

        if (
            identityId === undefined ||
            identityId === null ||
            String(identityId).trim() === "" ||
            electionId === undefined ||
            electionId === null ||
            String(electionId).trim() === ""
        ) {
            return res.status(400).json({
                message: "identityId and electionId are required"
            });
        }

        const normalizedIdentityId = String(identityId).trim();
        const normalizedElectionId = String(electionId).trim();

        const identityResult = await connection.query(
            `
            SELECT id
            FROM identities
            WHERE id = $1
            LIMIT 1
            `,
            [normalizedIdentityId]
        );

        if (identityResult.rows.length === 0) {
            return res.status(404).json({
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
            [normalizedElectionId]
        );

        if (electionResult.rows.length === 0) {
            return res.status(404).json({
                message: "Election not found"
            });
        }

        const eligibility = await revokeCandidateEligibility(
            normalizedIdentityId,
            normalizedElectionId
        );

        if (!eligibility) {
            return res.status(404).json({
                message: "Candidate eligibility not found or already revoked"
            });
        }

        try {
            await createAuditLog(
                "ADMIN_ACTION",
                req.identity.id,
                {
                    action: "REVOKE_CANDIDATE_ELIGIBILITY",
                    identityId: normalizedIdentityId,
                    electionId: normalizedElectionId
                }
            );
        } catch (auditError) {
            console.error(
                "Failed to revoke candidate eligibility audit log:",
                auditError
            );
        }

        return res.status(200).json({
            message: "Candidate eligibility revoked successfully",
            eligibility
        });
    } catch (error) {
        console.error(
            "Revoke candidate eligibility error:",
            error
        );

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};