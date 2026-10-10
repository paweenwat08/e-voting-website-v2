import './ElectionRules.css';

const rules = [
    "Each eligible voter can vote only once.",
    "Your vote cannot be changed after submission.",
    "Do not share your account credentials.",
    "The election system records votes separately from voter identity.",
];

export default function ElectionRules() {
    return (
        <section id="election-rules">
            <div className="rules-header">
                <span className="rules-tag">GUIDELINES</span>
                <h2>Key Election Rules</h2>
                <p>Please review these important regulations before casting your ballot.</p>
            </div>

            <div className="rules-grid">
                {rules.map((rule, index) => (
                    <div className="rule-card" key={index}>
                        <div className="rule-icon">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                        </div>
                        <p className="rule-text">{rule}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}