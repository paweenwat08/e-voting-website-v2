export interface Candidate {
    id: number;
    electionId: number;
    firstname: string;
    lastname: string;
    candidateNumber: number;
    description: string | null;
    createdAt: Date;
    updatedAt: Date;
}