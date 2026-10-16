import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

import Navigation from "../../components/Navigation/Navigation";
import {
    getAllElections,
    createElection,
    type Election,
} from "../../services/electionService";

import "./AdminDashboard.css";

export default function AdminDashboard() {
    const { user, isLoading } = useAuth();
    const navigate = useNavigate();

    const [elections, setElections] = useState<Election[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Create election form
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [createLoading, setCreateLoading] = useState(false);
    const [createError, setCreateError] = useState("");
    const [createSuccess, setCreateSuccess] = useState("");

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [startAt, setStartAt] = useState("");
    const [endAt, setEndAt] = useState("");

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

    async function handleCreateElection(
        e: React.FormEvent<HTMLFormElement>
    ) {
        e.preventDefault();

        setCreateError("");
        setCreateSuccess("");

        const startDate = new Date(startAt);
        const endDate = new Date(endAt);

        if (
            Number.isNaN(startDate.getTime()) ||
            Number.isNaN(endDate.getTime())
        ) {
            setCreateError("Please enter valid dates and times.");
            return;
        }

        if (startDate >= endDate) {
            setCreateError("Start time must be before end time.");
            return;
        }

        try {
            setCreateLoading(true);

            await createElection({
                title: title.trim(),
                description: description.trim(),
                startAt: startDate.toISOString(),
                endAt: endDate.toISOString(),
            });

            setTitle("");
            setDescription("");
            setStartAt("");
            setEndAt("");
            setShowCreateForm(false);
            setCreateSuccess("Election created successfully.");

            await loadElections();
        } catch (err) {
            setCreateError(
                err instanceof Error
                    ? err.message
                    : "Failed to create election."
            );
        } finally {
            setCreateLoading(false);
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

                <section className="admin-elections">
                    {/* Create election */}
                    <div className="admin-create-election">
                        <button
                            type="button"
                            onClick={() => {
                                setShowCreateForm((current) => !current);
                                setCreateError("");
                                setCreateSuccess("");
                            }}
                        >
                            {showCreateForm
                                ? "Cancel"
                                : "+ Create Election"}
                        </button>

                        {createSuccess && (
                            <p role="status">{createSuccess}</p>
                        )}

                        {showCreateForm && (
                            <form
                                className="admin-create-form"
                                onSubmit={handleCreateElection}
                            >
                                <h2>Create Election</h2>

                                <label htmlFor="election-title">
                                    Election title
                                </label>
                                <input
                                    id="election-title"
                                    type="text"
                                    value={title}
                                    onChange={(e) =>
                                        setTitle(e.target.value)
                                    }
                                    maxLength={200}
                                    required
                                />

                                <label htmlFor="election-description">
                                    Description
                                </label>
                                <textarea
                                    id="election-description"
                                    value={description}
                                    onChange={(e) =>
                                        setDescription(e.target.value)
                                    }
                                    required
                                />

                                <label htmlFor="election-start">
                                    Start date and time
                                </label>
                                <input
                                    id="election-start"
                                    type="datetime-local"
                                    value={startAt}
                                    onChange={(e) =>
                                        setStartAt(e.target.value)
                                    }
                                    required
                                />

                                <label htmlFor="election-end">
                                    End date and time
                                </label>
                                <input
                                    id="election-end"
                                    type="datetime-local"
                                    value={endAt}
                                    onChange={(e) =>
                                        setEndAt(e.target.value)
                                    }
                                    required
                                />

                                {createError && (
                                    <p role="alert">{createError}</p>
                                )}

                                <button
                                    type="submit"
                                    disabled={createLoading}
                                >
                                    {createLoading
                                        ? "Creating..."
                                        : "Create Election"}
                                </button>
                            </form>
                        )}
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
                                                    <Link to={`/admin/elections/${election.id}/edit`}>
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