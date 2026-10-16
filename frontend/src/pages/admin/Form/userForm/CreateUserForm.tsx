import { useState } from "react";
import {
    createAdminUser,
    type CreateUserInput,
} from "../../../../services/adminUserService";
import './CreateUserForm.css'

interface Props {
    onSuccess: () => void;
}

export default function CreateUserForm({ onSuccess }: Props) {
    const [userId, setUserId] = useState("");
    const [firstname, setFirstname] = useState("");
    const [lastname, setLastname] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    async function handleSubmit(
        e: React.FormEvent<HTMLFormElement>
    ) {
        e.preventDefault();
        setError("");
        setSuccess("");

        const input: CreateUserInput = {
            userId: userId.trim(),
            firstname: firstname.trim(),
            lastname: lastname.trim(),
            password,
        };

        try {
            setLoading(true);
            await createAdminUser(input);

            setUserId("");
            setFirstname("");
            setLastname("");
            setPassword("");
            setSuccess("User created successfully.");
            onSuccess();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to create user."
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <form
            className="create-user-form"
            onSubmit={handleSubmit}
        >
            <h2>Add User</h2>

            <label htmlFor="user-id">User ID</label>
            <input
                id="user-id"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                required
            />

            <label htmlFor="user-firstname">First name</label>
            <input
                id="user-firstname"
                value={firstname}
                onChange={(e) => setFirstname(e.target.value)}
                required
            />

            <label htmlFor="user-lastname">Last name</label>
            <input
                id="user-lastname"
                value={lastname}
                onChange={(e) => setLastname(e.target.value)}
                required
            />

            <label htmlFor="user-password">Password</label>
            <input
                id="user-password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
            />

            {error && <p role="alert">{error}</p>}
            {success && <p role="status">{success}</p>}

            <button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create User"}
            </button>
        </form>
    );
}