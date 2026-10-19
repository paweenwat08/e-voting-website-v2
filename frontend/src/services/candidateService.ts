import { type Candidate, type CandidateInput } from "../types/Candidate";
import { API_BASE_URL } from "../constant";

export async function getCandidatesByElection(
    electionId: string
): Promise<Candidate[]> {
    const response = await fetch(
        `${API_BASE_URL}/candidates/election/${encodeURIComponent(electionId)}`,
        {
            method: "GET",
            credentials: "include",
        }
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
        throw new Error(
            data.message || "Failed to load candidates."
        );
    }

    return data.candidates;
}

export async function createCandidate(input: CandidateInput) {
    const response = await fetch(
        `${API_BASE_URL}/candidates`,
        {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(input),
        }
    )

    const data = await response.json();

    if (!response.ok || !data.success) {
        throw new Error(
            data.message || "Failed to create a candidate."
        );
    }

    return data.candidate;
}

export async function getAllCandidates(): Promise<Candidate[]> {
    const response = await fetch(
        `${API_BASE_URL}/candidates`,
        {
            method: "GET",
            credentials: "include",
        }
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
        throw new Error(
            data.message || "Failed to load candidates."
        );
    }

    return data.candidates;
}