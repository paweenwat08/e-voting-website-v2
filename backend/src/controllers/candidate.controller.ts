import { Request, Response } from "express";

import connection from "../config/database.js";
import { createAuditLog } from "../services/auditLog.service.js";

import {
    createCandidate,
    getCandidatesByElection,
    getCandidateById
} from "../services/candidate.service.js";

export const createCandidateController = async (
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
                success: false,
                message: "identityId, electionId and candidateNumber are required"
            });
        }

        if (
            description !== undefined &&
            description !== null &&
            typeof description !== "string"
        ) {
            return res.status(400).json({
                success: false,
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
                    success: false,
                    message: result.reason
                });
            }

            if (result.reason === "Election not found") {
                return res.status(404).json({
                    success: false,
                    message: result.reason
                });
            }

            if (
                result.reason === "Candidate number already exists"
            ) {
                return res.status(409).json({
                    success: false,
                    message: result.reason
                });
            }

            if (
                result.reason === "Election is not accepting candidates"
            ) {
                return res.status(409).json({
                    success: false,
                    message: result.reason
                });
            }

            return res.status(400).json({
                success: false,
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
            success: true,
            message: "Candidate created successfully",
            candidate: result.candidate
        });
    } catch (error) {
        console.error("Create candidate error:", error);

        return res.status(500).json({
            success: false,
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
                success: false,
                message: "Unauthorized"
            });
        }

        const electionId = req.params.electionId;

        if (
            typeof electionId !== "string" ||
            electionId.trim() === ""
        ) {
            return res.status(400).json({
                success: false,
                message: "electionId is required"
            });
        }

        const candidates = await getCandidatesByElection(
            electionId.trim()
        );

        return res.status(200).json({
            success: true,
            candidates
        });
    } catch (error) {
        console.error("Get candidates by election error:", error);

        return res.status(500).json({
            success: false,
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
                success: false,
                message: "Unauthorized"
            });
        }

        const candidateId = req.params.candidateId;

        if (
            typeof candidateId !== "string" ||
            candidateId.trim() === ""
        ) {
            return res.status(400).json({
                success: false,
                message: "candidateId is required"
            });
        }

        const candidate = await getCandidateById(
            candidateId.trim()
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
        console.error("Get candidate by ID error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }

};

