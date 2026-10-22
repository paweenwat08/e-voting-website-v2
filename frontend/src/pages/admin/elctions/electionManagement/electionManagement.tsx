import { Link } from "react-router-dom";
import type { Election } from "../../../../services/electionService";

interface Props {
    elections: Election[];
    loading: boolean;
    error: string;
    onRefresh: () => void | Promise<void>;
}

export default function ElectionManagement({
    elections,
    loading,
    error,
    onRefresh,
}: Props) {
    return (
        <section className="admin-section">
            <div className="admin-section-heading">
                <div>
                    <h2>Election Management</h2>
                    <p>
                        Review and manage existing elections.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => void onRefresh()}
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
                                <th>ID</th>
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

                                        <p>
                                            {election.description}
                                        </p>
                                    </td>

                                    <td>
                                        <strong>
                                            {election.id}
                                        </strong>
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
                                            /
                                            <Link
                                                to={`/admin/elections/${election.id}/eligibility`}
                                            >
                                                Manage Voters
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