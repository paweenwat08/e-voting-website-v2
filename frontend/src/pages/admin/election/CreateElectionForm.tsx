import { useState } from "react";
import { createElection } from "../../../services/electionService";

interface Props {
    onSuccess: () => Promise<void>;
}

export default function CreateElectionForm({ onSuccess }: Props) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [startAt, setStartAt] = useState("");
    const [endAt, setEndAt] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    async function handleSubmit(
        e: React.FormEvent<HTMLFormElement>
    ) {
        e.preventDefault();
        setError("");
        setSuccess("");

        const startDate = new Date(startAt);
        const endDate = new Date(endAt);

        if (
            Number.isNaN(startDate.getTime()) ||
            Number.isNaN(endDate.getTime())
        ) {
            setError("Please enter valid dates and times.");
            return;
        }

        if (startDate >= endDate) {
            setError("Start time must be before end time.");
            return;
        }

        try {
            setLoading(true);

            await createElection({
                title: title.trim(),
                description: description.trim(),
                startAt: startDate.toISOString(),
                endAt: endDate.toISOString(),
            });

            setTitle("");
            setDescription("");
            setStartAt("");
            setEndAt("");
            setSuccess("Election created successfully.");

            await onSuccess();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to create election."
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <form
            className="admin-create-form"
            onSubmit={handleSubmit}
        >
            <h2>Create Election</h2>

            <label htmlFor="election-title">Election title</label>
            <input
                id="election-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={200}
                required
            />

            <label htmlFor="election-description">Description</label>
            <textarea
                id="election-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
            />

            <label htmlFor="election-start">Start date and time</label>
            <input
                id="election-start"
                type="datetime-local"
                value={startAt}
                onChange={(e) => setStartAt(e.target.value)}
                required
            />

            <label htmlFor="election-end">End date and time</label>
            <input
                id="election-end"
                type="datetime-local"
                value={endAt}
                onChange={(e) => setEndAt(e.target.value)}
                required
            />

            {error && <p role="alert">{error}</p>}
            {success && <p role="status">{success}</p>}

            <button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Election"}
            </button>
        </form>
    );
}