import mongoose, { Schema } from "mongoose";

const votingAuthorizationSchema = new Schema(
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
            enum: ["unused", "consumed", "revoked"],
            required: true,
            default: "unused"
        },

        consumedAt: {
            type: Date
        }
    },
    {
        timestamps: true
    }
);

votingAuthorizationSchema.index(
    { identityId: 1, electionId: 1 },
    { unique: true }
);

export const VotingAuthorization = mongoose.model(
    "VotingAuthorization",
    votingAuthorizationSchema
);