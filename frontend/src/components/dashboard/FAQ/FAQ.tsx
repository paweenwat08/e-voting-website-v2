import './FAQ.css'

interface FAQItem {
    id: number;
    question: string;
    answer: string;
}

const faqs: FAQItem[] = [
    {
        id: 1,
        question: "Is my vote really anonymous?",
        answer: "Yes. Your account confirms eligibility, then separates from your selections before the ballot is stored.",
    },
    {
        id: 2,
        question: "What if I'm absent on election day?",
        answer: "There is no early voting, but you can vote from any internet-connected device during polling hours.",
    },
    {
        id: 3,
        question: "Can I change my ballot after submitting?",
        answer: "No. Review every race carefully before tapping Submit; confirmed ballots cannot be reopened.",
    },
    {
        id: 4,
        question: "Do I have to vote in every race?",
        answer: "No. You may skip any office and still submit the rest of your ballot.",
    },
    {
        id: 5,
        question: "How are ties handled?",
        answer: "A tied race goes to a one-day runoff election on Oct 20 between the tied candidates.",
    },
    {
        id: 6,
        question: "When are results official?",
        answer: "The Election Board verifies totals and posts certified results at 5:00 PM on Oct 16.",
    },
];

export default function FAQ() {
    return (
        <section id="faq">
            <div className="faq-container">
                <div className="faq-header">
                    <div className="faq-title-group">
                        <div className="faq-tag">
                            <span className="tag-line"></span>
                            GOOD TO KNOW
                        </div>
                        <h2>Questions? Start here.</h2>
                        <p className="faq-subtitle">Quick answers about access, privacy, ballot rules, and results.</p>
                    </div>
                    
                    <div className="faq-contact">
                        <a href="mailto:elections@northwoodhs.edu" className="email-link">
                            <svg className="mail-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                <polyline points="22,6 12,13 2,6"></polyline>
                            </svg>
                            elections@northwoodhs.edu
                        </a>
                    </div>
                </div>

                <div className="faq-grid">
                    {faqs.map((faq) => (
                        <article key={faq.id} className="faq-card">
                            <div className="faq-card-content">
                                <h3>{faq.question}</h3>
                                <p>{faq.answer}</p>
                            </div>
                            <div className="faq-icon-btn">
                                <span>-</span>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}