import pool from "../config/database.js";

import type {
    AuditEventType
} from "../models/auditLog.model.js";


export const createAuditLog = async (
    eventType: AuditEventType,
    identityId: number | null = null,
    metadata: Record<string, unknown> | null = null
) => {
    const result = await pool.query(
        `
        INSERT INTO audit_logs (
            event_type,
            identity_id,
            metadata
        )
        VALUES (
            $1,
            $2,
            $3
        )
        RETURNING
            id,
            event_type,
            identity_id,
            metadata,
            created_at,
            updated_at
        `,
        [
            eventType,
            identityId,
            metadata
        ]
    );

    return result.rows[0];
};