import type {
    UpdateAdminUserInput,
    AdminUser
} from '../types/Admin'
import type { CreateUserInput } from '../types/Input';
import { API_BASE_URL } from '../constant';
import { readResponse } from './apiUtils';

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