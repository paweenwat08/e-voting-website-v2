const API_BASE_URL = import.meta.env.VITE_API_URL;

export interface CreateUserInput {
    userId: string;
    firstname: string;
    lastname: string;
    password: string;
}

export interface UpdateAdminUserInput {
    firstname: string;
    lastname: string;
    role: "voter" | "admin";
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

async function readResponse(response: Response) {
    const data = await response.json();

    if (!response.ok || !data.success) {
        throw new Error(
            data.message || "Request failed."
        );
    }

    return data;
}

export async function createAdminUser(
    input: CreateUserInput
) {
    const response = await fetch(
        `${API_BASE_URL}/auth/register`,
        {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(input),
        }
    );

    return readResponse(response);
}

export async function searchAdminUsers(
    userId = ""
): Promise<AdminUser[]> {
    const params = new URLSearchParams();

    if (userId.trim()) {
        params.set("q", userId.trim());
    }

    const response = await fetch(
        `${API_BASE_URL}/auth/users?${params.toString()}`,
        {
            method: "GET",
            credentials: "include",
        }
    );

    const data = await readResponse(response);

    return data.users as AdminUser[];
}

export async function updateAdminUser(
    id: string,
    input: UpdateAdminUserInput
): Promise<AdminUser> {
    const response = await fetch(
        `${API_BASE_URL}/auth/users/${encodeURIComponent(id)}`,
        {
            method: "PATCH",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(input),
        }
    );

    const data = await readResponse(response);

    return data.user as AdminUser;
}