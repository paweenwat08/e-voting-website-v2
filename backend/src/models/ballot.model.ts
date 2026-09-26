import mongoose, { Schema } from "mongoose";

const ballotSchema = new Schema(
    {
        candidate: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: "Candidate"
        }
    },
    {
        timestamps: true
    }
)

export const Ballot = mongoose.model("Ballot", ballotSchema);