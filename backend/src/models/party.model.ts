import mongoose, { Schema } from "mongoose";

const partySchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true
        },
        number: {
            type: Number,
            required: true,
            unique: true
        }
    },
    {
        timestamps: true
    }

)

export const Party = mongoose.model('Party', partySchema);