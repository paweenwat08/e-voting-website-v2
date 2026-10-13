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