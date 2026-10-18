export async function readResponse(response: Response) {
    const data = await response.json();

    if (!response.ok || !data.success) {
        throw new Error(
            data.message || "Request failed."
        );
    }

    return data;
}