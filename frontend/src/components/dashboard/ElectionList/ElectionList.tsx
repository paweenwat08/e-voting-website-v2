
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    getAllElections,
    type Election,
} from "../../../services/electionService";
import "./ElectionList.css";

export default function ElectionList() {
    const [elections, setElections] = useState<Election[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        async function fetchElections() {
            try {
                setLoading(true);
                setError(null);

                const data = await getAllElections();

                if (!cancelled) {
                    setElections(data);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(
                        err instanceof Error
                            ? err.message
                            : "Failed to load elections."
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        void fetchElections();

        return () => {
            cancelled = true;
        };
    }, []);

    return (
        <section id="elections">
            {loading && <p role="status">Loading elections...</p>}

            {!loading && error && (
                <p role="alert">
                    Unable to load elections: {error}
                </p>
            )}

            {!loading && !error && elections.length === 0 && (
                <p>No elections available.</p>
            )}

            {!loading && !error && elections.length > 0 && (
                <div className="election-grid">
                    {elections.map((election) => (
                        <article
                            className="election-card"
                            key={election.id}
                        >
                            <Link
                                to={`/elections/${election.id}`}
                                className="election-poster"
                                aria-label={`View ${election.title}`}
                            >
                                <img
                                    src="/images/elections/default-poster.png"
                                    alt={`${election.title} poster`}
                                />
                            </Link>

                            <div className="election-card-content">
                                <h3 title={election.title}>
                                    {election.title}
                                </h3>

                                <p className="election-description">
                                    {election.description}
                                </p>

                                <p
                                    className={`election-status status-${election.status}`}
                                >
                                    {election.status.toUpperCase()}
                                </p>

                                <Link
                                    to={`/elections/${election.id}`}
                                    className="election-view-link"
                                >
                                    VIEW ↗
                                </Link>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </section>
    );
}
