import { useEffect, useState } from "react";
import {
    getScheduleElections,
    type ScheduleElection,
} from "../../../services/scheduleService";
import { weekdays } from "./constants";
import { 
    toDateKey,
    formatDate
 } from "../../../functions/Date";
 import { createElectionEvents } from "./ScheduleUtils";
import "./Schedule.css";

export default function Schedule() {
    const [currentMonth, setCurrentMonth] = useState(() => {
        const today = new Date();
        return new Date(today.getFullYear(), today.getMonth(), 1);
    });

    const [selectedDate, setSelectedDate] = useState(() => {
        const today = new Date();
        return toDateKey(
            today.getFullYear(),
            today.getMonth(),
            today.getDate()
        );
    });

    const [elections, setElections] = useState<ScheduleElection[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        async function fetchElections() {
            try {
                setLoading(true);
                setError(null);

                const data = await getScheduleElections();

                if (!cancelled) {
                    setElections(data);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(
                        err instanceof Error
                            ? err.message
                            : "Failed to load election schedule."
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        void fetchElections();

        return () => {
            cancelled = true;
        };
    }, []);

    const events = createElectionEvents(elections);

    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstWeekday = new Date(year, month, 1).getDay();

    const calendarCells: (number | null)[] = [
        ...Array.from({ length: firstWeekday }, () => null),
        ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
    ];

    const selectedEvents = events.filter(
        (event) => event.date === selectedDate
    );

    const monthEvents = events
        .filter((event) => {
            const [eventYear, eventMonth] = event.date.split("-").map(Number);
            return eventYear === year && eventMonth === month + 1;
        })
        .sort((a, b) => a.date.localeCompare(b.date));

    const changeMonth = (amount: number) => {
        const nextMonth = new Date(year, month + amount, 1);

        setCurrentMonth(nextMonth);
        setSelectedDate(
            toDateKey(
                nextMonth.getFullYear(),
                nextMonth.getMonth(),
                1
            )
        );
    };

    return (
        <section id="schedule">
            <header className="calendar-heading">
                <p className="calendar-eyebrow">SAVE THE DATE</p>
                <h2>The Road to Election Day</h2>
                <p>Keep track of important election dates and events.</p>
            </header>

            {loading && (
                <p role="status">Loading election schedule...</p>
            )}

            {!loading && error && (
                <p role="alert">
                    Unable to load election schedule: {error}
                </p>
            )}

            {!loading && !error && (
                <div className="calendar-layout">
                    <aside className="calendar-details">
                        <p className="calendar-eyebrow">EVENT DETAILS</p>

                        <h3>{formatDate(selectedDate)}</h3>

                        {selectedEvents.length > 0 ? (
                            <div className="selected-events">
                                {selectedEvents.map((event) => (
                                    <article key={event.id}>
                                        <span className="event-indicator" />
                                        <h4>{event.title}</h4>
                                        <p>
                                            {event.description ??
                                                "No additional details available."}
                                        </p>
                                    </article>
                                ))}
                            </div>
                        ) : (
                            <p className="no-events">
                                No scheduled events for this day.
                            </p>
                        )}

                        <div className="upcoming-events">
                            <h4>THIS MONTH</h4>

                            {monthEvents.length > 0 ? (
                                monthEvents.map((event) => (
                                    <button
                                        type="button"
                                        key={event.id}
                                        className={
                                            event.date === selectedDate
                                                ? "upcoming-event active"
                                                : "upcoming-event"
                                        }
                                        onClick={() =>
                                            setSelectedDate(event.date)
                                        }
                                    >
                                        <span>
                                            {Number(event.date.slice(-2))}
                                        </span>
                                        <span>{event.title}</span>
                                    </button>
                                ))
                            ) : (
                                <p className="no-events">
                                    No events this month.
                                </p>
                            )}
                        </div>
                    </aside>

                    <div className="calendar-main">
                        <div className="calendar-month-header">
                            <h3>
                                {currentMonth.toLocaleDateString("en-US", {
                                    month: "long",
                                    year: "numeric",
                                })}
                            </h3>

                            <div className="calendar-navigation">
                                <button
                                    type="button"
                                    onClick={() => changeMonth(-1)}
                                    aria-label="Previous month"
                                >
                                    &#8592;
                                </button>

                                <button
                                    type="button"
                                    onClick={() => changeMonth(1)}
                                    aria-label="Next month"
                                >
                                    &#8594;
                                </button>
                            </div>
                        </div>

                        <div className="calendar-grid">
                            {weekdays.map((weekday) => (
                                <div
                                    className="calendar-weekday"
                                    key={weekday}
                                >
                                    {weekday}
                                </div>
                            ))}

                            {calendarCells.map((day, index) => {
                                if (day === null) {
                                    return (
                                        <div
                                            className="calendar-empty"
                                            key={`empty-${index}`}
                                        />
                                    );
                                }

                                const dateKey = toDateKey(year, month, day);

                                const dayEvents = events.filter(
                                    (event) => event.date === dateKey
                                );

                                const isSelected = dateKey === selectedDate;

                                const today = new Date();
                                const todayKey = toDateKey(
                                    today.getFullYear(),
                                    today.getMonth(),
                                    today.getDate()
                                );
                                const isToday = dateKey === todayKey;

                                return (
                                    <button
                                        type="button"
                                        key={dateKey}
                                        className={[
                                            "calendar-day",
                                            dayEvents.length > 0 ? "has-event" : "",
                                            isSelected ? "selected" : "",
                                            isToday ? "today" : "",
                                        ]
                                            .filter(Boolean)
                                            .join(" ")}
                                        onClick={() =>
                                            setSelectedDate(dateKey)
                                        }
                                        aria-pressed={isSelected}
                                        aria-label={`${formatDate(dateKey)}${dayEvents.length ? `, ${dayEvents.length} event(s)` : ""}`}
                                    >
                                        <span className="calendar-day-number">
                                            {day}
                                        </span>

                                        {isToday && (
                                            <span className="calendar-today-label">
                                                TODAY
                                            </span>
                                        )}

                                        {dayEvents.length > 0 && (
                                            <span className="calendar-event-dots">
                                                {dayEvents.map((event) => (
                                                    <span
                                                        className="calendar-event-dot"
                                                        key={event.id}
                                                    />
                                                ))}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        <p className="calendar-legend">
                            <span className="calendar-event-dot" />
                            Election start and end dates
                        </p>
                    </div>
                </div>
            )}
        </section>
    );
}
