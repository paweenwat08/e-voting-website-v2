import type {
    Election,
    ElectionInput,
    ElectionsResponse,
    ElectionDetailResponse,
    ElectionMutationResponse,
} from "../types/Election";

export type { Election } from "../types/Election";

const API_BASE_URL = import.meta.env.VITE_API_URL;

export async function getAllElections(): Promise<Election[]> {
    const response = await fetch(`${API_BASE_URL}/elections`);

    if (!response.ok) {
        throw new Error(`Failed to fetch elections: ${response.status}`);
    }

    const data: ElectionsResponse = await response.json();

    return data.elections;
}

export async function getElectionById(
    electionId: number
): Promise<ElectionDetailResponse["election"]> {
    const response = await fetch(
        `${API_BASE_URL}/elections/${electionId}`
    );

    if (response.status === 404) {
        throw new Error("NOT_FOUND");
    }

    if (!response.ok) {
        throw new Error(`Failed to fetch election: ${response.status}`);
    }

    const data: ElectionDetailResponse = await response.json();

    return data.election;
}

export async function createElection(
    input: ElectionInput
): Promise<Election> {
    const response = await fetch(`${API_BASE_URL}/elections/create`, {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
    });

    const data: ElectionMutationResponse = await response.json();

    if (!response.ok || !data.success) {
        throw new Error(
            data.message ?? `Failed to create election: ${response.status}`
        );
    }

    return data.election;
}

async function electionMutation(
    path: string,
    method: "PATCH"
): Promise<Election> {
    const response = await fetch(`${API_BASE_URL}/elections${path}`, {
        method,
        credentials: "include",
    });

    const data: ElectionMutationResponse = await response.json();

    if (!response.ok || !data.success) {
        throw new Error(
            data.message ?? `Request failed: ${response.status}`
        );
    }

    return data.election;
}

export async function openElection(
    electionId: number
): Promise<Election> {
    return electionMutation(`/${electionId}/open`, "PATCH");
}

export async function closeElection(
    electionId: number
): Promise<Election> {
    return electionMutation(`/${electionId}/close`, "PATCH");
}

export async function updateElection(
    electionId: number,
    input: ElectionInput
): Promise<Election> {
    const response = await fetch(
        `${API_BASE_URL}/elections/${electionId}`,
        {
            method: "PATCH",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(input),
        }
    );

    const data: ElectionMutationResponse = await response.json();

    if (!response.ok || !data.success) {
        throw new Error(
            data.message ?? `Failed to update election: ${response.status}`
        );
    }

    return data.election;
}
