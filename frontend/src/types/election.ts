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