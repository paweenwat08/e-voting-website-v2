import { useEffect, useState } from "react";
import { getResults } from "../services/voteServices"; // ตัด .ts ออกตามมาตรฐาน React/Vite/Webpack
import type { VoteRecord } from "../types/Vote"; // หรือดึงมาจาก path ที่ตั้งไว้
import ResultCandidate from "../components/Results/ResultCandidate";
import ResultParty from "../components/Results/ResultParty";
import ResultQuestion from "../components/Results/ResultQuestion";
import '../styles/ResultPage.css';

export default function ResultsPage() {
  const [votes, setVotes] = useState<VoteRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await getResults();
        if (response.success) {
          setVotes(response.votes);
        }
      } catch (error) {
        console.error("Failed to fetch vote results:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return <p className="loading-text">กำลังโหลดผลการลงคะแนน...</p>;
  }

  // 1. นับคะแนนพรรคการเมือง
  const partyResults = votes.reduce((acc, vote) => {
    const partyName = vote.party?.name || "ไม่ระบุพรรค";
    acc[partyName] = (acc[partyName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // 2. นับคะแนนประชามติ
  const questionResults = votes.reduce((acc, vote) => {
    const answer = vote.referendum; // เช่น "เห็นด้วย", "ไม่เห็นด้วย", "งดออกเสียง"
    if (answer) {
      acc[answer] = (acc[answer] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  return (
    <main className="results-container">
      <div className="dashboard-container">
        {/* 🏛️ พรรค */}
        <ResultParty partyResults={partyResults} />

        {/* 🗳️ ประชามติ */}
        <ResultQuestion questionResults={questionResults} />
      </div>

      {/* 👤 ผู้สมัคร */}
      <ResultCandidate />
    </main>
  );
}