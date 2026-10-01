export interface Candidate {
    id: number;
    electionId: string;
    identity_id: string;
    candidateNumber: string;
    description: string | null;
    createdAt: Date;
    updatedAt: Date;
}