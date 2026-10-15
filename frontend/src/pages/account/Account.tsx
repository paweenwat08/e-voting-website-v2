
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import Navigation from "../../components/Navigation/Navigation";
import "./Account.css";

export default function Account() {
    const { user, isLoggedIn, isLoading, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            navigate("/auth/login");
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    if (isLoading) {
        return (
            <>
                <Navigation action="DASHBOARD" />
                <main className="account-page">
                    <p>Loading your account...</p>
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
                    <p>Manage your account and review your voter information.</p>
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
                </section>

                <section className="account-card">
                    <div className="account-section-title">
                        <span className="material-symbols-outlined">
                            how_to_vote
                        </span>
                        <h2>Elections you can vote</h2>
                    </div>
                    {/* create a list of elections that user can vote using eligibility  -> use electionList */} 
                </section>

                <section className="account-actions">
                    <Link to="/" className="account-button account-button-secondary">
                        Back to Home
                    </Link>

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
                </section>
            </main>
        </>
    );
}
