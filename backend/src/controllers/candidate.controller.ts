import { Candidate } from "../models/candidate.model.js";
import { Request, Response } from "express";

const addCandidate = async (req: Request, res: Response) => {
    try {

        const { electionId, candidateNumber, firstname, lastname, description } = req.body;

        //basic validation
        if (!electionId || !candidateNumber || !firstname || !description) {
            return res.status(400).json({ message: "All fields are important!" })
        }

        //check if existing
        const existing = await Candidate.findOne({ firstname, lastname });
        if (existing) {
            return res.status(400).json({ message: `${firstname} ${lastname} already exists` })
        }

        const candidate = await Candidate.create({
            electionId,
            candidateNumber,
            firstname,
            lastname,
            description
        })
        res.status(201).json({
            message: "Candidate added",
            candidate: { 
                id: candidate._id, 
                electionId: candidate.electionId,
                candidateNumber: candidate.candidateNumber,
                firstname: candidate.firstname,
                lastname: candidate.lastname,
                description: candidate.description
            }
        })

    } catch (error) {
        return res.status(500).json({
            message: "Internal Server Error", error
        });
    }
}

const getCandidates = async (req: Request, res: Response) => {
    try {

        const candidates = await Candidate.find()

        res.status(200).json({
            success: true,
            candidates
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

export {
    addCandidate,
    getCandidates
}