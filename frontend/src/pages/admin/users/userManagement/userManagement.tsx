import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import {
    searchAdminUsers,
} from "../../../../services/adminUserService";
import { type AdminUser } from "../../../../types/Admin";
import './userManagement.css'

interface Props {
    refreshKey: number;
}

export default function UserManagement({ refreshKey }: Props) {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function loadUsers(searchQuery = query) {
        try {
            setLoading(true);
            setError("");

            const data = await searchAdminUsers(searchQuery);
            setUsers(data);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to load users."
            );
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        void loadUsers("");
    }, [refreshKey]);

    return (
        <section className="admin-section">
            <div className="admin-section-heading">
                <div>
                    <h2>User Management</h2>
                    <p>Search and manage registered users.</p>
                </div>

                <button
                    type="button"
                    onClick={() => void loadUsers()}
                    disabled={loading}
                >
                    Refresh
                </button>
            </div>

            <div id="user-search-container">
                <label htmlFor="user-search">
                    Search by User ID
                </label>

                <input
                    id="user-search"
                    type="search"
                    value={query}
                    onChange={(event) => {
                        const value = event.target.value;
                        setQuery(value);
                        void loadUsers(value);
                    }}
                    placeholder="Enter user ID"
                />
            </div>

            {loading && (
                <p role="status">Loading users...</p>
            )}

            {!loading && error && (
                <p role="alert">
                    Unable to load users: {error}
                </p>
            )}

            {!loading && !error && users.length === 0 && (
                <p>No users found.</p>
            )}

            {!loading && !error && users.length > 0 && (
                <div className="admin-table-wrapper">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>User ID</th>
                                <th>First name</th>
                                <th>Last name</th>
                                <th>Role</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id}>
                                    <td>{user.user_id}</td>
                                    <td>{user.firstname}</td>
                                    <td>{user.lastname}</td>
                                    <td>{user.role}</td>
                                    <td>
                                        <span
                                            className={`admin-status status-${user.status}`}
                                        >
                                            {user.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="admin-row-actions">
                                            <Link
                                                to={`/admin/user/${user.id}/edit`}
                                            >
                                                Edit
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    );
}