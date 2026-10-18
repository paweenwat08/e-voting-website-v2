import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import Navigation from "../../components/Navigation/Navigation";
import ElectionList from "../../components/dashboard/ElectionList/ElectionList";
import {
    getMyVoterEligibilities,
    type EligibleElection,
} from "../../services/VoterEligibility";
import "./Account.css";

export default function Account() {
    const { user, isLoggedIn, isLoading, logout } = useAuth();
    const navigate = useNavigate();

    const [elections, setElections] = useState<EligibleElection[]>([]);
    const [loadingElections, setLoadingElections] = useState(true);
    const [electionError, setElectionError] = useState("");

    useEffect(() => {
        if (isLoading) return;

        if (!isLoggedIn || !user) {
            setElections([]);
            setLoadingElections(false);
            return;
        }

        let cancelled = false;

        async function loadElections() {
            try {
                setLoadingElections(true);
                setElectionError("");

                const data = await getMyVoterEligibilities();

                if (!cancelled) {
                    setElections(data);
                }
            } catch (error) {
                console.error("Failed to load eligible elections:", error);

                if (!cancelled) {
                    setElectionError(
                        "Unable to load your eligible elections. Please try again."
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoadingElections(false);
                }
            }
        }

        void loadElections();

        return () => {
            cancelled = true;
        };
    }, [isLoading, isLoggedIn, user?.id]);

    const handleLogout = async () => {
        try {
            await logout();
            navigate("/");
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    if (isLoading) {
        return (
            <>
                <Navigation action="DASHBOARD" />
                <main className="account-page">
                    <p role="status">Loading your account...</p>
                </main>
            </>
        );
    }

    if (!isLoggedIn || !user) {
        return (
            <>
                <Navigation action="DASHBOARD" />
                <main className="account-page">
                    <section className="account-card">
                        <h1>Please log in</h1>
                        <p>You need to log in to view your account.</p>
                        <Link to="/auth/login" className="account-button">
                            Go to Login
                        </Link>
                    </section>
                </main>
            </>
        );
    }

    return (
        <>
            <Navigation action="account" />

            <main className="account-page">
                <section className="account-heading">
                    <p className="account-eyebrow">MY ACCOUNT</p>
                    <h1>My Profile</h1>
                    <p>
                        Manage your account and review your voter information.
                    </p>
                </section>

                <section className="account-card">
                    <div className="account-avatar">
                        <span className="material-symbols-outlined">
                            account_circle
                        </span>
                    </div>

                    <h2>
                        {user.firstname} {user.lastname}
                    </h2>

                    <p className="account-user-id">
                        User ID: {user.userId}
                    </p>

                    <div className="account-details">
                        <div className="account-detail">
                            <span>Account status</span>
                            <strong>{user.status}</strong>
                        </div>

                        <div className="account-detail">
                            <span>Role</span>
                            <strong>{user.role}</strong>
                        </div>
                    </div>

                    <div className="account-actions">
                        {user.role === "admin" && (
                            <Link
                                to="/admin"
                                className="account-button account-button-admin"
                            >
                                Admin Dashboard
                            </Link>
                        )}

                        <button
                            type="button"
                            className="account-button account-button-danger"
                            onClick={handleLogout}
                        >
                            <span className="material-symbols-outlined account-logo">
                                logout
                            </span>
                            Logout
                        </button>
                    </div>
                </section>

                <section className="account-card">
                    <h2>you are eligible to these elections</h2>
                    <ElectionList
                        elections={elections}
                        loading={loadingElections}
                        error={electionError || null}
                    />
                </section>

                {/* <section className="account-card">
                    <button>request wanna be a candidate</button>
                </section> */}

            </main>
        </>
    );
}