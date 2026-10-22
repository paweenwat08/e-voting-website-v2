import type { Request, Response } from "express";
import { 
    checkVoterEligibility,
    addVoterEligibility,
    getElectionEligibilityUsers
 } from "../services/voterEligibility.service.js";
import { createAuditLog } from "../services/auditLog.service.js";

export const checkVoterEligibilityController = async (
    req: Request,
    res: Response
) => {
    try {
        const identity = req.identity

        if (!identity) {
            return res.status(404).json({
                success: false,
                message: "voter not found"
            })
        }

        const identityId = identity.id;
        const { electionId } = req.params;

        if (
            typeof electionId !== "string" ||
            !/^[1-9]\d*$/.test(electionId)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid election ID",
            });
        }

        const isEligible = await checkVoterEligibility(
            String(identityId),
            electionId
        );

        return res.status(200).json({
            success: true,
            electionId,
            isEligible,
        });
    } catch (error) {
        console.error("Check voter eligibility error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

export const createVoterEligibilityController = async (
    req: Request,
    res: Response
) => {
    try {
        if (!req.identity) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        const { identityId, electionId } = req.body;

        if (
            typeof identityId !== "string" ||
            !/^[1-9]\d*$/.test(identityId) ||
            typeof electionId !== "string" ||
            !/^[1-9]\d*$/.test(electionId)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid identity ID or election ID",
            });
        }

        const eligibility = await addVoterEligibility(
            identityId,
            electionId
        );

        try {
            await createAuditLog(
                "ADMIN_ACTION",
                req.identity.id,
                {
                    action: "CREATE_VOTER_ELIGIBILITY",
                    identityId,
                    electionId,
                }
            );
        } catch (auditError) {
            console.error("Eligibility audit log error:", auditError);
        }

        return res.status(201).json({
            success: true,
            message: "Voter eligibility created successfully",
            eligibility,
        });
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === "Election not found") {
                return res.status(404).json({
                    success: false,
                    message: error.message,
                });
            }

            if (error.message === "Identity not found") {
                return res.status(404).json({
                    success: false,
                    message: error.message,
                });
            }

            if (error.message === "Voter is already eligible") {
                return res.status(409).json({
                    success: false,
                    message: error.message,
                });
            }
        }

        console.error("Create voter eligibility error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

export const getElectionEligibilityUsersController = async (
    req: Request,
    res: Response
) => {
    try {
        const { electionId } = req.params;

        if (
            typeof electionId !== "string" ||
            !/^[1-9]\d*$/.test(electionId)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid election ID",
            });
        }

        const query =
            typeof req.query.q === "string"
                ? req.query.q.trim()
                : "";

        const users = await getElectionEligibilityUsers(
            electionId,
            query
        );

        return res.status(200).json({
            success: true,
            electionId,
            users,
        });
    } catch (error) {
        console.error(
            "Get election eligibility users error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};