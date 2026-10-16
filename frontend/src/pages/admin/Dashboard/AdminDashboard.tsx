import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";

import Navigation from "../../../components/Navigation/Navigation";

import {
    getAllElections,
    type Election,
} from "../../../services/electionService";

import CreateUserForm from "../Form/userForm/CreateUserForm";
import CreateElectionForm from "../Form/electionForm/CreateElectionForm";
import ElectionManagement from "../Management/electionManagement/electionManagement";
import UserManagement from "../Management/userManagement/userManagement";

import "./AdminDashboard.css";

export default function AdminDashboard() {
    const { user, isLoading } = useAuth();
    const navigate = useNavigate();

    const [elections, setElections] = useState<Election[]>([]);
    const [electionsLoading, setElectionsLoading] = useState(true);
    const [electionsError, setElectionsError] = useState("");

    // Increment this after creating a user to refresh User Management.
    const [usersRefreshKey, setUsersRefreshKey] = useState(0);

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

    useEffect(() => {
        if (isLoading || user?.role !== "admin") return;

        void loadElections();
    }, [isLoading, user]);

    async function loadElections() {
        try {
            setElectionsLoading(true);
            setElectionsError("");

            const data = await getAllElections();
            setElections(data);
        } catch (err) {
            setElectionsError(
                err instanceof Error
                    ? err.message
                    : "Failed to load elections."
            );
        } finally {
            setElectionsLoading(false);
        }
    }

    const counts = {
        total: elections.length,
        draft: elections.filter(
            (election) => election.status === "draft"
        ).length,
        open: elections.filter(
            (election) => election.status === "open"
        ).length,
        closed: elections.filter(
            (election) => election.status === "closed"
        ).length,
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
                        <p className="admin-eyebrow">
                            ADMINISTRATION
                        </p>

                        <h1>Admin Dashboard</h1>

                        <p>
                            Manage elections and monitor their status.
                        </p>
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

                {/* Create actions */}
                <section className="admin-section">
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
                                onSuccess={() => {
                                    setUsersRefreshKey(
                                        (current) => current + 1
                                    );
                                }}
                            />
                        </details>
                    </div>
                </section>

                {/* Election Management */}
                <ElectionManagement
                    elections={elections}
                    loading={electionsLoading}
                    error={electionsError}
                    onRefresh={loadElections}
                />

                {/* User Management */}
                <UserManagement
                    refreshKey={usersRefreshKey}
                    onEdit={(user) => {
                        console.log("Edit user:", user);
                    }}
                />
            </main>
        </>
    );
}