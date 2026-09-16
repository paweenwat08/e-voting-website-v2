import type { GetResultsResponse } from "../types/Vote";

export async function sendVote(
  voter: string,
  party: string,
  candidate: string,
  referendum: string
) {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/api/v1/vote`, 
    {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      voter,
      party,
      candidate,
      referendum,
    }),
  });

  return await response.json();
}

export async function getResults(): Promise<GetResultsResponse> {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/vote/results`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch vote results");
  }

  return await response.json();
}