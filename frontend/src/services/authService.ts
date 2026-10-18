import { API_BASE_URL } from "../constant";
import type { MeResponse, LoginResponse } from "../types/Api";
import type { CurrentUser } from "../types/User";

export async function userLogin(
    userId: string,
    password: string
): Promise<CurrentUser | null> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ userId, password })
    });

    if (!response.ok) {
        throw new Error(`Failed authorization: ${response.status}`);
    }

    const data: LoginResponse = await response.json();

    if (!data.success) {
        return null;
    }

    return await getCurrentUser();
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: "GET",
        credentials: "include"
    });

    if (response.status === 401 || response.status === 403) {
        return null;
    }

    if (!response.ok) {
        throw new Error(`Failed to check session: ${response.status}`);
    }

    const data: MeResponse = await response.json();

    if (!data.success || !data.identity) {
        return null;
    }

    return data.identity;
}

export async function userLogout(): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        credentials: "include"
    });

    if (!response.ok) {
        throw new Error(`Logout failed: ${response.status}`);
    }
}
