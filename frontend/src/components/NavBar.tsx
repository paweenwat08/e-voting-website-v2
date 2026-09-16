import type { Page } from "../types/Page.ts"
import '../styles/NavBar.css'

type Props = {
  setPage: React.Dispatch<React.SetStateAction<Page>>
}

export default function NavBar({ setPage }: Props) {
  return (
    <header>

      <div id="nav-title">
        <p>E-Vote</p>
        <p>Samutprakan School</p>
      </div>

      <div id="vote-btn-wrapper">
        <button className="nav-btn" id="login-btn" onClick={() => setPage("login")}>เลือกตั้ง</button>
      </div>

      <nav id="nav-btn-container">
        <button className="nav-btn first-nav-btn" onClick={() => setPage("results")}>ผลคะแนน</button>
        <button className="nav-btn" onClick={() => setPage("details")}>พรรคและผู้สมัคร</button>
        <button className="nav-btn last-nav-btn" onClick={() => setPage("test")}>ทดลองระบบเลือกตั้ง</button>
      </nav>
    </header>
  )
}