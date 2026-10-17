
import { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
    castVote,
    type Candidate,
} from "../../../services/candidateService";
import './VoteConfirmation.css'

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

    if (!electionId || !isValidCandidate) {
        return (
            <main>
                <h1>Invalid Vote</h1>
                <p>Please select a candidate before confirming your vote.</p>

                <button
                    type="button"
                    onClick={() => navigate(`/vote/${electionId ?? ""}`)}
                >
                    Back to Candidate Selection
                </button>
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
        <main>
            <section>
                <p>Vote Confirmation</p>

                <h1>Confirm Your Vote</h1>

                <p>
                    Please review your selection before submitting your ballot.
                </p>
            </section>

            <section>
                <p>Candidate #{candidate.candidate_number}</p>

                <h2>
                    {candidate.firstname} {candidate.lastname}
                </h2>

                <p>
                    {candidate.description || "No description available."}
                </p>
            </section>

            <section>
                <p>
                    Once your vote is submitted, you cannot change your selection.
                </p>

                {error && <p role="alert">{error}</p>}

                <button
                    type="button"
                    onClick={() => navigate(`/vote/${electionId}`)}
                    disabled={submitting}
                >
                    Go Back
                </button>

                <button
                    type="button"
                    onClick={handleConfirm}
                    disabled={submitting}
                >
                    {submitting ? "Submitting Vote..." : "Confirm Vote"}
                </button>
            </section>
        </main>
    );
}
