import { Outlet } from "react-router-dom";
import Navigation from "./Navigation/Navigation";
import Footer from "./Footer/Footer";

export default function Layout() {
    return (
        <>
            <Navigation />

            <main>
                <Outlet />
            </main>

            <Footer />
        </>
    );
}