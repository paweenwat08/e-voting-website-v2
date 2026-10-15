import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    getAllElections,
    type Election,
} from "../../../services/electionService";
import type { EligibleElection } from "../../../services/VoterEligibility";
import "./ElectionList.css";

interface ElectionListProps {
    elections?: EligibleElection[];
    loading?: boolean;
    error?: string | null;
}

export default function ElectionList(props: ElectionListProps) {
    const [allElections, setAllElections] = useState<Election[]>([]);
    const [loadingAll, setLoadingAll] = useState(true);
    const [errorAll, setErrorAll] = useState<string | null>(null);

    const usesProvidedElections = props.elections !== undefined;

    useEffect(() => {
        if (usesProvidedElections) return;

        let cancelled = false;

        async function fetchElections() {
            try {
                setLoadingAll(true);
                setErrorAll(null);

                const data = await getAllElections();

                if (!cancelled) {
                    setAllElections(data);
                }
            } catch (err) {
                if (!cancelled) {
                    setErrorAll(
                        err instanceof Error
                            ? err.message
                            : "Failed to load elections."
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoadingAll(false);
                }
            }
        }

        void fetchElections();

        return () => {
            cancelled = true;
        };
    }, [usesProvidedElections]);

    const items = usesProvidedElections
        ? props.elections!.map((election) => ({
            id: election.election_id,
            title: election.title,
            description: election.description,
            status: election.election_status,
        }))
        : allElections.map((election) => ({
            id: String(election.id),
            title: election.title,
            description: election.description,
            status: election.status,
        }));

    const loading = usesProvidedElections
        ? props.loading ?? false
        : loadingAll;

    const error = usesProvidedElections
        ? props.error ?? null
        : errorAll;

    return (
        <section id="elections">
            {loading && <p role="status">Loading elections...</p>}

            {!loading && error && (
                <p role="alert">
                    Unable to load elections: {error}
                </p>
            )}

            {!loading && !error && items.length === 0 && (
                <p>No elections available.</p>
            )}

            {!loading && !error && items.length > 0 && (
                <div className="election-grid">
                    {items.map((election) => (
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