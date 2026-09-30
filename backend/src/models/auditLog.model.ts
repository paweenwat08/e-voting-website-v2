export type AuditEventType =
    | "LOGIN_SUCCESS"
    | "LOGIN_FAILED"
    | "ADMIN_ACTION"
    | "ELECTION_CREATED"
    | "ELECTION_OPENED"
    | "ELECTION_CLOSED"
    | "VOTE_REJECTED"
    | "UNAUTHORIZED_ACCESS"
    | "DUPLICATE_REQUEST_REJECTED";

export interface AuditLog {
    id: number;
    eventType: AuditEventType;
    identityId: number | null;
    metadata: Record<string, unknown> | null;
    createdAt: Date;
    updatedAt: Date;
}