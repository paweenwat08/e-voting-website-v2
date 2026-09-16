import mongoose, { Schema } from "mongoose";

const candidateSchema = new Schema(
{
    number: {
        type: Number,
        required: true,
        trim: true
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
    party: {
        type: Schema.Types.ObjectId,
        ref: "Party",
        required: true
    },
    district: {
        type: Number,
        min: 1
    }
},
{
    timestamps: true
});

export const Candidate = mongoose.model('Candidate', candidateSchema);
