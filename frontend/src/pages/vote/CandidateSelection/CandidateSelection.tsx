import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import { getElectionById } from "../../../services/electionService";
import { getMyVoterEligibilities } from "../../../services/VoterEligibility";
import { getCandidatesByElection } from "../../../services/candidateService";
import type { Candidate } from "../../../types/Candidate";
import "./CandidateSelection.css";

export default function CandidateSelection() {
    const { electionId } = useParams();
    const navigate = useNavigate();
    const { isLoggedIn, isLoading: isAuthLoading } = useAuth();

    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [selectedCandidateId, setSelectedCandidateId] =
        useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [electionMessage, setElectionMessage] = useState("");
    const [checkingEligibility, setCheckingEligibility] = useState(false);

    useEffect(() => {
        let cancelled = false;

        async function loadCandidates() {
            setLoading(true);
            setError("");
            setElectionMessage("");
            setCandidates([]);
            setSelectedCandidateId(null);

            if (!electionId || !/^[1-9]\d*$/.test(electionId)) {
                setError("Invalid election ID.");
                setLoading(false);
                return;
            }

            try {
                // Check election status first.
                const election = await getElectionById(electionId);

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

                // The user must be logged in before checking eligibility.
                if (isAuthLoading) return;

                if (!isLoggedIn) {
                    setElectionMessage(
                        "Please log in before voting in this election."
                    );
                    return;
                }

                // Check whether this user is eligible for this election.
                setCheckingEligibility(true);

                const eligibilities = await getMyVoterEligibilities();

                if (cancelled) return;

                const isEligible = eligibilities.some(
                    (item) =>
                        String(item.election_id) === String(election.id)
                );

                if (!isEligible) {
                    setElectionMessage(
                        "You are not eligible to vote in this election."
                    );
                    return;
                }

                // Load candidates only after eligibility is confirmed.
                const data = await getCandidatesByElection(electionId);

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
                    setCheckingEligibility(false);
                }
            }
        }

        if (isAuthLoading) {
            setLoading(true);
            return;
        }

        void loadCandidates();

        return () => {
            cancelled = true;
        };
    }, [electionId, isLoggedIn, isAuthLoading]);

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

    if (loading || isAuthLoading) {
        return (
            <main className="candidate-selection">
                <div
                    className="candidate-selection__message"
                    role="status"
                >
                    {checkingEligibility
                        ? "Checking your voting eligibility..."
                        : "Checking election status..."}
                </div>
            </main>
        );
    }

    if (electionMessage) {
        const heading = electionMessage.includes("draft")
            ? "Election Draft"
            : electionMessage.includes("not opened")
              ? "Election Not Open Yet"
              : electionMessage.includes("ended")
                ? "Election Closed"
                : electionMessage.includes("not eligible")
                  ? "Not Eligible to Vote"
                  : electionMessage.includes("log in")
                    ? "Login Required"
                    : "Voting Unavailable";

        return (
            <main className="candidate-selection">
                <header className="candidate-selection__header">
                    <p className="candidate-selection__eyebrow">
                        Election
                    </p>

                    <h1>{heading}</h1>

                    <p className="candidate-selection__subtitle">
                        {electionMessage}
                    </p>
                </header>

                <div className="candidate-selection__actions">
                    {electionMessage.includes("log in") ? (
                        <button
                            type="button"
                            className="candidate-selection__continue"
                            onClick={() =>
                                navigate(
                                    `/auth/login?redirect=${encodeURIComponent(
                                        `/vote/${electionId}`
                                    )}`
                                )
                            }
                        >
                            Log In
                        </button>
                    ) : (
                        <button
                            type="button"
                            className="candidate-selection__continue"
                            onClick={() => navigate("/")}
                        >
                            Back to Home
                        </button>
                    )}
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