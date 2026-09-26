import mongoose, { Schema } from "mongoose"

const auditLogSchema = new Schema(
    {
        eventType: {
            type: String,
            enum: ["LOGIN_SUCCESS", 
                    "LOGIN_FAILED", 
                    "ADMIN_ACTION", 
                    "ELECTION_CREATED",
                    "ELECTION_OPENED",
                    "ELECTION_CLOSED",
                    "VOTE_REJECTED",
                    "UNAUTHORIZED_ACCESS",
                    "DUPLICATE_REQUEST_REJECTED"],
            required: true
        },
        identityId: {
            type: Schema.Types.ObjectId,
        },
        metadata: {
            type: Object
        }
    },
    {
        timestamps: true
    }
)

export const AuditLog = mongoose.model("AuditLog", auditLogSchema);