import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate, Link, useParams } from "react-router-dom";
import Navigation from "../../components/Navigation/Navigation";
import ResultsPodium from "../../components/elections/ResultsPodium/ResultsPodium";
import ElectionRules from "../../components/dashboard/ElectionRules/ElectionRules";
import Footer from "../../components/Footer/Footer";

import {
    getElectionById,
    type Election,
} from "../../services/electionService";
import type { Candidate } from "../../types/Candidate";
import { checkVoteStatus } from "../../services/votingService";

import "./ElectionDetail.css";

type ElectionWithCandidates = Election & {
    candidates: Candidate[];
};

export default function ElectionDetail() {
    const { electionId } = useParams();
    const navigate = useNavigate();
    const { isLoggedIn, isLoading: isAuthLoading } = useAuth();

    const [election, setElection] =
        useState<ElectionWithCandidates | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [hasVoted, setHasVoted] = useState(false);
    const [loadingVoteStatus, setLoadingVoteStatus] = useState(false);
    const [voteStatusError, setVoteStatusError] = useState<string | null>(
        null
    );

    useEffect(() => {
        let cancelled = false;

        async function loadElection() {
            if (!electionId || !/^[1-9]\d*$/.test(electionId)) {
                setError("NOT_FOUND");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);

                const data = await getElectionById(electionId);

                if (!cancelled) {
                    setElection(data);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(
                        err instanceof Error ? err.message : "UNKNOWN"
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        void loadElection();

        return () => {
            cancelled = true;
        };
    }, [electionId]);

    useEffect(() => {
        let cancelled = false;

        async function loadVoteStatus() {
            setHasVoted(false);
            setVoteStatusError(null);

            if (
                isAuthLoading ||
                !isLoggedIn ||
                !election ||
                election.status !== "open"
            ) {
                setLoadingVoteStatus(false);
                return;
            }

            try {
                setLoadingVoteStatus(true);

                const result = await checkVoteStatus(String(election.id));

                if (!cancelled) {
                    setHasVoted(result);
                }
            } catch (err) {
                if (!cancelled) {
                    setVoteStatusError(
                        err instanceof Error
                            ? err.message
                            : "Unable to check vote status."
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoadingVoteStatus(false);
                }
            }
        }

        void loadVoteStatus();

        return () => {
            cancelled = true;
        };
    }, [election, isLoggedIn, isAuthLoading]);

    const formatDate = (date: string) =>
        new Date(date).toLocaleString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });

    if (loading || error || !election) {
        const notFound =
            error === "NOT_FOUND" ||
            (!loading && !error && !election);

        return (
            <div className="election-page-wrapper">
                <Navigation action="VOTE" />

                <main className="election-not-found">
                    <div className="not-found-box">
                        <h1>
                            {loading
                                ? "Loading Election..."
                                : notFound
                                  ? "Election Not Found"
                                  : "Unable to Load Election"}
                        </h1>

                        <p>
                            {loading
                                ? "Please wait while we load the election details."
                                : notFound
                                  ? "The election you are looking for does not exist."
                                  : "Something went wrong while loading this election. Please try again."}
                        </p>

                        {!loading && (
                            <Link to="/" className="btn-primary">
                                Back to Home
                            </Link>
                        )}
                    </div>
                </main>

                <Footer />
            </div>
        );
    }

    return (
        <div className="election-page-wrapper">
            <Navigation action="VOTE" />

            <main className="election-main-content">
                <section className="election-hero-section">
                    <div className="election-container">
                        <span className="election-tag">
                            ELECTION #{election.id}
                        </span>

                        <h1>{election.title}</h1>

                        <p className="election-subtitle">
                            {election.description}
                        </p>

                        <div className="hero-meta-row">
                            <span
                                className={`status-badge ${election.status}`}
                            >
                                {election.status.toUpperCase()}
                            </span>

                            <span className="hero-date-text">
                                📅 {formatDate(election.startAt)}
                                {" — "}
                                {formatDate(election.endAt)}
                            </span>
                        </div>
                    </div>
                </section>

                {election.status === "closed" && (
                    <>
                        <section className="content-section">
                            <div className="election-container">
                                <h2>Election Closed</h2>
                                <p>
                                    Voting for this election has ended.
                                </p>
                            </div>
                        </section>

                        <ResultsPodium
                            candidates={election.candidates}
                            electionStatus={election.status}
                        />
                        <CandidatesSection election={election} />
                    </>
                )}

                {election.status === "open" && (
                    <>
                        <section className="content-section action-block">
                            <div className="election-container">
                                <div className="vote-action-card">
                                    {!isLoggedIn ? (
                                        <>
                                            <div>
                                                <h2>Ready to vote?</h2>
                                                <p>
                                                    Log in to check whether
                                                    you are eligible to vote
                                                    in this election.
                                                </p>
                                            </div>

                                            <button
                                                type="button"
                                                className="btn-primary btn-large"
                                                disabled={isAuthLoading}
                                                onClick={() =>
                                                    navigate(
                                                        `/auth/login?redirect=${encodeURIComponent(
                                                            `/elections/${election.id}`
                                                        )}`
                                                    )
                                                }
                                            >
                                                Log In
                                            </button>
                                        </>
                                    ) : isAuthLoading ||
                                      loadingVoteStatus ? (
                                        <p role="status">
                                            Checking your voting status...
                                        </p>
                                    ) : voteStatusError ? (
                                        <div>
                                            <h2>Unable to check voting status</h2>
                                            <p role="alert">
                                                Please try again later.
                                            </p>
                                        </div>
                                    ) : hasVoted ? (
                                        <div>
                                            <h2>You have already voted</h2>
                                            <p role="status">
                                                คุณได้ลงคะแนนใน Election นี้แล้ว
                                            </p>
                                        </div>
                                    ) : (
                                        <>
                                            <div>
                                                <h2>You are eligible to vote</h2>
                                                <p>
                                                    You can cast your ballot
                                                    in this election.
                                                </p>
                                            </div>

                                            <button
                                                type="button"
                                                className="btn-primary btn-large"
                                                onClick={() =>
                                                    navigate(
                                                        `/vote/${election.id}`
                                                    )
                                                }
                                            >
                                                Cast Your Ballot
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </section>

                        <ResultsPodium
                            candidates={election.candidates}
                            electionStatus={election.status}
                        />
                        <CandidatesSection election={election} />
                        <ElectionRules />
                    </>
                )}

                {election.status === "scheduled" && (
                    <>
                        <section className="content-section schedule-block">
                            <div className="election-container">
                                <div className="schedule-info-card">
                                    <h2>
                                        Voting Has Not Started Yet
                                    </h2>

                                    <p>
                                        This election is scheduled to begin on:
                                    </p>

                                    <div className="schedule-date-pill">
                                        📅 {formatDate(election.startAt)}
                                    </div>
                                </div>
                            </div>
                        </section>

                        <CandidatesSection election={election} />
                    </>
                )}

                {election.status === "draft" && (
                    <section className="content-section">
                        <div className="election-container">
                            <h2>
                                This election is not yet published.
                            </h2>
                        </div>
                    </section>
                )}
            </main>

            <Footer />
        </div>
    );
}

function CandidatesSection({
    election,
}: {
    election: ElectionWithCandidates;
}) {
    return (
        <section className="content-section candidates-block">
            <div className="election-container">
                <h2>Candidates</h2>

                {election.candidates.length === 0 ? (
                    <p>No candidates have been added yet.</p>
                ) : (
                    <div className="candidates-grid">
                        {election.candidates.map((candidate) => (
                            <article
                                key={candidate.id}
                                className="candidate-card"
                            >
                                <div className="candidate-header">
                                    <span className="cand-num">
                                        #{candidate.candidate_number}
                                    </span>

                                    <h3>
                                        {candidate.firstname}{" "}
                                        {candidate.lastname}
                                    </h3>
                                </div>

                                <p className="candidate-desc">
                                    {candidate.description ||
                                        "No description provided."}
                                </p>
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}