import mongoose, { Schema } from "mongoose";

// check if specific identity is allowed to vote in specific election

const eligibilitySchema = new Schema(
    {
        identityId: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: "Identity"
        },
        electionId: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: "Election"
        },
        status: {
            type: String,
            enum: ["eligible", "ineligible"],
            required: true,
            default: "eligible"
        }
    },
    {
        timestamps: true
    }
);

eligibilitySchema.index(
    { identityId: 1, electionId: 1 },
    { unique: true }
);

export const Eligibility = mongoose.model("Eligibility",eligibilitySchema);