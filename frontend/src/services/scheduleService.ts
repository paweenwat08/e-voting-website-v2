import { API_BASE_URL } from "../constant";
import type { Election } from "../types/Election";

interface ElectionsScheduleResponse {
    success: boolean;
    elections: Election[];
}

export async function getScheduleElections(): Promise<Election[]> {
    const response = await fetch(`${API_BASE_URL}/elections`);

    if (!response.ok) {
        throw new Error(`Failed to load elections: ${response.status}`);
    }

    const data: ElectionsScheduleResponse = await response.json();

    if (!data.success || !Array.isArray(data.elections)) {
        throw new Error("Invalid elections response");
    }

    return data.elections;
}
