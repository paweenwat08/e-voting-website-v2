export type VotingAuthorizationStatus =
    | "unused"
    | "consumed"
    | "revoked";

export interface VotingAuthorization {
    id: number;
    identityId: number;
    electionId: number;
    status: VotingAuthorizationStatus;
    consumedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}