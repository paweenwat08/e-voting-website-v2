
export interface ScheduleElection {
    id: string;
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
    elections: ScheduleElection[];
}

const API_BASE_URL = import.meta.env.VITE_API_URL;

export async function getScheduleElections(): Promise<ScheduleElection[]> {
    const response = await fetch(`${API_BASE_URL}/elections`);

    if (!response.ok) {
        throw new Error(`Failed to load elections: ${response.status}`);
    }

    const data: ElectionsResponse = await response.json();

    if (!data.success || !Array.isArray(data.elections)) {
        throw new Error("Invalid elections response");
    }

    return data.elections;
}
