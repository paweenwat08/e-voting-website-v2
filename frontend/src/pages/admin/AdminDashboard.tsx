import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

import Navigation from "../../components/Navigation/Navigation";
import {
    getAllElections,
    openElection,
    closeElection,
    type Election,
} from "../../services/electionService";

import "./AdminDashboard.css";

export default function AdminDashboard() {
    const { user, isLoading } = useAuth();
    const navigate = useNavigate();

    const [elections, setElections] = useState<Election[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [actionError, setActionError] = useState("");
    const [actionLoading, setActionLoading] = useState<number | null>(null);

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

    async function handleStatusChange(election: Election) {
        try {
            setActionLoading(election.id);
            setActionError("");

            const updatedElection =
                election.status === "open"
                    ? await closeElection(election.id)
                    : await openElection(election.id);

            // Preserve existing election fields and update its status.
            setElections((current) =>
                current.map((item) =>
                    item.id === election.id
                        ? { ...item, status: updatedElection.status }
                        : item
                )
            );
        } catch (err) {
            setActionError(
                err instanceof Error
                    ? err.message
                    : "Failed to update election status."
            );
        } finally {
            setActionLoading(null);
        }
    }

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

                <section className="admin-elections">
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

                    {actionError && (
                        <p role="alert">{actionError}</p>
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
                                                        to={`/elections/${election.id}`}
                                                    >
                                                        View
                                                    </Link>

                                                    {(election.status === "draft" ||
                                                        election.status === "scheduled" ||
                                                        election.status === "open") && (
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                void handleStatusChange(
                                                                    election
                                                                )
                                                            }
                                                            disabled={
                                                                actionLoading !== null
                                                            }
                                                        >
                                                            {actionLoading ===
                                                            election.id
                                                                ? "Updating..."
                                                                : election.status ===
                                                                    "open"
                                                                  ? "Close"
                                                                  : "Open"}
                                                        </button>
                                                    )}
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