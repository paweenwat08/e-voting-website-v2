
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    getCandidatesByElection,
    type Candidate,
} from '../../../services/candidateService'
import './CandidateSelection.css'

export default function CandidateSelection() {
    const { electionId } = useParams();
    const navigate = useNavigate();

    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [selectedCandidateId, setSelectedCandidateId] =
        useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!electionId) {
            setError("Invalid election ID.");
            setLoading(false);
            return;
        }

        let cancelled = false;

        async function loadCandidates() {
            try {
                setLoading(true);
                setError("");

                const data = await getCandidatesByElection(electionId!);

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
                    setLoading(false);
                }
            }
        }

        void loadCandidates();

        return () => {
            cancelled = true;
        };
    }, [electionId]);

    const handleContinue = () => {
        if (!electionId || selectedCandidateId === null) {
            return;
        }

        const selectedCandidate = candidates.find(
            (candidate) => String(candidate.id) === selectedCandidateId
        );

        if (!selectedCandidate) {
            setError("Please select a valid candidate.");
            return;
        }

        navigate(`/vote/${electionId}/confirm`, {
            state: {
                candidateId: String(selectedCandidate.id),
                candidate: selectedCandidate,
            },
        });
    };

    return (
        <main>
            <section>
                <p>Election</p>
                <h1>Select Your Candidate</h1>
                <p>Choose one candidate to continue.</p>
            </section>

            {loading && <p>Loading candidates...</p>}

            {!loading && error && (
                <section>
                    <p role="alert">{error}</p>
                    <button
                        type="button"
                        onClick={() => window.location.reload()}
                    >
                        Retry
                    </button>
                </section>
            )}

            {!loading && !error && candidates.length === 0 && (
                <p>No candidates available for this election.</p>
            )}

            {!loading && !error && candidates.length > 0 && (
                <>
                    <section>
                        {candidates.map((candidate) => {
                            const candidateId = String(candidate.id);
                            const isSelected =
                                selectedCandidateId === candidateId;

                            return (
                                <button
                                    key={candidateId}
                                    type="button"
                                    aria-pressed={isSelected}
                                    onClick={() => {
                                        setSelectedCandidateId(candidateId);
                                        setError("");
                                    }}
                                >
                                    <strong>
                                        #{candidate.candidate_number}
                                    </strong>

                                    <h2>
                                        {candidate.firstname}{" "}
                                        {candidate.lastname}
                                    </h2>

                                    <p>
                                        {candidate.description ||
                                            "No description available."}
                                    </p>

                                    {isSelected && (
                                        <span>Selected</span>
                                    )}
                                </button>
                            );
                        })}
                    </section>

                    <button
                        type="button"
                        onClick={handleContinue}
                        disabled={selectedCandidateId === null}
                    >
                        Continue
                    </button>
                </>
            )}
        </main>
    );
}
