
import { useEffect, useState } from "react";
import {
    Link,
    useNavigate,
    useParams,
} from "react-router-dom";

import { useAuth } from "../../contexts/AuthContext";
import Navigation from "../../components/Navigation/Navigation";

import { getElectionById } from "../../services/electionService";
import {
    updateElection,
    openElection,
    closeElection,
} from "../../services/electionService";

import type { Election } from "../../types/Election";

import './ElectionEdit.css'

export default function AdminElectionEdit() {
    const { electionId } = useParams<{ electionId: string }>();
    const navigate = useNavigate();
    const { user, isLoading: authLoading } = useAuth();

    const [election, setElection] = useState<Election | null>(null);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [startAt, setStartAt] = useState("");
    const [endAt, setEndAt] = useState("");

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        if (authLoading) return;

        if (!user || user.role !== "admin") {
            setIsLoading(false);
            return;
        }

        if (!electionId || !/^\d+$/.test(electionId)) {
            setError("Invalid election ID");
            setIsLoading(false);
            return;
        }

        let cancelled = false;

        async function loadElection() {
            try {
                setIsLoading(true);
                setError("");

                const data = await getElectionById(Number(electionId));

                if (cancelled) return;

                setElection(data);
                setTitle(data.title);
                setDescription(data.description ?? "");
                setStartAt(toDateTimeLocal(data.startAt));
                setEndAt(toDateTimeLocal(data.endAt));
            } catch (err) {
                if (cancelled) return;

                setError(
                    err instanceof Error
                        ? err.message === "NOT_FOUND"
                            ? "Election not found"
                            : err.message
                        : "Failed to load election"
                );
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        }

        void loadElection();

        return () => {
            cancelled = true;
        };
    }, [authLoading, user, electionId]);

    function toDateTimeLocal(value: string): string {
        const date = new Date(value);

        if (Number.isNaN(date.getTime())) return "";

        const timezoneOffset = date.getTimezoneOffset() * 60_000;

        return new Date(date.getTime() - timezoneOffset)
            .toISOString()
            .slice(0, 16);
    }

    function validateForm(): boolean {
        if (!title.trim()) {
            setError("Please enter an election title");
            return false;
        }

        if (!startAt || !endAt) {
            setError("Please enter the start and end dates");
            return false;
        }

        if (new Date(startAt) >= new Date(endAt)) {
            setError("The end date must be after the start date");
            return false;
        }

        return true;
    }

    async function handleSave(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!election || !electionId || !validateForm()) return;

        try {
            setIsSaving(true);
            setError("");
            setSuccess("");

            const updated = await updateElection(Number(electionId), {
                title: title.trim(),
                description: description.trim(),
                startAt: new Date(startAt).toISOString(),
                endAt: new Date(endAt).toISOString(),
            });

            setElection((previous) =>
                previous
                    ? {
                          ...previous,
                          ...updated,
                      }
                    : updated
            );

            setSuccess("Election updated successfully");
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to update election"
            );
        } finally {
            setIsSaving(false);
        }
    }

    async function handleOpenElection() {
        if (!election || !electionId) return;

        if (!window.confirm("Are you sure you want to open voting?")) return;

        try {
            setIsSaving(true);
            setError("");
            setSuccess("");

            await openElection(Number(electionId));

            const refreshed = await getElectionById(Number(electionId));
            setElection(refreshed);
            setSuccess("Voting opened successfully");
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to open voting"
            );
        } finally {
            setIsSaving(false);
        }
    }

    async function handleCloseElection() {
        if (!election || !electionId) return;

        if (!window.confirm("Are you sure you want to close voting?")) return;

        try {
            setIsSaving(true);
            setError("");
            setSuccess("");

            await closeElection(Number(electionId));

            const refreshed = await getElectionById(Number(electionId));
            setElection(refreshed);
            setSuccess("Voting closed successfully");
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to close voting"
            );
        } finally {
            setIsSaving(false);
        }
    }

    if (authLoading || isLoading) {
        return (
            <>
                <Navigation action="DASHBOARD" />
                <main className="admin-election-edit">
                    <p>Loading election...</p>
                </main>
            </>
        );
    }

    if (!user || user.role !== "admin") {
        return (
            <>
                <Navigation action="DASHBOARD" />
                <main className="admin-election-edit">
                    <h1>Access denied</h1>
                    <p>Administrator access is required.</p>
                    <Link to="/">Back to home</Link>
                </main>
            </>
        );
    }

    if (!election) {
        return (
            <>
                <Navigation action="DASHBOARD" />
                <main className="admin-election-edit">
                    <h1>Election unavailable</h1>
                    {error && <p role="alert">{error}</p>}
                    <button onClick={() => navigate("/admin")}>
                        Back to dashboard
                    </button>
                </main>
            </>
        );
    }

    return (
        <>
            <Navigation action="DASHBOARD" />

            <main className="admin-election-edit">
                <header className="admin-election-edit__header">
                    <div>
                        <Link to="/admin">
                            ← Back to dashboard
                        </Link>
                        <h1>Edit election</h1>
                        <p>Election ID: {election.id}</p>
                    </div>

                    <span
                        className={`admin-election-edit__status admin-election-edit__status--${election.status}`}
                    >
                        {election.status}
                    </span>
                </header>

                {error && (
                    <p className="admin-election-edit__message admin-election-edit__message--error" role="alert">
                        {error}
                    </p>
                )}

                {success && (
                    <p className="admin-election-edit__message admin-election-edit__message--success" role="status">
                        {success}
                    </p>
                )}

                <form
                    className="admin-election-edit__form"
                    onSubmit={handleSave}
                >
                    <label htmlFor="title">Election title</label>
                    <input
                        id="title"
                        type="text"
                        value={title}
                        onChange={(event) => setTitle(event.target.value)}
                        required
                        maxLength={200}
                        disabled={isSaving}
                    />

                    <label htmlFor="description">Description</label>
                    <textarea
                        id="description"
                        value={description}
                        onChange={(event) => setDescription(event.target.value)}
                        rows={4}
                        disabled={isSaving}
                    />

                    <label htmlFor="startAt">Start date and time</label>
                    <input
                        id="startAt"
                        type="datetime-local"
                        value={startAt}
                        onChange={(event) => setStartAt(event.target.value)}
                        required
                        disabled={isSaving}
                    />

                    <label htmlFor="endAt">End date and time</label>
                    <input
                        id="endAt"
                        type="datetime-local"
                        value={endAt}
                        onChange={(event) => setEndAt(event.target.value)}
                        required
                        disabled={isSaving}
                    />

                    <button type="submit" disabled={isSaving}>
                        {isSaving ? "Saving..." : "Save changes"}
                    </button>
                </form>

                <section className="admin-election-edit__actions">
                    <h2>Voting controls</h2>

                    {election.status === "draft" ||
                    election.status === "scheduled" ? (
                        <button
                            type="button"
                            onClick={handleOpenElection}
                            disabled={isSaving}
                        >
                            Open voting
                        </button>
                    ) : null}

                    {election.status === "open" && (
                        <button
                            type="button"
                            onClick={handleCloseElection}
                            disabled={isSaving}
                        >
                            Close voting
                        </button>
                    )}
                </section>
            </main>
        </>
    );
}
