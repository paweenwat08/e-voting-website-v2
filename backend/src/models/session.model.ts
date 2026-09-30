export interface Session {
    id: number;
    identityId: number;
    sessionTokenHash: string;
    expiresAt: Date;
    createdAt: Date;
    updatedAt: Date;
}