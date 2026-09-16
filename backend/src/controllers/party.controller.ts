import { Party } from "../models/party.model.js";
import { Request, Response } from "express";

const addParty = async (req: Request, res: Response) => {
    try {

        const { name, number } = req.body;

        //basic validation
        if (!name || !number) {
            return res.status(400).json({ message: "All fields are important!" })
        }

        //check if existing
        const existing = await Party.findOne({ name });
        if (existing) {
            return res.status(400).json({ message: `${name} already exists` })
        }

        const party = await Party.create({
            name,
            number
        })

        res.status(201).json({
            message: "Party added",
            voter: { id: party._id, name: party.name, number: party.number }
        })

    } catch (error) {
        return res.status(500).json({
            message: "Internal Server Error",error
        });
    }
}

const getParties = async (req: Request, res: Response) => {
   try {
        const parties = await Party.find();

        res.status(200).json({
            success: true,
            parties
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to get parties"
        });
    }
}

export {
    addParty,
    getParties
}