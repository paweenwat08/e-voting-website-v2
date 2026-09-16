import { Voter } from "../models/voter.model.js";
import { Request, Response } from "express";

const registerVoter = async (req: Request, res: Response) => {
    try {
        const { studentId, firstname, lastname, password, district } = req.body;

        //basic validation

        if (!studentId || !firstname || !lastname || !password || !district) {
            return res.status(400).json({ message: "All fields are important!" })
        }

        //check if existing

        const existing = await Voter.findOne({ studentId });
        if (existing) {
            return res.status(400).json({ message: "student Id already exists" })
        }

        const voter = await Voter.create({
            studentId,
            firstname,
            lastname,
            password,
            district
        })

        res.status(201).json({
            message: "voter added",
            voter: { id: voter._id, studentId: voter.studentId, firstname: voter.firstname }
        })

    } catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({
                message: "Internal Server Error",
                error: error.message,
            });
        }

        return res.status(500).json({
            message: "Internal Server Error", error
        });
    }
}

const loginVoter = async (req: Request, res: Response) => {
    try {

        //checking if voter alreasdy exists
        const { studentId, password } = req.body;

        const voter = await Voter.findOne({
            studentId: studentId.trim()
        });

        if (!voter) return res.status(400).json({
            success: false,
            message: "Voter not found"
        });

        //compare passwords
        const isMatch = await voter.comparePassword(password);
        if (!isMatch) return res.status(400).json({
            success: false,
            message: "invalid credentials"
        })

        //checking if voter already voted
        if (voter.hasVoted) {
            return res.status(403).json({
                success: false,
                message: "คุณใช้สิทธิ์เลือกตั้งแล้ว"
            });
        }

        res.status(200).json({
            success: true,
            message: "Voter Logged In",
            voter: {
                _id: voter._id,
                studentId: voter.studentId,
                firstname: voter.firstname,
                lastname: voter.lastname,
                district: voter.district,
                hasVoted: voter.hasVoted
            }
        });

    } catch (error) {
        res.status(500).json({
            message: "Internal Server Error"
        })
    }
}

const logoutVoter = async (req: Request, res: Response) => {
    try {
        const { studentId } = req.body;

        const voter = await Voter.findOne({
            studentId
        });

        if (!voter) return res.status(404).json({
            message: "Voter not found"
        });

        res.status(200).json({
            message: "Logout successful"
        })


    } catch (error) {
        res.status(500).json({
            message: "Internal Server Error", error
        });
    }
}

export {
    registerVoter,
    loginVoter,
    logoutVoter
};