export type EligibilityStatus =
    | "eligible"
    | "ineligible";

export interface Eligibility {
    id: number;
    identityId: number;
    electionId: number;
    status: EligibilityStatus;
    createdAt: Date;
    updatedAt: Date;
}