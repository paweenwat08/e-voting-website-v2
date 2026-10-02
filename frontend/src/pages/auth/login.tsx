import { useEffect, useState } from "react";
import "./Login.css";

const electionImages = [
    "/images/election-1.jpg",
    "/images/election-2.jpg",
    "/images/election-3.jpg",
    "/images/election-4.jpg",
];

function Login() {
    const [randomImage, setRandomImage] = useState("");

    useEffect(() => {
        const randomIndex = Math.floor(
            Math.random() * electionImages.length
        );

        setRandomImage(electionImages[randomIndex]);
    }, []);

    const handleLogin = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        // TODO: connect to backend
        console.log("Login");
    };

    return (
        <div className="login-page">
            {/* Navbar */}
            <nav className="login-navbar">
                <div className="navbar-brand">
                    <div className="brand-icon">✓</div>

                    <div className="brand-text">
                        <span>HOGWARTS LEGACY</span>
                        <strong>SCHOOL ANNUAL VOTE 69</strong>
                    </div>
                </div>

                <button className="back-button">
                    BACK ↩
                </button>
            </nav>

            {/* Main */}
            <main className="login-main">

                {/* Left image */}
                <section className="login-image-section">
                    {randomImage && (
                        <img
                            src={randomImage}
                            alt="Election"
                            className="login-image"
                        />
                    )}

                    <div className="image-overlay" />
                </section>

                {/* Right login */}
                <section className="login-panel">
                    <div className="login-content">
                        <h1>USER LOGIN</h1>

                        <form
                            className="login-card"
                            onSubmit={handleLogin}
                        >
                            <input
                                type="text"
                                name="userId"
                                placeholder="user ID"
                                autoComplete="username"
                            />

                            <input
                                type="password"
                                name="password"
                                placeholder="password"
                                autoComplete="current-password"
                            />

                            <button
                                type="submit"
                                className="login-button"
                            >
                                LOGIN
                            </button>

                            <button
                                type="button"
                                className="create-account-button"
                            >
                                DON'T HAVE ACCOUNT ?
                            </button>
                        </form>
                    </div>
                </section>

            </main>
        </div>
    );
}

export default Login;