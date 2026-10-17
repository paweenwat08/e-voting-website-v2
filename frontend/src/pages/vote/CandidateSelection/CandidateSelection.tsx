import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    getCandidatesByElection,
    type Candidate,
} from '../../../services/candidateService';
import './CandidateSelection.css';

export default function CandidateSelection() {
    const { electionId } = useParams();
    const navigate = useNavigate();

    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
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
        <main className="candidate-selection">
            <header className="candidate-selection__header">
                <p className="candidate-selection__eyebrow">Election</p>
                <h1>Select Your Candidate</h1>
                <p className="candidate-selection__subtitle">Choose one candidate to continue.</p>
            </header>

            {loading && (
                <div className="candidate-selection__message">
                    Loading candidates...
                </div>
            )}

            {!loading && error && (
                <div className="candidate-selection__message candidate-selection__error">
                    <p role="alert">{error}</p>
                    <button
                        type="button"
                        className="candidate-selection__retry"
                        onClick={() => window.location.reload()}
                    >
                        Retry
                    </button>
                </div>
            )}

            {!loading && !error && candidates.length === 0 && (
                <div className="candidate-selection__message">
                    No candidates available for this election.
                </div>
            )}

            {!loading && !error && candidates.length > 0 && (
                <>
                    <div className="candidate-selection__list">
                        {candidates.map((candidate) => {
                            const candidateId = String(candidate.id);
                            const isSelected = selectedCandidateId === candidateId;

                            return (
                                <button
                                    key={candidateId}
                                    type="button"
                                    aria-pressed={isSelected}
                                    className={`candidate-card ${
                                        isSelected ? "candidate-card--selected" : ""
                                    }`}
                                    onClick={() => {
                                        setSelectedCandidateId(candidateId);
                                        setError("");
                                    }}
                                >
                                    <span className="candidate-card__number">
                                        #{candidate.candidate_number}
                                    </span>

                                    <h2 className="candidate-card__name">
                                        {candidate.firstname}{" "}
                                        {candidate.lastname}
                                    </h2>

                                    <p className="candidate-card__description">
                                        {candidate.description ||
                                            "No description available."}
                                    </p>

                                    {isSelected && (
                                        <span className="candidate-card__selected-label">
                                            Selected
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    <div className="candidate-selection__actions">
                        <button
                            type="button"
                            className="candidate-selection__continue"
                            onClick={handleContinue}
                            disabled={selectedCandidateId === null}
                        >
                            Continue
                        </button>
                    </div>
                </>
            )}
        </main>
    );
}