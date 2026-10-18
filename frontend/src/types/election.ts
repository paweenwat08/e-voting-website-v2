import type { Candidate } from "./Candidate";

export interface Election {
    id: number;
    title: string;
    description: string;
    startAt: string;
    endAt: string;
    status: "draft" | "scheduled" | "open" | "closed";
    createdAt: string;
    updatedAt: string;
}

export interface ElectionInput {
    title: string;
    description: string;
    startAt: string;
    endAt: string;
}

export interface ElectionsResponse {
    success: boolean;
    elections: Election[];
}

export interface ElectionDetailResponse {
    success: boolean;
    election: Election & {
        candidates: Candidate[];
    };
}

export interface ElectionMutationResponse {
    success: boolean;
    message: string;
    election: Election;
}

export interface ElectionEvent {
    id: number;
    date: string;
    title: string;
    description?: string;
}

export interface EligibleElection {
    id: string;
    identity_id: string;
    election_id: string;
    eligibility_status: string;
    created_at: string;
    updated_at: string;
    title: string;
    description: string | null;
    election_status: string;
}