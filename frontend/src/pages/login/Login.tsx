
import { useState } from "react";
import {
    Link,
    useNavigate,
    useSearchParams,
} from "react-router-dom";

import Navigation from "../../components/Navigation/Navigation";
import "./Login.css";

export default function Login() {
    const [userId, setUserId] = useState("");
    const [password, setPassword] = useState("");

    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const redirect = searchParams.get("redirect") || "/";

    const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        navigate(redirect);
    };


    const characters = [
        "/images/characters/character-1.png",
        "/images/characters/character-2.png",
        "/images/characters/character-3.png",
        "/images/characters/character-4.png",
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
                {/* Character Section */}

                <section
                    className="login-visual"
                    aria-label="Student election illustration"
                >
                    <img
                        src={character}
                        alt="Student election character"
                    />
                </section>


                {/* Login Section */}
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

                            <button
                                className="login-submit"
                                type="submit"
                            >
                                <span>LOGIN</span>

                                <span
                                    className="material-symbols-outlined"
                                    aria-hidden="true"
                                >
                                    arrow_forward
                                </span>
                            </button>
                        </form>

                        <p className="login-register">
                            Don't have an account?{" "}
                            <Link to="/registry">
                                Register
                            </Link>
                        </p>
                    </div>
                </section>
            </main>
        </>
    );
}
