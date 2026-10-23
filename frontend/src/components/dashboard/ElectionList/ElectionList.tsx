import { Link } from "react-router-dom";
import type { Election } from "../../../types/Election";
import "./ElectionList.css";

interface Props {
    elections: Election[];
}

export default function ElectionList({ elections }: Props) {
    if (elections.length === 0) {
        return <p>No elections available.</p>;
    }

    return (
        <section id="elections">
            <div className="election-grid">
                {elections.map((election) => (
                    <Link
                        to={`/elections/${election.id}`}
                        className="election-poster"
                        aria-label={`View ${election.title}`}
                        key={election.id}
                    >
                        <article className="election-card">

                            <img
                                src="/images/elections/default-poster.png"
                                alt={`${election.title} poster`}
                            />
                            <div className="election-card-content">
                                <h3 title={election.title}>{election.title}</h3>

                                <p className="election-description">
                                    {election.description}
                                </p>

                                <p className={`election-status status-${election.status}`}>
                                    {election.status.toUpperCase()}
                                </p>
                            </div>
                        </article>
                    </Link>

                ))}
            </div>
        </section>
    );
}