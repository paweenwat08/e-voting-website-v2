import { useEffect, useState } from "react";
import Navigation from "../../components/Navigation/Navigation";
import Footer from "../../components/Footer/Footer";

import AnnouncementBanner from "../../components/dashboard/AnnouncementBanner/AnnouncementBanner";
import ElectionList from "../../components/dashboard/ElectionList/ElectionList";
import ElectionCalendar from "../../components/dashboard/Schedule/Schedule";
import HowToVote from "../../components/dashboard/HowToVote/HowToVote";
import ElectionRules from "../../components/dashboard/ElectionRules/ElectionRules";
import FAQ from "../../components/dashboard/FAQ/FAQ";

import { getScheduleElections } from "../../services/scheduleService";
import type { Election } from "../../types/Election";
import "./Dashboard.css";

function Dashboard() {
const [elections, setElections] = useState<Election[]>([]);
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
                        : "Failed to load elections."
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

return (
    <>
        <Navigation action="DASHBOARD" />

        <div id="dashboard-main">
            <AnnouncementBanner />

            <section className="election-section-header">
                <h2>Elections</h2>

                {loading && <p role="status">Loading elections...</p>}

                {!loading && error && (
                    <p role="alert">
                        Unable to load elections: {error}
                    </p>
                )}

                {!loading && !error && (
                    <ElectionList elections={elections} />
                )}
            </section>

            <ElectionCalendar
                elections={elections}
                loading={loading}
                error={error}
            />

            <HowToVote />
            <ElectionRules />
            <FAQ />
        </div>

        <Footer />
    </>
);

}

export default Dashboard;