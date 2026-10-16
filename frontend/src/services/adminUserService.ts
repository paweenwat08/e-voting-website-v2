const API_BASE_URL = import.meta.env.VITE_API_URL;

export interface CreateUserInput {
    userId: string;
    firstname: string;
    lastname: string;
    password: string;
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

    const data = await response.json();

    if (!response.ok || !data.success) {
        throw new Error(
            data.message || "Failed to create user."
        );
    }

    return data;
}