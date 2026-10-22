
import { useCallback, useEffect, useState } from "react";
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

    const loadCandidates = useCallback(async () => {
        setIsLoading(true);
        setError("");

        try {
            const data = await getAllCandidates();
            setCandidates(data);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to load candidates."
            );
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadCandidates();
    }, [loadCandidates, refreshKey]);

    return (
        <section className="admin-section">
            <div className="admin-section-heading">
                <div>
                    <h2>Candidate Management</h2>
                    <p>
                        Review candidates and the elections they belong to.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => void loadCandidates()}
                    disabled={isLoading}
                >
                    Refresh
                </button>
            </div>

            {isLoading && (
                <p role="status">Loading candidates...</p>
            )}

            {!isLoading && error && (
                <p role="alert">
                    Unable to load candidates: {error}
                </p>
            )}

            {!isLoading && !error && candidates.length === 0 && (
                <p>No candidates found.</p>
            )}

            {!isLoading && !error && candidates.length > 0 && (
                <div className="admin-table-wrapper">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Candidate</th>
                                <th>Candidate ID</th>
                                <th>Election</th>
                                <th>Election ID</th>
                                <th>Candidate Number</th>
                            </tr>
                        </thead>

                        <tbody>
                            {candidates.map((candidate) => (
                                <tr key={candidate.id}>
                                    <td>
                                        <strong>
                                            {candidate.firstname} {candidate.lastname}
                                        </strong>
                                    </td>

                                    <td>
                                        <strong>
                                            {candidate.id}
                                        </strong>
                                    </td>

                                    <td>
                                        <strong>{candidate.election_title}</strong>
                                    </td>

                                    <td>
                                        <strong>{candidate.election_id}</strong>
                                    </td>

                                    <td>{candidate.candidate_number}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    );
}
