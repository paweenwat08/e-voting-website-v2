export interface Candidate {
    id: number;
    identity_id: string;
    election_id: number;
    candidate_number: number;
    description: string | null;
    created_at: string;
    updated_at: string;
    firstname: string;
    lastname: string;

    // ข้อมูลสำหรับแสดงผล
    votes: number;
    image?: string;
}