
import { useAuth } from "../../contexts/AuthContext";
import { Link } from "react-router-dom";
import "./Navigation.css";

interface NavigationProps {
    action?: string;
}

export default function Navigation({ action }: NavigationProps) {
    const { isLoggedIn, user, logout, isLoading } = useAuth();

    const username = user
        ? `${user.firstname} ${user.lastname}`
        : undefined;

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    return (
        <header>
            <Link to="/" className="navigation-brand">
                <span className="material-symbols-outlined">
                    how_to_vote
                </span>

                <div id="logo-text-wrapper">
                    <p>STUDENT ELECTION</p>
                    <p>VOTE '26</p>
                </div>
            </Link>

            <nav>
                {action === "VOTE" && (
                    <>
                        <Link to="/#elections">Elections</Link>
                        <Link to="/#schedule">Schedule</Link>
                        <Link to="/#how-to-vote">How to vote</Link>
                        <Link to="/#faq">FAQ</Link>

                        <Link to="/">
                            BACK
                            <span className="material-symbols-outlined">
                                arrow_back
                            </span>
                        </Link>
                    </>
                )}

                {action === "DASHBOARD" && (
                    <>
                        <a href="#elections">Elections</a>
                        <a href="#schedule">Schedule</a>
                        <a href="#how-to-vote">How to vote</a>
                        <a href="#faq">FAQ</a>

                        {isLoading ? (
                            <span>Loading...</span>
                        ) : isLoggedIn ? (
                            <>
                                <span>{username ?? "My Account"}</span>

                                <button
                                    type="button"
                                    onClick={handleLogout}
                                >
                                    LOGOUT
                                </button>
                            </>
                        ) : (
                            <Link to="/auth/login">
                                LOGIN
                                <span className="material-symbols-outlined">
                                    arrow_forward
                                </span>
                            </Link>
                        )}
                    </>
                )}

                {action === "LOGIN" && (
                    <Link to="/">
                        BACK
                        <span className="material-symbols-outlined">
                            arrow_back
                        </span>
                    </Link>
                )}
            </nav>
        </header>
    );
}
