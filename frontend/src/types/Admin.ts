export interface UpdateAdminUserInput {
    firstname: string;
    lastname: string;
    status: "active" | "disabled";
}

export interface AdminUser {
    id: string;
    user_id: string;
    firstname: string;
    lastname: string;
    role: "voter" | "admin";
    status: "active" | "disabled";
    created_at: string;
    updated_at: string;
}