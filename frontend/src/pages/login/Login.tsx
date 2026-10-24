import { useAuth } from "../../contexts/AuthContext";
import { useState } from "react";
import {
    useNavigate,
    useSearchParams,
} from "react-router-dom";

import { userLogin } from "../../services/authService";

import Navigation from "../../components/Navigation/Navigation";
import "./Login.css";

export default function Login() {
    const [userId, setUserId] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const { refreshUser } = useAuth();

    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const redirect = searchParams.get("redirect") || "/";

    const handleSubmit = async (
        e: React.FormEvent<HTMLFormElement>
    ) => {
        e.preventDefault();

        setError("");
        setIsLoading(true);

        try {
            const success = await userLogin(userId, password);

            if (!success) {
                setError("Login failed. Please try again.");
                return;
            }

            await refreshUser();
            navigate(redirect);
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Unable to login. Please try again."
            );
        } finally {
            setIsLoading(false);
        }
    };

    const characters = [
        "/images/characters/character-1.svg",
        "/images/characters/character-2.svg",
        "/images/characters/character-3.svg",
        "/images/characters/character-4.svg",
    ];

    const [character] = useState(() => {
        const randomIndex = Math.floor(
            Math.random() * characters.length
        );

        return characters[randomIndex];
    });

    return (
        <>
            <Navigation action="LOGIN" />

            <main className="login-page">
                <section
                    className="login-visual"
                    aria-label="Student election illustration"
                >
                    <img
                        src={character}
                        alt="Student election character"
                    />
                </section>

                <section className="login-form-section">
                    <div className="login-card">
                        <h1>USER LOGIN</h1>

                        <form onSubmit={handleSubmit}>
                            <div className="login-field">
                                <label htmlFor="userId">
                                    User ID
                                </label>

                                <input
                                    id="userId"
                                    name="userId"
                                    type="text"
                                    value={userId}
                                    onChange={(e) =>
                                        setUserId(e.target.value)
                                    }
                                    placeholder="Enter your user ID"
                                    autoComplete="username"
                                    required
                                />
                            </div>

                            <div className="login-field">
                                <label htmlFor="password">
                                    Password
                                </label>

                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    placeholder="Enter your password"
                                    autoComplete="current-password"
                                    required
                                />
                            </div>

                            {error && (
                                <p role="alert" aria-live="polite">
                                    {error}
                                </p>
                            )}

                            <button
                                className="login-submit"
                                type="submit"
                                disabled={isLoading}
                            >
                                <span>
                                    {isLoading ? "LOGGING IN..." : "LOGIN"}
                                </span>

                                <span
                                    className="material-symbols-outlined"
                                    aria-hidden="true"
                                >
                                    arrow_forward
                                </span>
                            </button>
                        </form>
                    </div>
                </section>
            </main>
        </>
    );

}