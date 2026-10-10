export interface Election {
    id: number;
    title: string;
    description: string;
    startAt: string;
    endAt: string;
    status: "draft" | "scheduled" | "open" | "closed";
}

export interface ElectionEvent {
    id: number;
    date: string;
    title: string;
    description?: string;
}