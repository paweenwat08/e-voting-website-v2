import mongoose, { Schema } from "mongoose";

const candidateSchema = new Schema(
    {
        electionId: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: "Election"
        },
        candidateNumber: {
            type: Number,
            required: true
        },
        firstname: {
            type: String,
            required: true,
            trim: true
        },
        lastname: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            trim: true
        }
    },
    {
        timestamps: true
    }
)

candidateSchema.index(
    { electionId: 1, candidateNumber: 1 },
    { unique: true }
);

export const Candidate = mongoose.model("Candidate", candidateSchema);