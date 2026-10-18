import { API_BASE_URL } from "../constant";
import type { EligibleElection } from "../types/Election";
import type { MyEligibilitiesResponse } from "../types/Api";

export async function getMyVoterEligibilities(): Promise<EligibleElection[]> {
    const response = await fetch(
        `${API_BASE_URL}/votes/eligibility/me`,
        {
            method: "GET",
            credentials: "include"
        }
    );

    if (!response.ok) {
        throw new Error(
            `Failed to load eligibilities: ${response.status}`
        );
    }

    const data: MyEligibilitiesResponse =
        await response.json();

    if (!data.success || !Array.isArray(data.eligibilities)) {
        throw new Error("Invalid eligibility response");
    }

    return data.eligibilities;
}
