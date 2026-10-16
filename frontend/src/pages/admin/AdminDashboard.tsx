import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

import Navigation from "../../components/Navigation/Navigation";
import {
    getAllElections,
    type Election,
} from "../../services/electionService";

import CreateUserForm from "./user/CreateUserForm";
import CreateElectionForm from "./election/CreateElectionForm";

import "./AdminDashboard.css";

export default function AdminDashboard() {
    const { user, isLoading } = useAuth();
    const navigate = useNavigate();

    const [elections, setElections] = useState<Election[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Check whether the current user is an admin.
    useEffect(() => {
        if (isLoading) return;

        if (!user) {
            navigate("/auth/login?redirect=/admin", {
                replace: true,
            });
            return;
        }

        if (user.role !== "admin") {
            navigate("/", { replace: true });
        }
    }, [user, isLoading, navigate]);

    // Load elections only after admin authorization is confirmed.
    useEffect(() => {
        if (isLoading || user?.role !== "admin") return;

        void loadElections();
    }, [isLoading, user]);

    async function loadElections() {
        try {
            setLoading(true);
            setError("");

            const data = await getAllElections();
            setElections(data);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to load elections."
            );
        } finally {
            setLoading(false);
        }
    }

    // Count total, draft, open, and closed elections.
    const counts = {
        total: elections.length,
        draft: elections.filter((e) => e.status === "draft").length,
        open: elections.filter((e) => e.status === "open").length,
        closed: elections.filter((e) => e.status === "closed").length,
    };

    if (isLoading || !user || user.role !== "admin") {
        return <p role="status">Checking permissions...</p>;
    }

    return (
        <>
            <Navigation action="ADMIN" />

            <main className="admin-dashboard">
                <header className="admin-header">
                    <div>
                        <p className="admin-eyebrow">ADMINISTRATION</p>
                        <h1>Admin Dashboard</h1>
                        <p>Manage elections and monitor their status.</p>
                    </div>

                    <Link
                        to="/auth/account"
                        className="admin-account-link"
                    >
                        My Account
                    </Link>
                </header>

                {/* Election statistics */}
                <section
                    className="admin-stats"
                    aria-label="Election overview"
                >
                    <article className="admin-stat">
                        <span>Total Elections</span>
                        <strong>{counts.total}</strong>
                    </article>

                    <article className="admin-stat">
                        <span>Draft</span>
                        <strong>{counts.draft}</strong>
                    </article>

                    <article className="admin-stat">
                        <span>Open</span>
                        <strong>{counts.open}</strong>
                    </article>

                    <article className="admin-stat">
                        <span>Closed</span>
                        <strong>{counts.closed}</strong>
                    </article>
                </section>

                {/* Admin actions */}
                <section className="admin-elections">
                    <div className="admin-create">
                        <details>
                            <summary>Create Election</summary>

                            <CreateElectionForm
                                onSuccess={loadElections}
                            />
                        </details>

                        <details>
                            <summary>Add User</summary>

                            <CreateUserForm
                                onSuccess={() => {}}
                            />
                        </details>
                    </div>

                    {/* Election management */}
                    <div className="admin-section-heading">
                        <div>
                            <h2>Election Management</h2>
                            <p>Review and manage existing elections.</p>
                        </div>

                        <button
                            type="button"
                            onClick={() => void loadElections()}
                            disabled={loading}
                        >
                            Refresh
                        </button>
                    </div>

                    {loading && (
                        <p role="status">Loading elections...</p>
                    )}

                    {!loading && error && (
                        <p role="alert">
                            Unable to load elections: {error}
                        </p>
                    )}

                    {!loading && !error && elections.length === 0 && (
                        <p>No elections found.</p>
                    )}

                    {!loading && !error && elections.length > 0 && (
                        <div className="admin-table-wrapper">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Election</th>
                                        <th>Start</th>
                                        <th>End</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {elections.map((election) => (
                                        <tr key={election.id}>
                                            <td>
                                                <strong>
                                                    {election.title}
                                                </strong>
                                                <p>{election.description}</p>
                                            </td>

                                            <td>
                                                {new Date(
                                                    election.startAt
                                                ).toLocaleString()}
                                            </td>

                                            <td>
                                                {new Date(
                                                    election.endAt
                                                ).toLocaleString()}
                                            </td>

                                            <td>
                                                <span
                                                    className={`admin-status status-${election.status}`}
                                                >
                                                    {election.status.toUpperCase()}
                                                </span>
                                            </td>

                                            <td>
                                                <div className="admin-row-actions">
                                                    <Link
                                                        to={`/admin/elections/${election.id}/edit`}
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
            </main>
        </>
    );
}