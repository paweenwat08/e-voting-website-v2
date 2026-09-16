import { useState, useRef, useEffect } from "react";
import { login } from "../services/auth";
import "../styles/LoginPage.css";

type Props = {
  setUser: React.Dispatch<React.SetStateAction<string | null>>;
  goVote: () => void;
  goAlready: () => void;
};

export default function LoginPage({
  setUser,
  goVote,
  goAlready,
}: Props) {
  const [studentID, setStudentID] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const studentIdRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    studentIdRef.current?.focus();
  }, []);

  const handleLogin = async () => {
    const result = await login(studentID, password);

    if (!result.success) {
      if (result.message === "already") {
        goAlready();
        return;
      }

      setMessage(result.message ?? "");
      return;
    }

    setMessage("");

    // Login สำเร็จ
    setUser(result.voter._id);

    localStorage.setItem("voter", JSON.stringify(result.voter));

    goVote();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleLogin();
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <form onSubmit={handleSubmit}>
          <h2>เข้าสู่ระบบ</h2>

          {message && (
            <div className="alert-box" title={message}>
              {message}
            </div>
          )}

          <div className="input-field">
            <label>
              รหัสนักเรียน
              <input
                ref={studentIdRef}
                type="text"
                placeholder="ระบุรหัสนักเรียน"
                value={studentID}
                onChange={(e) => setStudentID(e.target.value)}
              />
            </label>
          </div>

          <div className="input-field">
            <label>
              รหัสผ่าน
              <input
                ref={passwordRef}
                type="password"
                placeholder="ระบุรหัสผ่าน"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
          </div>

          <button type="submit" className="btn-login">
            เข้าสู่ระบบ
          </button>
        </form>
      </div>
    </div>
  );
}