const API_BASE_URL = import.meta.env.VITE_API_URL;

interface LoginResponse {
    success: boolean;
}

export async function userLogin(
    userId: string,
    password: string
): Promise<LoginResponse["success"]> {
    const response = await fetch(
        `${API_BASE_URL}/auth/login`,
        {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                userId: userId,
                password: password
            })
        }
    );

    if (!response.ok) {
        throw new Error(`Failed authorization: ${response.status}`);
    }

    const data: LoginResponse = await response.json();

    return data.success;
}