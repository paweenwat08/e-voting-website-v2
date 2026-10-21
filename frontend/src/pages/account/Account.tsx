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
            </main>
        </>
    );
}