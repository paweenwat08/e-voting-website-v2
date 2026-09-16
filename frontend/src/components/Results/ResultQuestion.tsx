type Props = {
  // เปลี่ยน Key เป็น string ให้ตรงกับข้อมูลจาก Backend
  questionResults: Record<string, number>;
};

export default function ResultQuestion({ questionResults }: Props) {
  // ดึงค่าโดยใช้ String Key ที่ตรงกับ Database หรือ Enum ของ Backend
  const yes = questionResults["เห็นด้วย"] || questionResults["เห็นชอบ"] || 0;
  const no = questionResults["ไม่เห็นด้วย"] || questionResults["ไม่เห็นชอบ"] || 0;
  const abs = questionResults["งดออกเสียง"] || 0;

  const totalQ = yes + no + abs;

  // คิด % โดยป้องกันการหารด้วย 0
  const yesPct = totalQ > 0 ? (yes / totalQ) * 100 : 0;
  const noPct = totalQ > 0 ? (no / totalQ) * 100 : 0;
  const absPct = totalQ > 0 ? (abs / totalQ) * 100 : 0;

  return (
    <div className="block question-layout">
      {totalQ === 0 ? (
        <div className="block-empty">
          <p className="empty">ยังไม่มีคะแนน</p>
        </div>
      ) : (
        <div className="block-body">
          <p className="question-text">สมควรมีรัฐธรรมนูญฉบับใหม่หรือไม่?</p>

          {/* 🔥 Progress bar Container */}
          <div className="progress-bar">
            {yes > 0 && (
              <div
                className="bar yes"
                style={{ width: `${yesPct}%` }}
              >
                {yesPct.toFixed(1)}%
              </div>
            )}

            {no > 0 && (
              <div
                className="bar no"
                style={{ width: `${noPct}%` }}
              >
                {noPct.toFixed(1)}%
              </div>
            )}

            {abs > 0 && (
              <div
                className="bar abstain"
                style={{ width: `${absPct}%` }}
              >
                {absPct.toFixed(1)}%
              </div>
            )}
          </div>

          {/* 📊 Cards Grid แสดงสถิติเสียง */}
          <div className="stats-grid">
            <div className="card yes">
              <p>เห็นชอบ</p>
              <h2>{yesPct.toFixed(1)}%</h2>
              <span>{yes} เสียง</span>
            </div>

            <div className="card no">
              <p>ไม่เห็นชอบ</p>
              <h2>{noPct.toFixed(1)}%</h2>
              <span>{no} เสียง</span>
            </div>

            <div className="card abstain">
              <p>งดออกเสียง</p>
              <h2>{absPct.toFixed(1)}%</h2>
              <span>{abs} เสียง</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}