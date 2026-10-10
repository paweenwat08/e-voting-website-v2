import './AnnouncementBanner.css'

import { useEffect, useState } from "react";

interface Announcement {
    id: number;
    title: string;
    message: string;
}

const announcements: Announcement[] = [
    {
        id: 1,
        title: "Voting Period",
        message: "Voting will begin on October 13.",
    },
    {
        id: 2,
        title: "Candidate List",
        message: "Candidate information is now available.",
    },
    {
        id: 3,
        title: "Election Schedule",
        message: "Check the election schedule for important dates.",
    },
];

export default function AnnouncementBanner() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    const total = announcements.length;
    const currentAnnouncement = announcements[currentIndex];

    useEffect(() => {
        if (isPaused || total <= 1) return;

        const timer = window.setInterval(() => {
            setCurrentIndex((index) => (index + 1) % total);
        }, 3000);

        return () => window.clearInterval(timer);
    }, [isPaused, total]);

    const showPrevious = () => {
        setCurrentIndex((index) => (index - 1 + total) % total);
    };

    const showNext = () => {
        setCurrentIndex((index) => (index + 1) % total);
    };

    return (
        <section
            className="announcement-banner"
            aria-label="Announcements"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            <p className="announcement-label">ANNOUNCEMENT</p>

            <div className="announcement-content" aria-live="polite">
                <h2>{currentAnnouncement.title}</h2>
                <p>{currentAnnouncement.message}</p>
            </div>

            <div className="announcement-controls">
                <button
                    type="button"
                    onClick={showPrevious}
                    aria-label="Previous announcement"
                >
                    &#8592;
                </button>

                <div className="announcement-dots">
                    {announcements.map((announcement, index) => (
                        <button
                            key={announcement.id}
                            type="button"
                            className={
                                index === currentIndex ? "active" : ""
                            }
                            onClick={() => setCurrentIndex(index)}
                            aria-label={`Go to announcement ${index + 1}`}
                            aria-current={
                                index === currentIndex ? "true" : undefined
                            }
                        />
                    ))}
                </div>

                <button
                    type="button"
                    onClick={showNext}
                    aria-label="Next announcement"
                >
                    &#8594;
                </button>
            </div>
        </section>
    );
}
