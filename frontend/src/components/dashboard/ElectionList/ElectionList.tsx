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
                    <article className="election-card" key={election.id}>
                        <Link
                            to={`/elections/${election.id}`}
                            className="election-poster"
                            aria-label={`View ${election.title}`}
                        >
                            <img
                                src="/images/elections/default-poster.png"
                                alt={`${election.title} poster`}
                            />
                        </Link>

                        <div className="election-card-content">
                            <h3 title={election.title}>{election.title}</h3>

                            <p className="election-description">
                                {election.description}
                            </p>

                            <p className={`election-status status-${election.status}`}>
                                {election.status.toUpperCase()}
                            </p>

                            <Link
                                to={`/elections/${election.id}`}
                                className="election-view-link"
                            >
                                VIEW ↗
                            </Link>
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
}