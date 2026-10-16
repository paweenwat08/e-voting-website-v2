import Navigation from "../../components/Navigation/Navigation";
import Footer from "../../components/Footer/Footer";

import AnnouncementBanner from "../../components/dashboard/AnnouncementBanner/AnnouncementBanner";
import ElectionList from "../../components/dashboard/ElectionList/ElectionList";
import ElectionCalendar from "../../components/dashboard/Schedule/Schedule";
import HowToVote from "../../components/dashboard/HowToVote/HowToVote";
import ElectionRules from "../../components/dashboard/ElectionRules/ElectionRules";
import FAQ from "../../components/dashboard/FAQ/FAQ";

import './Dashboard.css';

function Dashboard() {
    return (
        <>
            <Navigation action="DASHBOARD" />

            <div id="dashboard-main">
                <AnnouncementBanner />

                <section className="election-section-header">
                    <h2>Elections</h2>
                    <ElectionList />
                </section>

                <ElectionCalendar />

                <HowToVote />

                <ElectionRules />

                <FAQ />
            </div>

            <Footer />
        </>
    );
}

export default Dashboard;