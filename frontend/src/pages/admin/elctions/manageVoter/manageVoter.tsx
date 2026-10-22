import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
    getElectionEligibilityUsers,
    grantVoterEligibility
} from "../../../../services/adminUserService";
import type { AdminUser } from "../../../../types/Admin";
import './manageVoter.css'

type ElectionVoter = AdminUser & {
    is_eligible: boolean;
};

export default function ElectionEligibilityManagement() {
    const { electionId } = useParams<{ electionId: string }>();

    const [users, setUsers] = useState<ElectionVoter[]>([]);
    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [grantingId, setGrantingId] = useState<string | null>(null);
    const [actionMessage, setActionMessage] = useState("");

    const loadUsers = useCallback(async () => {
        if (!electionId) {
            setError("Invalid election ID");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const result = await getElectionEligibilityUsers(
                electionId,
                query
            );

            setUsers(result as ElectionVoter[]);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Unable to load users"
            );
        } finally {
            setLoading(false);
        }
    }, [electionId, query]);

    const handleGrantEligibility = async (
        identityId: string
    ) => {
        if (!electionId || grantingId) return;

        setGrantingId(identityId);
        setActionMessage("");
        setError("");

        try {
            await grantVoterEligibility(electionId, identityId);

            setActionMessage("Voter eligibility granted successfully.");

            await loadUsers();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Unable to grant voter eligibility."
            );
        } finally {
            setGrantingId(null);
        }
    };

    useEffect(() => {
        void loadUsers();
    }, [loadUsers]);

    return (
        <section id="admin-manage-voters-section" className="mv-section">
            <div className="mv-header">
                <div className="mv-title-group">
                    <h2>Manage Voters</h2>
                    <p className="mv-subtitle">
                        Manage voter eligibility for this election.
                    </p>
                </div>

                <button
                    id="mv-refresh-btn"
                    className="mv-btn-secondary"
                    type="button"
                    onClick={() => void loadUsers()}
                    disabled={loading}
                >
                    {loading ? "Refreshing..." : "Refresh"}
                </button>
            </div>

            <div className="mv-election-info">
                <span className="mv-info-label">Election ID:</span>
                <code className="mv-info-value">{electionId}</code>
            </div>

            <div className="mv-search-box">
                <label htmlFor="mv-voter-search" className="mv-search-label">
                    Search by user ID
                </label>

                <input
                    id="mv-voter-search"
                    className="mv-search-input"
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Enter user ID..."
                />
            </div>

            {loading && (
                <div id="mv-state-loading" className="mv-state-message" role="status">
                    <span className="mv-spinner"></span> Loading users...
                </div>
            )}

            {!loading && error && (
                <div id="mv-state-error" className="mv-state-message error" role="alert">
                    Unable to load users: {error}
                </div>
            )}

            {!loading && !error && users.length === 0 && (
                <div id="mv-state-empty" className="mv-state-message">
                    No users found matching your query.
                </div>
            )}

            {!loading && !error && users.length > 0 && (
                <div id="mv-table-wrapper" className="mv-table-wrapper">
                    <table id="mv-users-table" className="mv-table">
                        <thead>
                            <tr>
                                <th>User ID</th>
                                <th>Name</th>
                                <th>Account Status</th>
                                <th>Eligibility</th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id}>
                                    <td className="mv-cell-id">{user.user_id}</td>

                                    <td className="mv-cell-name">
                                        {user.firstname} {user.lastname}
                                    </td>

                                    <td>
                                        <span className={`mv-badge status-${user.status?.toLowerCase() || 'default'}`}>
                                            {user.status}
                                        </span>
                                    </td>

                                    <td>
                                        <span className={`mv-badge ${user.is_eligible ? 'eligible' : 'ineligible'}`}>
                                            {user.is_eligible ? "Eligible" : "Not eligible"}
                                        </span>
                                    </td>

                                    <td>
                                        {user.is_eligible ? (
                                            <span>Already eligible</span>
                                        ) : user.status === "active" && user.role === "voter" ? (
                                            <button
                                                type="button"
                                                disabled={grantingId !== null}
                                                onClick={() => void handleGrantEligibility(user.id)}
                                            >
                                                {grantingId === user.id
                                                    ? "Granting..."
                                                    : "Grant Eligibility"}
                                            </button>
                                        ) : (
                                            <span>Unavailable</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {actionMessage && (
                        <p role="status">{actionMessage}</p>
                    )}
                </div>
            )}

            <div className="mv-footer">
                <Link id="mv-back-link" to="/admin" className="mv-link-back">
                    &larr; Back to Admin Dashboard
                </Link>
            </div>
        </section>
    );
}