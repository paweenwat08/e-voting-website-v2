import { Request, Response } from "express";

import connection from "../config/database.js";

import { createAuditLog } from "../services/auditLog.service.js";

import {
    createVoterEligibility,
    findVoterEligibility,
    checkVoterEligibility,
    getVoterEligibilitiesByElection
} from "../services/voterEligibility.service.js";


export const createVoterEligibilityController = async (
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


export const getVoterEligibilityController = async (
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


export const checkVoterEligibilityController = async (
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


export const getVoterEligibilitiesByElectionController = async (
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