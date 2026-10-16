export type AuditEventType =
    | "LOGIN_SUCCESS"
    | "LOGIN_FAILED"
    | "ADMIN_ACTION"
    | "ELECTION_CREATED"
    | "ELECTION_UPDATED"
    | "ELECTION_OPENED"
    | "ELECTION_CLOSED"
    | "VOTE_CAST"
    | "VOTE_REJECTED"
    | "DUPLICATE_REQUEST_REJECTED"
    | "UNAUTHORIZED_ACCESS";

export interface AuditLog {
    id: number;
    eventType: AuditEventType;
    identityId: number | null;
    metadata: Record<string, unknown> | null;
    createdAt: Date;
    updatedAt: Date;
}