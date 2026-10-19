import { useEffect, useState } from "react";
import { getAllCandidates } from "../../../../services/candidateService";
import type { Candidate } from "../../../../types/Candidate";

interface Props {
    refreshKey: number;
}

export default function CandidateManagement({
    refreshKey,
}: Props) {
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;

        async function loadCandidates() {
            try {
                setIsLoading(true);
                setError("");

                const data = await getAllCandidates();

                if (!cancelled) {
                    setCandidates(data);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(
                        err instanceof Error
                            ? err.message
                            : "Failed to load candidates."
                    );
                }
            } finally {
                if (!cancelled) {
                    setIsLoading(false);
                }
            }
        }

        void loadCandidates();

        return () => {
            cancelled = true;
        };
    }, [refreshKey]);

    if (isLoading) {
        return <p role="status">Loading candidates...</p>;
    }

    if (error) {
        return <p role="alert">{error}</p>;
    }

    return (
        <section className="admin-section">
            <h2>Candidate Management</h2>

            {candidates.length === 0 ? (
                <p>No candidates found.</p>
            ) : (
                <div className="candidate-list">
                    {candidates.map((candidate) => (
                        <article
                            className="candidate-card"
                            key={candidate.id}
                        >
                            <p>
                                Candidate number:{" "}
                                {candidate.candidate_number}
                            </p>

                            {candidate.description && (
                                <p>{candidate.description}</p>
                            )}
                        </article>
                    ))}
                </div>
            )}
        </section>
    );
}