import { Vote } from "../models/vote.model.js";
import { Voter } from "../models/voter.model.js";
import { Candidate } from "../models/candidate.model.js";
import { Request, Response } from "express";

const sendVote = async (req: Request, res: Response) => {
    try {
        const { voter, party, candidate, referendum } = req.body

        //basic validation

        if (!voter || !party || !candidate || !referendum) {
            return res.status(400).json({ message: "All fields are important!" })
        }

        //check if has voted

        const voterData = await Voter.findById(voter);

        if (!voterData) {
            return res.status(404).json({
                success: false,
                message: "Voter not found"
            });
        }

        if (voterData.hasVoted) {
            return res.status(400).json({
                success: false,
                message: "You have already voted"
            });
        }

        const candidateData = await Candidate.findById(candidate);

        if (!candidateData) {
            return res.status(404).json({
                success: false,
                message: "Candidate not found"
            });
        }

        if (candidateData.district !== voterData.district) {
            return res.status(400).json({
                success: false,
                message: "Candidate is not in voter's district"
            });
        }

        const vote = await Vote.create({
            voter,
            party,
            candidate,
            referendum
        })

        await Voter.findByIdAndUpdate(
            voter,
            {
                hasVoted: true
            }
        );

        res.status(201).json({
            message: "vote success",
            voter: { id: vote._id, party: vote.party, candidate: vote.candidate, referendum: vote.referendum }
        })

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal Server Error", error
        });
    }
}

const getVotes = async (req: Request, res: Response) => {
    try {
        const votes = await Vote.find()
            .select("-voter")
            .populate("party")
            .populate("candidate");

        res.status(200).json({
            success: true,
            votes
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to get parties"
        });
    }
}

export {
    sendVote,
    getVotes
}