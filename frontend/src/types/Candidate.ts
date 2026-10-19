export interface Candidate {
    id: number;
    identity_id: string;
    election_id: string;
    candidate_number: string;
    description: string | null;
    created_at: string;
    updated_at: string;
    firstname: string;
    lastname: string

    // ข้อมูลสำหรับแสดงผล
    votes?: number;
    image?: string;
    election_title?: string;
}

export interface CandidateInput {
    userId: string;
    electionId: string;
    candidateNumber: string;
    description?: string | null;
}