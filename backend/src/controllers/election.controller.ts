import { Request, Response } from "express";

import {
    createElection,
    openElection,
    closeElection
} from "../services/election.service.js";

import { createAuditLog } from "../services/auditLog.service.js";

const createElectionController = async (
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
            title,
            description,
            startAt,
            endAt
        } = req.body;

        // Validate input
        if (
            typeof title !== "string" ||
            typeof description !== "string" ||
            typeof startAt !== "string" ||
            typeof endAt !== "string"
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid election data"
            });
        }

        if (
            title.trim() === "" ||
            description.trim() === "" ||
            startAt.trim() === "" ||
            endAt.trim() === ""
        ) {
            return res.status(400).json({
                success: false,
                message: "Election data cannot be empty"
            });
        }

        const startDate = new Date(startAt);
        const endDate = new Date(endAt);

        if (
            Number.isNaN(startDate.getTime()) ||
            Number.isNaN(endDate.getTime())
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid election date"
            });
        }

        if (startDate >= endDate) {
            return res.status(400).json({
                success: false,
                message: "Start time must be before end time"
            });
        }

        const election = await createElection(
            title,
            description,
            startDate,
            endDate
        );

        try {
            await createAuditLog(
                "ELECTION_CREATED",
                req.identity.id,
                {
                    electionId: election.id
                }
            );
        } catch (auditError) {
            console.error(
                "Failed to create election audit log:",
                auditError
            );
        }

        return res.status(201).json({
            success: true,
            message: "Election created successfully",
            election
        });

    } catch (error) {
        console.error(
            "Create election error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

const openElectionController = async (
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

        const election = await openElection(
            electionId
        );

        if (!election) {
            return res.status(409).json({
                success: false,
                message: "Election cannot be opened"
            });
        }

        try {
            await createAuditLog(
                "ELECTION_OPENED",
                req.identity.id,
                {
                    electionId: election.id
                }
            );
        } catch (auditError) {
            console.error(
                "Failed to create election open audit log:",
                auditError
            );
        }

        return res.status(200).json({
            success: true,
            message: "Election opened successfully",
            election
        });
    } catch (error) {
        console.error("Open election error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

const closeElectionController = async (
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

        const election = await closeElection(
            electionId
        );

        if (!election) {
            return res.status(409).json({
                success: false,
                message: "Election cannot be closed"
            });
        }

        try {
            await createAuditLog(
                "ELECTION_CLOSED",
                req.identity.id,
                {
                    electionId: election.id
                }
            );
        } catch (auditError) {
            console.error(
                "Failed to create election close audit log:",
                auditError
            );
        }

        return res.status(200).json({
            success: true,
            message: "Election closed successfully",
            election
        });

    } catch (error) {
        console.error(
            "Close election error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

export {
    createElectionController,
    openElectionController,
    closeElectionController
}