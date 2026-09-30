export type ElectionStatus =
    | "draft"
    | "scheduled"
    | "open"
    | "closed";

export interface Election {
    id: number;
    title: string;
    description: string;
    startAt: Date;
    endAt: Date;
    status: ElectionStatus;
    createdAt: Date;
    updatedAt: Date;
}