import { useState, useEffect } from "react";
import { getParties } from "../../services/party";
import type { Party } from "../../types/Party";

type Props = {
  // Key เป็นชื่อพรรค (string) และ Value เป็นคะแนน (number)
  partyResults: Record<string, number>;
};

interface PartyWithCount extends Party {
  count: number;
}

export default function ResultParty({ partyResults }: Props) {
  const [parties, setParties] = useState<Party[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. ดึงข้อมูลพรรคทั้งหมดผ่าน useEffect
  useEffect(() => {
    async function loadPartiesData() {
      try {
        const res = await getParties();
        // รองรับทั้งแบบคืนค่า array ตรงๆ หรือคืนค่าเป็น { parties: [...] }
        const partyList = Array.isArray(res) ? res : res?.parties ?? [];
        setParties(partyList);
      } catch (err) {
        console.error("Failed to load parties:", err);
      } finally {
        setLoading(false);
      }
    }
    loadPartiesData();
  }, []);

  if (loading) {
    return <p className="loading-text">กำลังโหลดคะแนนพรรค...</p>;
  }

  // คำนวณคะแนนรวมทั้งหมด
  const totalPartyVotes = Object.values(partyResults).reduce((a, b) => a + b, 0);

  // 2. จับคู่พรรคการเมืองกับคะแนนที่ได้จาก partyResults
  const sortedParties: PartyWithCount[] = parties
    .map((party) => {
      const count = partyResults[party.name] || 0;
      return { ...party, count };
    })
    .sort((a, b) => b.count - a.count);

  // ดึง Top 3 และลำดับอื่นๆ
  const top3 = sortedParties.slice(0, 3);
  const others = sortedParties.slice(3);

  // 3. จัดเรียง Top 3 ใหม่สำหรับแท่น Podium: [อันดับ 2, อันดับ 1, อันดับ 3]
  const podiumOrder: { item: PartyWithCount | undefined; rank: number }[] = [
    { item: top3[1], rank: 2 }, // ซ้าย: อันดับ 2
    { item: top3[0], rank: 1 }, // กลาง: อันดับ 1
    { item: top3[2], rank: 3 }, // ขวา: อันดับ 3
  ];

  return (
    <div className="block party-layout">
      {totalPartyVotes === 0 ? (
        <div className="block-empty">
          <p className="empty">ยังไม่มีคะแนน</p>
        </div>
      ) : (
        <>
          {/* 🔥 TOP 3 Podium Section */}
          <div className="top3-podium">
            {podiumOrder.map(({ item: party, rank }) => {
              if (!party) return null;
              const percent = ((party.count / totalPartyVotes) * 100).toFixed(1);

              return (
                <div key={party._id || party.name} className={`podium-column rank-${rank}`}>
                  <div className="medal-avatar">{rank}</div>
                  <p className="name">{party.name}</p>
                  <span className="score">
                    {party.count} เสียง ({percent}%)
                  </span>
                  <div className="podium-display"></div>
                </div>
              );
            })}
          </div>

          {/* 📊 Others Section (อันดับ 4 เป็นต้นไป) */}
          {others.length > 0 && (
            <div className="others-container">
              <ul className="results-list">
                {others.map((party, index) => {
                  const percent = ((party.count / totalPartyVotes) * 100).toFixed(1);
                  const realRank = index + 4;

                  return (
                    <li key={party._id || party.name} className="result-item">
                      <span className="rank-num">{realRank}</span>
                      <span className="party-name">{party.name}</span>
                      <span className="vote-stats">
                        {party.count} <small>({percent}%)</small>
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}