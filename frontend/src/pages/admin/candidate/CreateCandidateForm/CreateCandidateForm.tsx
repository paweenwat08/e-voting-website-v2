
import { useState } from "react";
import { createCandidate } from "../../../../services/candidateService";
import "./CreateCandidateForm.css";

interface Props {
    onSuccess: () => void;
}

export default function CreateCandidateForm({ onSuccess }: Props) {
    const [userId, setuserId] = useState("");
    const [electionId, setElectionId] = useState("");
    const [candidateNumber, setCandidateNumber] = useState("");
    const [description, setDescription] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    async function handleSubmit(
        e: React.FormEvent<HTMLFormElement>
    ) {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (
            !userId.trim() ||
            !electionId.trim() ||
            !candidateNumber.trim()
        ) {
            setError(
                "user ID, Election ID and Candidate Number are required."
            );
            return;
        }

        try {
            setLoading(true);

            await createCandidate({
                userId: userId.trim(),
                electionId: electionId.trim(),
                candidateNumber: candidateNumber.trim(),
                description: description.trim() || null,
            });

            setuserId("");
            setElectionId("");
            setCandidateNumber("");
            setDescription("");
            setSuccess("Candidate created successfully.");

            await onSuccess();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to create candidate."
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <form
            className="create-candidate-form"
            onSubmit={handleSubmit}
        >
            <h2>Create Candidate</h2>

            <label htmlFor="candidate-user">
                User ID
            </label>
            <input
                id="candidate-user"
                value={userId}
                onChange={(e) => setuserId(e.target.value)}
                required
            />

            <label htmlFor="candidate-election">
                Election ID
            </label>
            <input
                id="candidate-election"
                value={electionId}
                onChange={(e) => setElectionId(e.target.value)}
                required
            />

            <label htmlFor="candidate-number">
                Candidate Number
            </label>
            <input
                id="candidate-number"
                value={candidateNumber}
                onChange={(e) => setCandidateNumber(e.target.value)}
                required
            />

            <label htmlFor="candidate-description">
                Description (optional)
            </label>
            <textarea
                id="candidate-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
            />

            {error && <p role="alert">{error}</p>}
            {success && <p role="status">{success}</p>}

            <button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Candidate"}
            </button>
        </form>
    );
}