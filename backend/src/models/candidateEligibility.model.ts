export type CandidateEligibilityStatus =
    | "eligible"
    | "ineligible";

export interface CandidateEligibility {
    id: number;
    identityId: number;
    electionId: number;
    status: CandidateEligibilityStatus;
    createdAt: Date;
    updatedAt: Date;
}