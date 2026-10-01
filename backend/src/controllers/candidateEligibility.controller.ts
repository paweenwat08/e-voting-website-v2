import { Request, Response } from "express";

import connection from "../config/database.js";

import {
    createCandidateEligibility,
    findCandidateEligibility,
    getCandidateEligibilitiesByElection
} from "../services/candidateEligibility.service.js";

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
            [Number(electionId)]
        );

        if (!electionResult.rows[0]) {
            return res.status(404).json({
                success: false,
                message: "Election not found"
            });
        }

        const eligibilities =
            await getCandidateEligibilitiesByElection(
                Number(electionId)
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

export {
    createCandidateEligibilityController,
    getCandidateEligibilitiesByElectionController
}