import { useLocation, useNavigate, useParams } from "react-router-dom";

interface VoteState {
    candidateId: number;
}

const candidates = [
    {
        id: 1,
        number: 1,
        name: "Candidate One",
        description: "Description for candidate one.",
    },
    {
        id: 2,
        number: 2,
        name: "Candidate Two",
        description: "Description for candidate two.",
    },
    {
        id: 3,
        number: 3,
        name: "Candidate Three",
        description: "Description for candidate three.",
    },
];

export default function VoteConfirmation() {
    const { electionId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    const state = location.state as VoteState | null;

    const candidate = candidates.find(
        (candidate) => candidate.id === state?.candidateId
    );

    if (!candidate) {
        return (
            <main>
                <h1>Invalid Vote</h1>

                <button
                    type="button"
                    onClick={() => navigate(`/vote/${electionId}`)}
                >
                    Back to Candidate Selection
                </button>
            </main>
        );
    }

    const handleConfirm = () => {
        // Backend vote submission will be connected later
        console.log("Vote confirmed:", {
            electionId,
            candidateId: candidate.id,
        });

        // Temporary frontend test
        navigate("/");
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
                <p>Candidate #{candidate.number}</p>

                <h2>{candidate.name}</h2>

                <p>{candidate.description}</p>
            </section>

            <section>
                <p>
                    Once your vote is submitted, you cannot change your selection.
                </p>

                <button
                    type="button"
                    onClick={() => navigate(`/vote/${electionId}`)}
                >
                    Go Back
                </button>

                <button
                    type="button"
                    onClick={handleConfirm}
                >
                    Confirm Vote
                </button>
            </section>
        </main>
    );
}