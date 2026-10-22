import type { Candidate } from "../../../types/Candidate";
import CandidateAvatar from "../CandidateAvatar/CandidateAvatar";
import OtherCandidates from "../OtherCandidates/OtherCandidates";

import "./ResultsPodium.css";

interface ResultsPodiumProps {
  candidates: Candidate[];
  electionStatus: "draft" | "scheduled" | "open" | "closed";
}

export default function ResultsPodium({
  candidates,
  electionStatus,
}: ResultsPodiumProps) {
  const sortedCandidates = [...candidates].sort(
    (a, b) => (b.votes ?? 0) - (a.votes ?? 0)
  );

  if (sortedCandidates.length === 0) {
    return <p className="results-empty">No candidates available.</p>;
  }

  const top1 = sortedCandidates[0];
  const top2 = sortedCandidates[1];
  const top3 = sortedCandidates[2];

  const podiumOrder: { candidate: Candidate; rank: number }[] = [];

  if (top2) podiumOrder.push({ candidate: top2, rank: 2 });
  if (top1) podiumOrder.push({ candidate: top1, rank: 1 });
  if (top3) podiumOrder.push({ candidate: top3, rank: 3 });

  const otherCandidates = sortedCandidates.slice(3);
  const isClosed = electionStatus === "closed";

  return (
    <section className="modern-results-section">
      <div className="podium-hero-container">
        {podiumOrder.map(({ candidate, rank }) => {
          const isLeadingCandidate = rank === 1;

          return (
            <article
              key={candidate.id}
              className={`hero-card rank-${rank}`}
            >
              <div className="rank-badge-floating">
                {rank === 1
                  ? isClosed
                    ? "Winner"
                    : "1st Place"
                  : rank === 2
                    ? "2nd Place"
                    : "3rd Place"}
              </div>

              <div className="avatar-container">
                <CandidateAvatar
                  src={
                    candidate.image ||
                    "/images/candidates/default-avatar.png"
                  }
                  name={candidate.firstname}
                  rank={rank}
                />
              </div>

              <div className="candidate-details">
                <h3 className="candidate-name">{candidate.firstname} {candidate.lastname}</h3>

                {isLeadingCandidate && !isClosed && (
                  <span className="leading-pill">
                    {electionStatus === "open"
                      ? "Leading Candidate"
                      : "Current Leader"}
                  </span>
                )}

                <div className="vote-hero-stat">
                  <span className="vote-number">
                    {(candidate.votes ?? 0).toLocaleString()}
                  </span>
                  <span className="vote-unit">votes</span>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <OtherCandidates candidates={otherCandidates} />
    </section>
  );
}