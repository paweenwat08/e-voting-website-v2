# Architecture Decisions

## Decision 001 — Separate V2 Database

### Decision
ใช้ database แยกสำหรับ eVoting V2 ชื่อ `eVotingV2`

### Reason
- ไม่กระทบข้อมูลของ V1
- สามารถออกแบบ schema ใหม่ได้อย่างอิสระ
- สามารถเปรียบเทียบ V1 และ V2 ได้

### Alternatives
- ใช้ database เดิมของ V1
- สร้าง MongoDB Cluster ใหม่

### Why not
ไม่ใช้ database เดิม เพราะ V2 จะมีการปรับโครงสร้างข้อมูลใหม่
และยังไม่จำเป็นต้องสร้าง Cluster ใหม่