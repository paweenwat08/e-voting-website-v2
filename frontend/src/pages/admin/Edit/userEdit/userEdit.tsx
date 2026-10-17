import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { useAuth } from "../../../../contexts/AuthContext";
import Navigation from "../../../../components/Navigation/Navigation";

import {
    searchAdminUsers,
    updateAdminUser,
    type AdminUser,
} from "../../../../services/adminUserService";

import "./UserEdit.css";

type UserStatus = "active" | "disabled";

export default function AdminUserEdit() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const { user, isLoading: authLoading } = useAuth();

    const [selectedUser, setSelectedUser] =
        useState<AdminUser | null>(null);

    const [firstname, setFirstname] = useState("");
    const [lastname, setLastname] = useState("");
    const [status, setStatus] = useState<UserStatus>("active");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        if (authLoading) return;

        if (!user || user.role !== "admin") {
            setLoading(false);
            return;
        }

        if (!id || !/^\d+$/.test(id)) {
            setError("Invalid user ID.");
            setLoading(false);
            return;
        }

        let cancelled = false;

        async function loadUser() {
            try {
                setLoading(true);
                setError("");

                const users = await searchAdminUsers();

                const foundUser = users.find(
                    (item) => String(item.id) === id
                );

                if (!foundUser) {
                    if (!cancelled) {
                        setError("User not found.");
                    }
                    return;
                }

                if (cancelled) return;

                setSelectedUser(foundUser);
                setFirstname(foundUser.firstname);
                setLastname(foundUser.lastname);
                setStatus(foundUser.status);
            } catch (err) {
                if (!cancelled) {
                    setError(
                        err instanceof Error
                            ? err.message
                            : "Failed to load user."
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        void loadUser();

        return () => {
            cancelled = true;
        };
    }, [id, user, authLoading]);

    async function handleSubmit(
        event: React.FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        if (!id || !selectedUser) return;

        if (status !== "active" && status !== "disabled") {
            setError("Invalid user status.");
            return;
        }

        try {
            setSaving(true);
            setError("");
            setSuccess("");

            const updatedUser = await updateAdminUser(id, {
                firstname: firstname.trim(),
                lastname: lastname.trim(),
                role: selectedUser.role,
                status,
            });

            setSelectedUser(updatedUser);
            setFirstname(updatedUser.firstname);
            setLastname(updatedUser.lastname);
            setStatus(updatedUser.status);

            setSuccess("User updated successfully.");
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to update user."
            );
        } finally {
            setSaving(false);
        }
    }

    if (authLoading || loading) {
        return (
            <>
                <Navigation action="DASHBOARD" />
                <main className="user-edit-page">
                    <p role="status">Loading user...</p>
                </main>
            </>
        );
    }

    if (!user || user.role !== "admin") {
        return (
            <>
                <Navigation action="DASHBOARD" />
                <main className="user-edit-page">
                    <h1>Access denied</h1>
                    <p>
                        You must be an administrator to edit users.
                    </p>
                    <Link to="/admin">Back to dashboard</Link>
                </main>
            </>
        );
    }

    return (
        <>
            <Navigation action="DASHBOARD" />

            <main className="user-edit-page">
                <div className="user-edit-header">
                    <div>
                        <h1>Edit User</h1>
                        <p>
                            Update the user's account information.
                        </p>
                    </div>

                    <Link to="/admin">Back to dashboard</Link>
                </div>

                {error && (
                    <p className="user-edit-error" role="alert">
                        {error}
                    </p>
                )}

                {success && (
                    <p className="user-edit-success" role="status">
                        {success}
                    </p>
                )}

                {selectedUser && (
                    <form
                        className="user-edit-form"
                        onSubmit={handleSubmit}
                    >
                        <div className="user-edit-field">
                            <label htmlFor="userId">User ID</label>
                            <input
                                id="userId"
                                type="text"
                                value={selectedUser.user_id}
                                readOnly
                            />
                        </div>

                        <div className="user-edit-field">
                            <label htmlFor="firstname">
                                First name
                            </label>
                            <input
                                id="firstname"
                                type="text"
                                value={firstname}
                                onChange={(event) =>
                                    setFirstname(event.target.value)
                                }
                                required
                                maxLength={100}
                            />
                        </div>

                        <div className="user-edit-field">
                            <label htmlFor="lastname">
                                Last name
                            </label>
                            <input
                                id="lastname"
                                type="text"
                                value={lastname}
                                onChange={(event) =>
                                    setLastname(event.target.value)
                                }
                                required
                                maxLength={100}
                            />
                        </div>

                        <div className="user-edit-field">
                            <label htmlFor="status">Account status</label>
                            <select
                                id="status"
                                value={status}
                                onChange={(event) => {
                                    setStatus(
                                        event.target.value as UserStatus
                                    );
                                    setSuccess("");
                                    setError("");
                                }}
                            >
                                <option value="active">Active</option>
                                <option value="disabled">Disabled</option>
                            </select>
                        </div>

                        <div className="user-edit-actions">
                            <button
                                type="submit"
                                disabled={
                                    saving ||
                                    !firstname.trim() ||
                                    !lastname.trim()
                                }
                            >
                                {saving
                                    ? "Saving..."
                                    : "Save changes"}
                            </button>

                            <button
                                type="button"
                                disabled={saving}
                                onClick={() => navigate("/admin")}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                )}
            </main>
        </>
    );
}