import Navigation from "../../components/Navigation/Navigation";
import Footer from "../../components/Footer/Footer";

import AnnouncementBanner from "../../components/dashboard/AnnouncementBanner/AnnouncementBanner";
import ElectionList from "../../components/dashboard/ElectionList/ElectionList";
import ElectionCalendar from "../../components/dashboard/Schedule/Schedule";
import HowToVote from "../../components/dashboard/HowToVote";
import ElectionRules from "../../components/dashboard/ElectionRules/ElectionRules";
import FAQ from "../../components/dashboard/FAQ/FAQ";

import './test.css';

function Dashboard() {
    return (
        <>
            <Navigation action="DASHBOARD" />

            <div id="dashboard-main">
                <AnnouncementBanner />

                <ElectionList />

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