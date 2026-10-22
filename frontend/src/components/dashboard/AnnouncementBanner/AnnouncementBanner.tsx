
import './AnnouncementBanner.css';
import { useEffect, useState } from 'react';

const announcements = Object.entries(
    import.meta.glob('/src/assets/images/banners/*.{png,jpg,jpeg,jfif,webp}', {
        eager: true,
        query: '?url',
        import: 'default',
    })
)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, image]) => image as string);

export default function AnnouncementBanner() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    const total = announcements.length;

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

    if (total === 0) return null;

    return (
        <section
            className="announcement-banner"
            aria-label="Announcements"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            <div className="announcement-content">
                <img
                    className="announcement-image"
                    src={announcements[currentIndex]}
                    alt={`Announcement ${currentIndex + 1}`}
                />
            </div>

            {total > 1 && (
                <div className="announcement-controls">
                    <button
                        type="button"
                        onClick={showPrevious}
                        aria-label="Previous announcement"
                    >
                        &#8592;
                    </button>

                    <div className="announcement-dots">
                        {announcements.map((image, index) => (
                            <button
                                key={image}
                                type="button"
                                className={
                                    index === currentIndex ? 'active' : ''
                                }
                                onClick={() => setCurrentIndex(index)}
                                aria-label={`Go to announcement ${index + 1}`}
                                aria-current={
                                    index === currentIndex ? 'true' : undefined
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
            )}
        </section>
    );
}
