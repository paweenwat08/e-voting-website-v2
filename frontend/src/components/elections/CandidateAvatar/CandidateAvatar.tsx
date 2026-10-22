import './CandidateAvatar.css'

interface CandidateAvatarProps {
  src: string;
  name: string;
  rank?: number;
}

export default function CandidateAvatar({
  src,
  name,
  rank,
}: CandidateAvatarProps) {
  return (
    <div className={`candidate-avatar rank-${rank}`}>
      <img
        src={src}
        alt={`Candidate ${name}`}
        onError={(event) => {
          event.currentTarget.onerror = null;
          event.currentTarget.src =
            "/images/candidates/default-avatar.png";
        }}
      />
    </div>
  );
}