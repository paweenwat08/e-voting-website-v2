import { useState, useEffect } from "react";
import { getResults } from "../../services/voteServices";
import type { VoteRecord } from "../../types/Vote";
import type { Party } from "../../types/Party";

// กำหนด Type สำหรับ Candidates ที่ได้จากการดึง/จัดกลุ่ม
interface CandidateStat {
  id: string;
  fname: string;
  lname: string;
  partyName: string;
  district: number;
  count: number;
}

export default function ResultCandidate() {
  const [selectedDistrict, setSelectedDistrict] = useState<number | "all">("all");
  const [votes, setVotes] = useState<VoteRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadResults() {
      try {
        const res = await getResults();
        if (res.success) {
          setVotes(res.votes);
        }
      } catch (err) {
        console.error("Failed to load candidates votes:", err);
      } finally {
        setLoading(false);
      }
    }
    loadResults();
  }, []);

  if (loading) return <p className="loading-text">กำลังโหลดข้อมูลผู้สมัคร...</p>;

  // 1. นำข้อมูล votes ทั้งหมดมารวมคะแนนตาม candidate
  const candidateMap: Record<string, CandidateStat> = {};

  votes.forEach((v) => {
    if (!v.candidate) return;
    const cid = v.candidate._id;

    if (!candidateMap[cid]) {
      // ดึงชื่อพรรคจาก Object party
      const partyObj = v.party as Party | undefined;
      candidateMap[cid] = {
        id: cid,
        fname: v.candidate.firstname,
        lname: v.candidate.lastname,
        partyName: partyObj ? partyObj.name : "ผู้สมัครอิสระ",
        district: v.candidate.district,
        count: 0,
      };
    }
    candidateMap[cid].count += 1;
  });

  const allCandidatesList = Object.values(candidateMap);

  // 2. ดึงรายการเขตทั้งหมดที่มีข้อมูล
  const districts = Array.from(new Set(allCandidatesList.map((c) => c.district))).sort(
    (a, b) => a - b
  );

  // 3. กรองตามเขตที่เลือก
  const filteredCandidates =
    selectedDistrict === "all"
      ? allCandidatesList
      : allCandidatesList.filter((c) => c.district === selectedDistrict);

  // 4. เรียงลำดับตามคะแนนจากมากไปน้อย
  const sortedCandidates = [...filteredCandidates].sort((a, b) => b.count - a.count);

  const top3Candidates = sortedCandidates.slice(0, 3);
  const ntop3Candidates = sortedCandidates.slice(3);

  const totalCandidateVotes = filteredCandidates.reduce((acc, c) => acc + c.count, 0);

  return (
    <div className="district-wrapper">
      <div className="block-header">
        <h3>คะแนนผู้สมัคร</h3>
      </div>

      {totalCandidateVotes === 0 ? (
        <div className="block-empty">
          <p className="empty">ยังไม่มีคะแนน</p>
        </div>
      ) : (
        <>
          <div className="district-selector-container">
            <div className="district-selector">
              <button
                className={selectedDistrict === "all" ? "active" : ""}
                onClick={() => setSelectedDistrict("all")}
              >
                ทั้งหมด
              </button>
              {districts.map((d) => (
                <button
                  key={d}
                  className={String(selectedDistrict) === String(d) ? "active" : ""}
                  onClick={() => setSelectedDistrict(d)}
                >
                  เขต {d}
                </button>
              ))}
            </div>
          </div>

          {/* 🏆 Layout โพเดียม (ซ้าย) และ รายการถัดไป (ขวา) */}
          <div className="candidate-layout" style={{ gridTemplateColumns: "1.4fr 1fr" }}>
            {/* 🥇🥈🥉 แท่น Podium */}
            <section className="candidate-podium-wrapper">
              <div className="top3-podium">
                {/* [อันดับ 2] */}
                {top3Candidates[1] && (() => {
                  const percent = ((top3Candidates[1].count / totalCandidateVotes) * 100).toFixed(1);
                  return (
                    <div className="podium-column rank-2">
                      <div className="medal-avatar">2</div>
                      <p className="name">{top3Candidates[1].fname} {top3Candidates[1].lname}</p>
                      <p className="party" style={{ fontSize: "12px", color: "var(--color-text-muted)", margin: "0 0 6px 0" }}>
                        {top3Candidates[1].partyName}
                      </p>
                      <span className="score">{top3Candidates[1].count} คะแนน ({percent}%)</span>
                      <div className="podium-display"></div>
                    </div>
                  );
                })()}

                {/* [อันดับ 1] */}
                {top3Candidates[0] && (() => {
                  const percent = ((top3Candidates[0].count / totalCandidateVotes) * 100).toFixed(1);
                  return (
                    <div className="podium-column rank-1">
                      <div className="medal-avatar">1</div>
                      <p className="name">{top3Candidates[0].fname} {top3Candidates[0].lname}</p>
                      <p className="party" style={{ fontSize: "12px", color: "var(--color-text-muted)", margin: "0 0 6px 0" }}>
                        {top3Candidates[0].partyName}
                      </p>
                      <span className="score" style={{ fontWeight: "600" }}>{top3Candidates[0].count} คะแนน ({percent}%)</span>
                      <div className="podium-display"></div>
                    </div>
                  );
                })()}

                {/* [อันดับ 3] */}
                {top3Candidates[2] && (() => {
                  const percent = ((top3Candidates[2].count / totalCandidateVotes) * 100).toFixed(1);
                  return (
                    <div className="podium-column rank-3">
                      <div className="medal-avatar">3</div>
                      <p className="name">{top3Candidates[2].fname} {top3Candidates[2].lname}</p>
                      <p className="party" style={{ fontSize: "12px", color: "var(--color-text-muted)", margin: "0 0 6px 0" }}>
                        {top3Candidates[2].partyName}
                      </p>
                      <span className="score">{top3Candidates[2].count} คะแนน ({percent}%)</span>
                      <div className="podium-display"></div>
                    </div>
                  );
                })()}
              </div>
            </section>

            {/* 📊 รายชื่อลำดับอื่น ๆ */}
            <section className="others-side">
              <ul className="results-list">
                {ntop3Candidates.map((c, index) => {
                  const percent = totalCandidateVotes > 0 ? ((c.count / totalCandidateVotes) * 100).toFixed(1) : "0.0";
                  const realRank = index + 4;

                  return (
                    <li key={c.id} className="result-item">
                      <span className="rank-num">{realRank}</span>
                      <span className="party-name">
                        {c.fname} {c.lname}{" "}
                        <small style={{ color: "var(--color-text-muted)" }}>({c.partyName})</small>
                      </span>
                      <span className="vote-stats">{c.count} <small>({percent}%)</small></span>
                    </li>
                  );
                })}
              </ul>
            </section>
          </div>
        </>
      )}
    </div>
  );
}