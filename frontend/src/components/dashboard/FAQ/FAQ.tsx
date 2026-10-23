import './FAQ.css'
import { faqs } from './constant';

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
                        <a href="mailto:council:son.edu" className="email-link">
                            <svg className="mail-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                <polyline points="22,6 12,13 2,6"></polyline>
                            </svg>
                            council@son.edu
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