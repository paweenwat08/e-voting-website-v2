import mongoose, { Schema } from "mongoose";

const voteSchema = new Schema(
    {
        voter: {
            type: Schema.Types.ObjectId,
            ref: "Voter",
            required: true
        },
        party: {
            type: Schema.Types.ObjectId,
            ref: "Party",
            required: true
        },
        candidate: {
            type: Schema.Types.ObjectId,
            ref: "Candidate",
            required: true
        },
        referendum: {
            type: String,
            enum: ["เห็นด้วย", "ไม่เห็นด้วย", "งดออกเสียง"],
            required: true
        }
    },
    {
        timestamps: true
    }
)

export const Vote = mongoose.model('Vote', voteSchema);