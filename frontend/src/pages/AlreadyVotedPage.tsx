import '../styles/AlredayVotedPage.css'

type Props = {
  goResults: () => void
}

export default function AlreadyVotedPage({ goResults }: Props) {
  return (
    <div className="voted-wrapper">
      <div className="voted-card">
        <div className="status-icon">✅</div>
        <h2>ท่านได้เลือกตั้งไปแล้ว</h2>
        <p>ระบบได้รับคะแนนของคุณเรียบร้อยแล้ว <br /> ไม่สามารถลงคะแนนซ้ำได้อีก</p>

        <button className="btn-results" onClick={goResults}>
          ดูผลคะแนนล่าสุด
        </button>
      </div>
    </div>
  )
}