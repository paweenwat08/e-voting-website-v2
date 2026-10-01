export type CandidateEligibilityStatus =
    | "eligible"
    | "ineligible";

export interface CandidateEligibility {
    id: number;
    identityId: string;
    electionId: string;
    status: CandidateEligibilityStatus;
    createdAt: Date;
    updatedAt: Date;
}