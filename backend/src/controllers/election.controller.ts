import { Request, Response } from "express";

import {
    createElection,
    openElection
} from "../services/election.service.js";

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

    const electionId = req.params.electionId as string;

    if (!electionId) {
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

export {
    createElectionController,
    openElectionController
}