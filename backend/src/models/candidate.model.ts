export interface Candidate {
    id: number;
    electionId: number;
    identity_id: number;
    candidateNumber: number;
    description: string | null;
    createdAt: Date;
    updatedAt: Date;
}