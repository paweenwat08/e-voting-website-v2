import mongoose, {Schema} from "mongoose";

const electionSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
            minlength: 5,
            maxlength: 100
        },
        description: {
            type: String,
            required: true,
            trim: true,
            minlength: 10
        },
        startAt: {
            type: Date,
            required: true
        },
        endAt: {
            type: Date,
            required: true
        },
        status: {
            type: String,
            enum: ["draft", "scheduled", "open", "closed"],
            required: true,
            default: "draft"
        }
    },
    {
        timestamps: true
    }
)

// Optional: Add indexes for performance
electionSchema.index({ status: 1});

export const Election = mongoose.model("Election", electionSchema)