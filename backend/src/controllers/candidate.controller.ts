import { Request, Response } from "express";

import {
    createCandidate,
    getCandidatesByElection,
    getCandidateById
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
            typeof identityId !== "number" ||
            !Number.isInteger(identityId)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid identity ID"
            });
        }

        // 2. Validate electionId
        if (
            typeof electionId !== "number" ||
            !Number.isInteger(electionId)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid election ID"
            });
        }

        // 3. Validate candidateNumber
        if (
            typeof candidateNumber !== "number" ||
            !Number.isInteger(candidateNumber) ||
            candidateNumber <= 0
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
                Number(electionId)
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
                Number(candidateId)
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

export {
    createCandidateController,
    getCandidatesByElectionController,
    getCandidateByIdController
}