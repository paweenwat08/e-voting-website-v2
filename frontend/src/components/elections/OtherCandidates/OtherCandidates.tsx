import type { Candidate } from "../../../types/Candidate";
import CandidateAvatar from "../CandidateAvatar/CandidateAvatar";

interface OtherCandidatesProps {
  candidates: Candidate[];
}

export default function OtherCandidates({
  candidates,
}: OtherCandidatesProps) {
  if (candidates.length === 0) {
    return null;
  }

  return (
    <section className="others-section">
      <div className="others-list">
        {candidates.map((candidate, index) => {
          const rank = index + 4;

          return (
            <article key={candidate.id} className="other-card">
              <span className="other-rank">#{rank}</span>

              <div className="other-avatar-sm">
                <CandidateAvatar
                  src={
                    candidate.image ||
                    "/images/candidates/default-avatar.png"
                  }
                  name={candidate.name}
                  rank={rank}
                />
              </div>

              <div className="other-main-info">
                <div className="other-name-row">
                  <span className="other-name">{candidate.name}</span>
                  <span className="other-num">
                    Candidate #{candidate.candidateNumber}
                  </span>
                </div>
              </div>

              <div className="other-stats">
                <span className="other-votes">
                  {candidate.votes.toLocaleString()} votes
                </span>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}