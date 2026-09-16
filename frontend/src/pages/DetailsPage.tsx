import { useState, useEffect } from "react";
import { getParties } from "../services/party";
import { getCandidates } from "../services/candidate";
import type { Party } from "../types/Party";
import type { Candidate } from "../types/Candidate";
import '../styles/DetailPage/DetailPage.css';
import '../styles/DetailPage/DetailBox.css';

// ฟังก์ชันดึง ID รองรับทั้ง String และ Mongo ObjectId
const getId = (item: any): string => {
  if (!item) return "";
  if (typeof item === "string") return item;
  if (typeof item._id === "object" && item._id?.$oid) return item._id.$oid;
  return String(item._id || item.id || "");
};

export default function DetailsPage() {
  const [selectedPartyId, setSelectedPartyId] = useState<string | null>(null);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [selectedDistrictDetail, setSelectedDistrictDetail] = useState<number | "all">("all");

  const [parties, setParties] = useState<Party[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadAllData() {
      try {
        const partyRes = await getParties();
        const candidateRes = await getCandidates();

        const partyList = Array.isArray(partyRes) ? partyRes : partyRes?.parties ?? [];
        const candidateList = Array.isArray(candidateRes) ? candidateRes : candidateRes?.candidates ?? [];

        setParties(partyList);
        setCandidates(candidateList);
      } catch (error) {
        console.error("Failed to load details page data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadAllData();
  }, []);

  if (loading) {
    return <p className="loading-text">กำลังโหลดข้อมูล...</p>;
  }

  const districts = Array.from(new Set(candidates.map((c) => c.district))).sort((a, b) => a - b);

  const filteredCandidates =
    selectedDistrictDetail === "all"
      ? candidates
      : candidates.filter((c) => Number(c.district) === Number(selectedDistrictDetail));

  const selectedParty = parties.find((p) => getId(p) === selectedPartyId);
  const selectedCandidate = candidates.find((c) => getId(c) === selectedCandidateId);

  return (
    <>
      {/* 📌 หน้าหลัก: แสดงรายการพรรค และผู้สมัคร */}
      {!selectedPartyId && !selectedCandidateId && (
        <div className="info-container">
          <h2 className="section-title">รายชื่อพรรค</h2>
          <div className="party-grid">
            {parties.map((party) => {
              const partyId = getId(party);
              return (
                <div
                  key={partyId}
                  className="party-info-card"
                  onClick={() => {
                    setSelectedPartyId(partyId);
                    setSelectedCandidateId(null);
                  }}
                >
                  <div className="party-number">{party.number ?? "-"}</div>
                  <div className="party-detail">
                    <h3>{party.name}</h3>
                  </div>
                </div>
              );
            })}
          </div>

          <hr className="divider" />

          {/* Selector เลือกเขต */}
          <div className="detail-district-selector-container">
            <h2 className="section-title">รายชื่อผู้สมัคร</h2>
            <div className="detail-district-selector">
              <button
                className={selectedDistrictDetail === "all" ? "active" : ""}
                onClick={() => setSelectedDistrictDetail("all")}
              >
                ทั้งหมด
              </button>
              {districts.map((d) => (
                <button
                  key={d}
                  className={String(selectedDistrictDetail) === String(d) ? "active" : ""}
                  onClick={() => setSelectedDistrictDetail(d)}
                >
                  เขต {d}
                </button>
              ))}
            </div>
          </div>

          {/* รายการ Card ผู้สมัคร */}
          <div className="candidate-grid">
            {filteredCandidates.map((candidate) => {
              const candidateId = getId(candidate);

              // หาชื่อพรรค
              let partyName = "ผู้สมัครอิสระ";
              if (typeof candidate.party === "object" && candidate.party?.name) {
                partyName = candidate.party.name;
              } else {
                const partyObj = parties.find((p) => getId(p) === getId(candidate.party));
                if (partyObj) partyName = partyObj.name;
              }

              return (
                <div
                  key={candidateId}
                  className="candidate-info-card"
                  onClick={() => {
                    setSelectedCandidateId(candidateId);
                    setSelectedPartyId(null);
                  }}
                >
                  {/* เปลี่ยนกลับเป็นอีโมจิคนเหมือนเดิม */}
                  <div className="candidate-avatar">👤</div>
                  <div className="candidate-text">
                    <h4 className="candidate-name-detail">
                      {candidate.firstname} {candidate.lastname}
                    </h4>
                    <p className="party-tag">สังกัด: {partyName}</p>
                    {/* เปลี่ยนเป็นรูปแบบ เขต X หมายเลข Y */}
                    <p className="district-tag">
                      เขต {candidate.district} หมายเลข {candidate.number ?? "-"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 🏛️ รายละเอียดพรรคที่เลือก */}
      {selectedParty && (
        <div className="detail-box">
          <button
            className="back-btn"
            onClick={() => {
              setSelectedPartyId(null);
              setSelectedCandidateId(null);
            }}
          >
            ← กลับ
          </button>

          <h3>🏛️ {selectedParty.name} (หมายเลข {selectedParty.number ?? "-"})</h3>

          <h4 style={{ marginTop: "20px" }}>👤 ผู้สมัครในพรรคนี้</h4>
          {(() => {
            const partyCandidates = candidates.filter((c) => {
              const cPartyId = typeof c.party === "object" ? getId(c.party) : String(c.party);
              return cPartyId === getId(selectedParty);
            });

            if (partyCandidates.length === 0) return <p>ไม่มีข้อมูลผู้สมัครในพรรคนี้</p>;

            return (
              <div className="candidate-list">
                {partyCandidates.map((c) => {
                  const candidateId = getId(c);
                  return (
                    <div
                      key={candidateId}
                      className="mini-candidate-card"
                      onClick={() => {
                        setSelectedCandidateId(candidateId);
                        setSelectedPartyId(null);
                      }}
                    >
                      <span>
                        👤 {c.firstname} {c.lastname}
                      </span>
                      <span className="district">
                        เขต {c.district} หมายเลข {c.number ?? "-"}
                      </span>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      )}

      {/* 👤 รายละเอียดผู้สมัครที่เลือก */}
      {selectedCandidate && (
        <div className="detail-box">
          <button
            className="back-btn"
            onClick={() => {
              setSelectedPartyId(null);
              setSelectedCandidateId(null);
            }}
          >
            ← กลับ
          </button>

          <h3>
            👤 {selectedCandidate.firstname} {selectedCandidate.lastname}
          </h3>
          <p>
            <strong>เขต / หมายเลข:</strong> เขต {selectedCandidate.district} หมายเลข {selectedCandidate.number ?? "-"}
          </p>
          <p>
            <strong>พรรค:</strong>{" "}
            {(() => {
              const partyObj =
                typeof selectedCandidate.party === "object"
                  ? selectedCandidate.party
                  : parties.find((p) => getId(p) === getId(selectedCandidate.party));

              if (!partyObj) return <span>ผู้สมัครอิสระ</span>;

              const partyId = getId(partyObj);

              return (
                <span
                  className="link-text"
                  onClick={() => {
                    setSelectedPartyId(partyId);
                    setSelectedCandidateId(null);
                  }}
                >
                  {partyObj.name} (หมายเลข {partyObj.number ?? "-"})
                </span>
              );
            })()}
          </p>
        </div>
      )}
    </>
  );
}