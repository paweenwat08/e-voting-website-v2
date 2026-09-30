export type IdentityRole =
    | "voter"
    | "admin";

export type IdentityStatus =
    | "active"
    | "disabled";

export interface Identity {
    id: number;
    userId: string;
    firstname: string;
    lastname: string;
    passwordHash: string;
    role: IdentityRole;
    status: IdentityStatus;
    createdAt: Date;
    updatedAt: Date;
}