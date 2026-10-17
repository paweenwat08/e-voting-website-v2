import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getElectionById } from "../../../services/electionService";
import {
    getCandidatesByElection,
    type Candidate,
} from "../../../services/candidateService";
import "./CandidateSelection.css";

export default function CandidateSelection() {
    const { electionId } = useParams();
    const navigate = useNavigate();

    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [selectedCandidateId, setSelectedCandidateId] =
        useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [electionMessage, setElectionMessage] = useState("");

    useEffect(() => {
        if (!electionId || !/^\d+$/.test(electionId)) {
            setError("Invalid election ID.");
            setLoading(false);
            return;
        }

        let cancelled = false;

        async function loadCandidates() {
            try {
                setLoading(true);
                setError("");
                setElectionMessage("");
                setCandidates([]);
                setSelectedCandidateId(null);

                // Check election status before loading candidates.
                const election = await getElectionById(
                    Number(electionId)
                );

                if (cancelled) return;

                switch (election.status) {
                    case "draft":
                        setElectionMessage(
                            "This election is still a draft and is not available for voting."
                        );
                        return;

                    case "scheduled":
                        setElectionMessage(
                            "This election has not opened yet."
                        );
                        return;

                    case "closed":
                        setElectionMessage(
                            "This election has ended and is no longer accepting votes."
                        );
                        return;

                    case "open":
                        break;

                    default:
                        setElectionMessage(
                            "This election is not available for voting."
                        );
                        return;
                }

                const data = await getCandidatesByElection(
                    electionId!
                );

                if (cancelled) return;

                setCandidates(data);
            } catch (err) {
                if (cancelled) return;

                setError(
                    err instanceof Error
                        ? err.message
                        : "Failed to load candidates."
                );
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
            (candidate) =>
                String(candidate.id) === selectedCandidateId
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

    if (loading) {
        return (
            <main className="candidate-selection">
                <div className="candidate-selection__message">
                    Checking election status...
                </div>
            </main>
        );
    }

    if (electionMessage) {
        return (
            <main className="candidate-selection">
                <header className="candidate-selection__header">
                    <p className="candidate-selection__eyebrow">
                        Election
                    </p>

                    <h1>
                        {electionMessage.includes("draft")
                            ? "Election Draft"
                            : electionMessage.includes("not opened")
                              ? "Election Not Open Yet"
                              : electionMessage.includes("ended")
                                ? "Election Closed"
                                : "Voting Unavailable"}
                    </h1>

                    <p className="candidate-selection__subtitle">
                        {electionMessage}
                    </p>
                </header>

                <div className="candidate-selection__actions">
                    <button
                        type="button"
                        className="candidate-selection__continue"
                        onClick={() => navigate("/")}
                    >
                        Back to Home
                    </button>
                </div>
            </main>
        );
    }

    if (error) {
        return (
            <main className="candidate-selection">
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
            </main>
        );
    }

    return (
        <main className="candidate-selection">
            <header className="candidate-selection__header">
                <p className="candidate-selection__eyebrow">
                    Election
                </p>

                <h1>Select Your Candidate</h1>

                <p className="candidate-selection__subtitle">
                    Choose one candidate to continue.
                </p>
            </header>

            {candidates.length === 0 ? (
                <div className="candidate-selection__message">
                    No candidates available for this election.
                </div>
            ) : (
                <>
                    <div className="candidate-selection__list">
                        {candidates.map((candidate) => {
                            const candidateId = String(candidate.id);
                            const isSelected =
                                selectedCandidateId === candidateId;

                            return (
                                <button
                                    key={candidateId}
                                    type="button"
                                    aria-pressed={isSelected}
                                    className={`candidate-card ${
                                        isSelected
                                            ? "candidate-card--selected"
                                            : ""
                                    }`}
                                    onClick={() => {
                                        setSelectedCandidateId(
                                            candidateId
                                        );
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