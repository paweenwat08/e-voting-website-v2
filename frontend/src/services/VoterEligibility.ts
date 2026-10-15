const API_BASE_URL = import.meta.env.VITE_API_URL;

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

interface MyEligibilitiesResponse {
    success: boolean;
    eligibilities: EligibleElection[];
}

export async function getMyVoterEligibilities():
    Promise<EligibleElection[]> {
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
