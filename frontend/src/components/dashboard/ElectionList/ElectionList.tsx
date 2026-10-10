
import { Link } from "react-router-dom";
import { elections } from "../../../data/mockElections";
import "./ElectionList.css";

export default function ElectionList() {
    return (
        <section id="elections">
            <header className="election-section-header">
                <h2>OPEN ELECTIONS</h2>
            </header>

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
                            <h3 title={election.title}>
                                {election.title}
                            </h3>

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
