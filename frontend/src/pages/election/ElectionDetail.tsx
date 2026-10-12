
import { Link, useParams } from "react-router-dom";
import Navigation from "../../components/Navigation/Navigation";
import ResultsPodium from "../../components/elections/ResultsPodium/ResultsPodium";
import ElectionRules from "../../components/dashboard/ElectionRules/ElectionRules";
import Footer from "../../components/Footer/Footer";
import './ElectionDetail.css';

import { elections } from "../../data/mockElections";

export default function ElectionDetail() {
    const { electionId } = useParams();

    const election = elections.find(
        (item: any) => item.id === Number(electionId)
    );

    if (!election) {
        return (
            <div className="election-page-wrapper">
                <Navigation action="VOTE" />
                <main className="election-not-found">
                    <div className="not-found-box">
                        <h1>Election Not Found</h1>
                        <p>The election you are looking for does not exist.</p>
                        <Link to="/" className="btn-primary">Back to Home</Link>
                    </div>
                </main>
            </div>
        );
    }

    // const totalVotes = election.candidates.reduce(
    //     (total: number, candidate: any) => total + candidate.votes,
    //     0
    // );

    const formatDate = (date: string) =>
        new Date(date).toLocaleString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });

    return (
        <div className="election-page-wrapper">
            <Navigation action="VOTE" />

            <main className="election-main-content">
                {/* --- ส่วนหัวข้อหลัก (Hero Section) --- */}
                <section className="election-hero-section">
                    <div className="election-container">
                        <span className="election-tag">ELECTION #{election.id}</span>
                        <h1>{election.title}</h1>
                        <p className="election-subtitle">{election.description}</p>

                        <div className="hero-meta-row">
                            <span className={`status-badge ${election.status}`}>
                                {election.status.toUpperCase()}
                            </span>
                            <span className="hero-date-text">
                                📅 {formatDate(election.startAt)} — {formatDate(election.endAt)}
                            </span>
                        </div>
                    </div>
                </section>

                {/* =========================================================
                    1. CLOSED: โชว์ผลเลือกตั้ง -> โชว์แคนดิเดต
                   ========================================================= */}
                {election.status === "closed" && (
                    <>
                        <ResultsPodium
                            candidates={election.candidates}
                            electionStatus={election.status}
                        />

                        <CandidatesSection election={election} />
                    </>
                )}

                {/* =========================================================
                    2. OPEN: โชว์ผลเลือกตั้งล่าสุด -> ปุ่มกดโหวต -> โชว์แคนดิเดต -> โชว์ Rules
                   ========================================================= */}
                {election.status === "open" && (
                    <>
                        <ResultsPodium
                            candidates={election.candidates}
                            electionStatus={election.status}
                        />

                        {/* ปุ่มกดโหวต */}
                        <section className="content-section action-block">
                            <div className="election-container">
                                <div className="vote-action-card">
                                    <div>
                                        <h2>Ready to vote?</h2>
                                        <p>You need to log in before casting your ballot in this election.</p>
                                    </div>
                                    <Link
                                        to={`/auth/login?redirect=/vote/${election.id}`}
                                        className="btn-primary btn-large"
                                    >
                                        Cast Your Ballot
                                    </Link>
                                </div>
                            </div>
                        </section>

                        {/* โชว์แคนดิเดต */}
                        <CandidatesSection election={election} />

                        {/* โชว์ Rules */}
                        <ElectionRules />
                    </>
                )}

                {/* =========================================================
                    3. SCHEDULED: โชว์วันเวลา -> โชว์แคนดิเดต
                   ========================================================= */}
                {election.status === "scheduled" && (
                    <>
                        {/* โชว์วันเวลา */}
                        <section className="content-section schedule-block">
                            <div className="election-container">
                                <div className="schedule-info-card">
                                    <h2>Voting Has Not Started Yet</h2>
                                    <p>This election is scheduled to begin on:</p>
                                    <div className="schedule-date-pill">
                                        📅 {formatDate(election.startAt)}
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* โชว์แคนดิเดต */}
                        <CandidatesSection election={election} />
                    </>
                )}

                {election.status === "draft" && (
                    <section className="content-section">
                        <div className="election-container">
                            <h2>This election is not yet published.</h2>
                        </div>
                    </section>
                )}
            </main>
            <Footer />
        </div>
    );
}

// คอมโพเนนต์ย่อยสำหรับแสดงรายชื่อแคนดิเดต เพื่อความเป็นระเบียบ
function CandidatesSection({ election }: { election: any }) {
    return (
        <section className="content-section candidates-block">
            <div className="election-container">
                <h2>Candidates</h2>
                <div className="candidates-grid">
                    {election.candidates.map((candidate: any) => (
                        <article key={candidate.id} className="candidate-card">
                            <div className="candidate-header">
                                <span className="cand-num">#{candidate.candidateNumber}</span>
                                <h3>{candidate.name}</h3>
                            </div>
                            <p className="candidate-desc">{candidate.description}</p>
                            {election.status === "closed" && (
                                <div className="cand-votes-footer">
                                    <span>Final Votes:</span> <strong>{candidate.votes}</strong>
                                </div>
                            )}
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}