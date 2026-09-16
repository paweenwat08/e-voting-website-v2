import { useState } from "react"
import LoginPage from "./pages/LoginPage.tsx"
import VotePage from "./pages/VotePage.tsx"
import ResultsPage from "./pages/ResultPage.tsx"
import NavBar from "./components/NavBar.tsx"
import AlreadyVotedPage from "./pages/AlreadyVotedPage.tsx"
import DetailsPage from "./pages/DetailsPage.tsx"
import DemoVotePage from "./pages/DemoVotePage.tsx"
import type { Page } from "./types/Page.ts"
import './styles/adt_dcor.css'

export default function App() {
  const [page, setPage] = useState<Page>("results")
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  return (
    <main>
      <NavBar setPage={setPage} />

      {page === "login" && (
        <LoginPage setUser={setCurrentUser} goVote={() => setPage("vote")} goAlready={() => setPage("already")}/>
      )}

      {page === "vote" && (
        <VotePage userId={currentUser} goResults={() => setPage("results")} />
      )}

      {page === "already" && (
        <AlreadyVotedPage goResults={() => setPage("results")} />
      )}

      {page === "details" && (
        <DetailsPage />
      )}

      {page === "test" && (
        <DemoVotePage goResults={() => setPage("results")}/>
      )}

      {page === "results" && <ResultsPage />}
    </main>
  )
}


