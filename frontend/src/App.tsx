import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";

import { AuthProvider } from "./contexts/AuthContext";

import Dashboard from "./pages/dashboard/Dashboard";
import ElectionDetail from "./pages/election/ElectionDetail";
import Login from "./pages/login/Login";
import CandidateSelection from "./pages/vote/CandidateSelection";
import VoteConfirmation from "./pages/vote/VoteConfirmation";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />

          <Route
            path="/elections/:electionId"
            element={<ElectionDetail />}
          />

          <Route
            path="/auth/login"
            element={<Login />}
          />

          <Route
            path="/vote/:electionId"
            element={<CandidateSelection />}
          />

          <Route
            path="/vote/:electionId/confirm"
            element={<VoteConfirmation />}
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );

}

export default App;