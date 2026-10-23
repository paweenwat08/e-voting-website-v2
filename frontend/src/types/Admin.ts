export interface AdminUser {
    id: string;
    user_id: string;
    firstname: string;
    lastname: string;
    role: "voter" | "admin";
    status: "active" | "disabled";
    is_eligible?: boolean;
    created_at: string;
    updated_at: string;
}