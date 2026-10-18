import { type CurrentUser } from "./User";
import type { Election } from "./Election";
import type { EligibleElection } from "./Election";

export interface MeResponse {
    success: boolean;
    identity: CurrentUser;
}

export interface LoginResponse {
    success: boolean;
}

export interface ElectionsScheduleResponse {
    success: boolean;
    elections: Election[];
}

export interface MyEligibilitiesResponse {
    success: boolean;
    eligibilities: EligibleElection[];
}