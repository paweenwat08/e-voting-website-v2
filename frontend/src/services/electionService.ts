import type { Candidate } from "../types/Candidate";

const API_BASE_URL = import.meta.env.VITE_API_URL;

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

interface ElectionsResponse {
  success: boolean;
  elections: Election[];
}

interface ElectionDetailResponse {
  success: boolean;
  election: Election & {
    candidates: Candidate[];
  };
}

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

interface ElectionMutationResponse {
  success: boolean;
  message: string;
  election: Election;
}

async function electionMutation(
  path: string,
  method: "POST" | "PATCH",
  body?: {
    title: string;
    description: string;
    startAt: string;
    endAt: string;
  }
): Promise<Election> {
  const response = await fetch(`${API_BASE_URL}/elections${path}`, {
    method,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const data: ElectionMutationResponse = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(
      data.message ?? `Request failed: ${response.status}`
    );
  }

  return data.election;
}

export async function createElection(input: {
  title: string;
  description: string;
  startAt: string;
  endAt: string;
}): Promise<Election> {
  return electionMutation("/create", "POST", input);
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