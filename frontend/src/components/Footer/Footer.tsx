import "./Footer.css";

export default function Footer() {
    return (
        <footer className="footer">
            <div className="footer-main">

                <div className="footer-brand">
                    <strong>SON HIGH SCHOOL</strong>
                    <h2>STUDENT VOTE '26</h2>

                    <p>
                        A fair, accessible student council election
                        organized by the school.
                    </p>
                </div>

                <nav className="footer-nav">
                    <h3>ELECTION</h3>

                    <a href="#elections">Elections</a>
                    <a href="#schedule">Timeline</a>
                    <a href="#how-to-vote">How to vote</a>
                    <a href="#faq">FAQ</a>
                </nav>

                <nav className="footer-nav">
                    <h3>RESOURCES</h3>

                    <a href="/">Rules</a>
                    <a href="/">Accessibility</a>
                    <a href="/">Student hub</a>
                    <a href="/">Contact board</a>
                </nav>

                <div className="footer-contact">
                    <h3>ELECTION BOARD</h3>

                    <p>council@son.edu</p>
                    <p>Room 102 · 425 Cedar Avenue</p>
                    <p>Mon–Fri · 7:45 AM–4:00 PM</p>
                </div>

            </div>

            <div className="footer-bottom">
                <p>
                    © 2026 SON High School · Student Election Board
                </p>

                <div>
                    <a href="/">Public privacy</a>
                    <a href="/">Election policy</a>
                    <a href="/">Accessibility</a>
                </div>
            </div>
        </footer>
    );
}