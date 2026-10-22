import type { Request, Response } from "express";
import { checkVoterEligibility } from "../services/voterEligibility.service.js";

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