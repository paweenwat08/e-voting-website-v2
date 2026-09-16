import { useState, useEffect } from "react";
import { getCandidates } from "../services/candidate";
import { getParties } from "../services/party";
import type { Party } from "../types/Party";
import type { Candidate } from "../types/Candidate";
import '../styles/VotePage.css';

type Props = {
  goResults: () => void;
};

// ฟังก์ชันสำหรับดึง String ID จาก ObjectId หรือ String ID ปกติ
const getId = (item: any): string => {
  if (!item) return "";
  if (typeof item === "string") return item;
  if (typeof item._id === "object" && item._id?.$oid) return item._id.$oid;
  return String(item._id || item.id || "");
};

export default function DemoVotePage({ goResults }: Props) {
  // 1. State ต่างๆ
  const [selectedParty, setSelectedParty] = useState<string | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<number | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [complete, setComplete] = useState(false);

  const [parties, setParties] = useState<Party[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);

  // 2. ดึงข้อมูลจาก API ผ่าน useEffect
  useEffect(() => {
    async function loadDemoData() {
      try {
        const partyRes = await getParties();
        const candidateRes = await getCandidates();

        const partyList = Array.isArray(partyRes) ? partyRes : partyRes?.parties ?? [];
        const candidateList = Array.isArray(candidateRes) ? candidateRes : candidateRes?.candidates ?? [];

        setParties(partyList);
        setCandidates(candidateList);
      } catch (error) {
        console.error("Failed to load demo vote data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadDemoData();
  }, []);

  if (loading) {
    return <p className="loading-text">กำลังโหลดระบบทดลองเลือกตั้ง...</p>;
  }

  // 3. กรองผู้สมัครเขต 1 (ใช้ Number() ป้องกันการเปรียบเทียบผิด Type)
  const filteredCandidates = candidates.filter((c) => Number(c.district) === 1);

  const handleConfirm = () => {
    setShowConfirm(false);
    setComplete(true);
  };

  return (
    <div className="vote-container test-mode">
      <h2 className="test-title">โหมดทดลองระบบเลือกตั้ง</h2>

      {/* 🏛️ พรรค */}
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

      <hr />

      {/* 👤 ผู้สมัคร */}
      <section className="vote-section">
        <h3>เลือกผู้สมัครเขต 1</h3>
        <div className="selection-grid">
          {filteredCandidates.map((c) => {
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
          })}
        </div>
      </section>

      <hr />

      {/* 🗳️ ประชามติ */}
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
        disabled={!selectedParty || !selectedCandidate || !selectedQuestion}
      >
        ยืนยันการเลือก
      </button>

      {/* Popup ยืนยัน และ Popup เสร็จสิ้น */}
      {(showConfirm || complete) && (
        <div className="modal-overlay">
          <div className={`modal-card test-modal ${complete ? "complete-modal" : ""}`}>
            {showConfirm ? (
              <>
                <div className="modal-header test-header">
                  <h3>ยืนยันการเลือกของคุณ</h3>
                </div>

                <div className="modal-body">
                  <p>ตรวจสอบความถูกต้องของการทดลองเลือกตั้ง</p>

                  <div className="confirm-summary test-summary">
                    <div className="summary-item">
                      <span className="summary-label">พรรค</span>
                      <span className="summary-value">
                        {parties.find((p) => getId(p) === selectedParty)?.name}
                      </span>
                    </div>

                    <div className="summary-item">
                      <span className="summary-label">ผู้สมัคร</span>
                      <span className="summary-value">
                        {(() => {
                          const candidate = candidates.find((c) => getId(c) === selectedCandidate);
                          return candidate 
                            ? `${candidate.number ?? "-"} ${candidate.firstname} ${candidate.lastname}` 
                            : "";
                        })()}
                      </span>
                    </div>

                    <div className="summary-item">
                      <span className="summary-label">ประชามติ</span>
                      <span className="summary-value">
                        {selectedQuestion === 1
                          ? "เห็นด้วย"
                          : selectedQuestion === 2
                          ? "ไม่เห็นด้วย"
                          : "งดออกเสียง"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="modal-footer action-footer">
                  <button
                    className="btn-secondary"
                    onClick={() => setShowConfirm(false)}
                  >
                    แก้ไขข้อมูล
                  </button>
                  <button
                    className="btn-confirm-test"
                    onClick={handleConfirm}
                  >
                    ยืนยันการเลือก
                  </button>
                </div>
              </>
            ) : (
              <div className="modal-body complete-body">
                <h3>ท่านได้ทดลองใช้ระบบเสร็จสิ้น</h3>
                <p>ขอบคุณที่ร่วมทดลองระบบเลือกตั้งจำลอง</p>
                <button className="btn-confirm-test go-home-btn" onClick={goResults}>
                  กลับหน้าหลักผลคะแนน
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}