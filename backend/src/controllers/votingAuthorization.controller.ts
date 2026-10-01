import { Request, Response } from "express";

import {
    findVotingAuthorization,
    createVotingAuthorization,
    revokeVotingAuthorization,
    canVote
} from "../services/votingAuthorization.service.js";

import { createAuditLog } from "../services/auditLog.service.js";


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


export {
    createAuthorization,
    getAuthorization,
    revokeAuthorization,
    checkCanVote
};