import { type CurrentUser } from "./User";
import type { Election } from "./Election";

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