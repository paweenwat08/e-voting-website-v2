import { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { castVote } from "../../../services/votingService";
import type { Candidate } from "../../../types/Candidate";
import './VoteConfirmation.css';

interface VoteState {
    candidateId: string;
    candidate: Candidate;
}

export default function VoteConfirmation() {
    const { electionId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const state = location.state as VoteState | null;

    const candidate = state?.candidate;
    const candidateId = state?.candidateId;

    const isValidCandidate =
        candidate &&
        candidateId &&
        String(candidate.id) === String(candidateId);

    // หน้าแสดงผลเมื่อข้อมูลไม่ถูกต้อง (Invalid Vote State)
    if (!electionId || !isValidCandidate) {
        return (
            <main className="vote-confirmation__invalid">
                <h1>Invalid Vote</h1>
                <p>Please select a candidate before confirming your vote.</p>

                <div className="vote-confirmation__actions" style={{ justifyContent: "center" }}>
                    <button
                        type="button"
                        className="vote-confirmation__button vote-confirmation__button--back"
                        onClick={() => navigate(`/vote/${electionId ?? ""}`)}
                    >
                        Back to Candidate Selection
                    </button>
                </div>
            </main>
        );
    }

    const handleConfirm = async () => {
        if (submitting) return;

        try {
            setSubmitting(true);
            setError("");

            await castVote(electionId, String(candidateId));

            navigate("/");
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to submit your vote."
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <main className="vote-confirmation">
            {/* Header Section */}
            <header className="vote-confirmation__header">
                <p className="vote-confirmation__eyebrow">Vote Confirmation</p>
                <h1>Confirm Your Vote</h1>
                <p className="vote-confirmation__subtitle">
                    Please review your selection before submitting your ballot.
                </p>
            </header>

            {/* Candidate Card Summary */}
            <section className="vote-confirmation__card">
                <p className="vote-confirmation__card-label">You have selected:</p>
                <div className="vote-confirmation__candidate-number">
                    #{candidate.candidate_number}
                </div>

                <h2 className="vote-confirmation__candidate-name">
                    {candidate.firstname} {candidate.lastname}
                </h2>

                <p className="vote-confirmation__description">
                    {candidate.description || "No description available."}
                </p>
            </section>

            {/* Notice Block */}
            <div className="vote-confirmation__notice">
                <p>
                    ⚠️ Once your vote is submitted, you cannot change your selection.
                </p>
            </div>

            {/* Error Message */}
            {error && (
                <div className="vote-confirmation__error" role="alert">
                    {error}
                </div>
            )}

            {/* Action Buttons */}
            <div className="vote-confirmation__actions">
                <button
                    type="button"
                    className="vote-confirmation__button vote-confirmation__button--back"
                    onClick={() => navigate(`/vote/${electionId}`)}
                    disabled={submitting}
                >
                    Go Back
                </button>

                <button
                    type="button"
                    className="vote-confirmation__button vote-confirmation__button--confirm"
                    onClick={handleConfirm}
                    disabled={submitting}
                >
                    {submitting ? "Submitting Vote..." : "Confirm Vote"}
                </button>
            </div>
        </main>
    );
}