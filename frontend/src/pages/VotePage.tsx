import { useState, useEffect } from "react";
import { getParties } from "../services/party";
import { getCandidates } from "../services/candidate";
import { sendVote } from "../services/voteServices";
import type { Party } from "../types/Party";
import type { Candidate } from "../types/Candidate";
import '../styles/VotePage.css';

type Props = {
  userId: string | null;
  goResults: () => void;
};

// ฟังก์ชันสำหรับดึง String ID จาก ObjectId หรือ String ID ปกติ
const getId = (item: any): string => {
  if (!item) return "";
  if (typeof item === "string") return item;
  if (typeof item._id === "object" && item._id?.$oid) return item._id.$oid;
  return String(item._id || item.id || "");
};

export default function VotePage({ userId, goResults }: Props) {
  const [selectedParty, setSelectedParty] = useState<string | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<number | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [parties, setParties] = useState<Party[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. ดึงข้อมูลพรรคและผู้สมัครจาก API
  useEffect(() => {
    async function loadData() {
      try {
        const partyRes = await getParties();
        const candidateRes = await getCandidates();

        const partyList = Array.isArray(partyRes) ? partyRes : partyRes?.parties ?? [];
        const candidateList = Array.isArray(candidateRes) ? candidateRes : candidateRes?.candidates ?? [];

        setParties(partyList);
        setCandidates(candidateList);
      } catch (error) {
        console.error("Failed to load vote data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // 2. ดึงข้อมูล Voter จาก LocalStorage ที่เก็บไว้ตอน Login
  const voterRaw = localStorage.getItem("voter");
  const voter = voterRaw ? JSON.parse(voterRaw) : null;

  if (loading) {
    return <p className="loading-text">กำลังโหลดข้อมูลการเลือกตั้ง...</p>;
  }

  if (!voter) {
    return <p className="error-text">ไม่พบข้อมูลผู้ลงคะแนน กรุณาเข้าสู่ระบบใหม่</p>;
  }

  const currentUserId = userId || getId(voter);

  if (!currentUserId) {
    return <p className="error-text">กรุณาเข้าสู่ระบบก่อนลงคะแนน</p>;
  }

  // 3. ดึงเขตของผู้โหวต (เช่น เขต 1)
  const voterDistrict = voter.district;

  // 4. กรองผู้สมัครให้แสดงเฉพาะคนที่ตรงกับเขตของผู้โหวต
  const filteredCandidates = candidates.filter(
    (c) => Number(c.district) === Number(voterDistrict)
  );

  // 5. ฟังก์ชันส่งผลการลงคะแนนไปยัง Backend
  const handleConfirm = async () => {
    if (!currentUserId || !selectedParty || !selectedCandidate || !selectedQuestion) return;

    setIsSubmitting(true);

    try {
      const referendumText =
        selectedQuestion === 1
          ? "เห็นด้วย"
          : selectedQuestion === 2
          ? "ไม่เห็นด้วย"
          : "งดออกเสียง";

      await sendVote(
        String(currentUserId),
        selectedParty,
        selectedCandidate,
        referendumText
      );

      goResults();
    } catch (error) {
      console.error("Failed to submit vote:", error);
      alert("เกิดข้อผิดพลาดในการบันทึกผลโหวต กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="vote-container">
      <h2>ยินดีต้อนรับ {voter.firstname} {voter.lastname}</h2>
      <h2>เลือกพรรคและผู้สมัครที่คุณชอบ</h2>

      {/* 🏛️ Section พรรค */}
      <section className="vote-section">
        <h3>เลือกพรรค</h3>
        <div className="selection-grid">
          {parties.map((p) => {
            const partyId = getId(p);
            return (
              <button
                key={partyId}
                className={`vote-btn ${selectedParty === partyId ? "active" : ""}`}
                onClick={() => setSelectedParty(partyId)}
              >
                {p.name}
              </button>
            );
          })}
        </div>
      </section>

      {/* 👤 Section ผู้สมัคร (แสดงเฉพาะเขตของผู้โหวตคนนั้น) */}
      <section className="vote-section">
        <h3>เลือกผู้สมัครเขต {voterDistrict ?? "-"}</h3>
        <div className="selection-grid">
          {filteredCandidates.length === 0 ? (
            <p className="empty-text">ไม่พบผู้สมัครในเขต {voterDistrict}</p>
          ) : (
            filteredCandidates.map((c) => {
              const candidateId = getId(c);
              return (
                <button
                  key={candidateId}
                  className={`vote-btn ${selectedCandidate === candidateId ? "active" : ""}`}
                  onClick={() => setSelectedCandidate(candidateId)}
                >
                  <span className="candidate-number">{c.number ?? "-"}</span>
                  <span className="candidate-name">{c.firstname} {c.lastname}</span>
                </button>
              );
            })
          )}
        </div>
      </section>

      {/* 🗳️ Section ประชามติ */}
      <section className="vote-section">
        <h3>คำถามประชามติ</h3>
        <p>ท่านเห็นชอบว่าสมควรมีรัฐธรรมนูญฉบับใหม่หรือไม่?</p>

        <div className="opinion-box">
          <button
            className={`op-btn agree ${selectedQuestion === 1 ? "active" : ""}`}
            onClick={() => setSelectedQuestion(1)}
          >
            เห็นด้วย
          </button>
          <button
            className={`op-btn disagree ${selectedQuestion === 2 ? "active" : ""}`}
            onClick={() => setSelectedQuestion(2)}
          >
            ไม่เห็นด้วย
          </button>
          <button
            className={`op-btn abstain ${selectedQuestion === 3 ? "active" : ""}`}
            onClick={() => setSelectedQuestion(3)}
          >
            งดออกเสียง
          </button>
        </div>
      </section>

      <button
        className="confirm-submit-btn"
        onClick={() => setShowConfirm(true)}
        disabled={!selectedParty || !selectedCandidate || !selectedQuestion || isSubmitting}
      >
        {isSubmitting ? "กำลังส่งข้อมูล..." : "ยืนยันการโหวต"}
      </button>

      {/* 🛡️ Modal ยืนยัน */}
      {showConfirm && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>ยืนยันการลงคะแนน</h3>
            </div>

            <div className="modal-body">
              <p>ตรวจสอบข้อมูลการเลือกของคุณให้ถูกต้องก่อนยืนยัน</p>

              <div className="confirm-summary">
                <div className="summary-item">
                  <span className="label">พรรค</span>
                  <span className="value">
                    {parties.find((p) => getId(p) === selectedParty)?.name}
                  </span>
                </div>

                <div className="summary-item">
                  <span className="label">ผู้สมัคร</span>
                  <span className="value">
                    {(() => {
                      const candidate = candidates.find((c) => getId(c) === selectedCandidate);
                      return candidate 
                        ? `${candidate.number ?? "-"} ${candidate.firstname} ${candidate.lastname}` 
                        : "";
                    })()}
                  </span>
                </div>

                <div className="summary-item">
                  <span className="label">ประชามติ</span>
                  <span className="value">
                    {selectedQuestion === 1
                      ? "เห็นด้วย"
                      : selectedQuestion === 2
                      ? "ไม่เห็นด้วย"
                      : "งดออกเสียง"}
                  </span>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn-back"
                onClick={() => setShowConfirm(false)}
                disabled={isSubmitting}
              >
                แก้ไขข้อมูล
              </button>
              <button
                className="btn-confirm"
                onClick={handleConfirm}
                disabled={isSubmitting}
              >
                {isSubmitting ? "กำลังบันทึก..." : "ยืนยันโหวต"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}