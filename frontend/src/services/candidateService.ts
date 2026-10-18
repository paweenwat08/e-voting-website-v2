import { type Candidate } from "../types/Candidate";
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