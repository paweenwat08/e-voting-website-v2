import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

interface Candidate {
    id: number;
    number: number;
    name: string;
    description: string;
}

const candidates: Candidate[] = [
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

export default function CandidateSelection() {
    const { electionId } = useParams();
    const navigate = useNavigate();

    const [selectedCandidateId, setSelectedCandidateId] =
        useState<number | null>(null);

    const handleContinue = () => {
        if (selectedCandidateId === null) {
            return;
        }

        navigate(`/vote/${electionId}/confirm`, {
            state: {
                candidateId: selectedCandidateId,
            },
        });
    };

    return (
        <main>
            <section>
                <p>Election</p>

                <h1>Select Your Candidate</h1>

                <p>
                    Choose one candidate to continue.
                </p>
            </section>

            <section>
                {candidates.map((candidate) => (
                    <button
                        key={candidate.id}
                        type="button"
                        onClick={() =>
                            setSelectedCandidateId(candidate.id)
                        }
                    >
                        <strong>
                            #{candidate.number}
                        </strong>

                        <h2>{candidate.name}</h2>

                        <p>{candidate.description}</p>

                        {selectedCandidateId === candidate.id && (
                            <span>Selected</span>
                        )}
                    </button>
                ))}
            </section>

            <button
                type="button"
                onClick={handleContinue}
                disabled={selectedCandidateId === null}
            >
                Continue
            </button>
        </main>
    );
}
