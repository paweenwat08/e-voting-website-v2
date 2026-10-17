
const API_BASE_URL = import.meta.env.VITE_API_URL;

export interface Candidate {
    id: string;
    election_id: string;
    candidate_number: number;
    firstname: string;
    lastname: string;
    description: string | null;
}

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

export async function castVote(
    electionId: string,
    candidateId: string
): Promise<void> {
    const response = await fetch(
        `${API_BASE_URL}/votes`,
        {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                electionId,
                candidateId,
            }),
        }
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
        throw new Error(
            data.message || "Failed to cast vote."
        );
    }
}

export async function checkVoteStatus(
    electionId: string
): Promise<boolean> {
    const response = await fetch(
        `${API_BASE_URL}/votes/status/${encodeURIComponent(electionId)}`,
        {
            method: "GET",
            credentials: "include",
        }
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
        throw new Error(
            data.message || "Failed to check vote status."
        );
    }

    return data.hasVoted;
}