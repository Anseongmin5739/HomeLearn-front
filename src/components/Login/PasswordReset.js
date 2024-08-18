import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import swal from "sweetalert";
import axios from "../../utils/axios";
import "./PasswordReset.css";

function PasswordReset() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email); // 이메일 상태 설정
    }
  }, [location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !code || !newPassword) {
      swal("입력 오류", "모든 필드를 입력하세요.", "warning");
      return;
    }

    try {
      // 서버로 코드 검증 및 비밀번호 재설정 요청
      const response = await axios.post("/account/reset-password", {
        username: email, // username 필드로 전송
        password: newPassword, // password 필드로 전송
        code, // 인증 코드도 함께 전송
      });

      if (response.status === 200) {
        swal("성공", "비밀번호가 성공적으로 재설정되었습니다.", "success");
        navigate("/login");
      } else {
        swal("오류", "인증 코드가 잘못되었거나 만료되었습니다.", "error");
      }
    } catch (error) {
      console.error("오류:", error);
      swal("오류", "비밀번호 재설정 중 문제가 발생했습니다.", "error");
    }
  };

  return (
    <div className="password-reset-container">
      <form onSubmit={handleSubmit}>
        <h2 className="password-reset-title">비밀번호 재설정</h2>
        <div className="password-reset-input-group">
          <span className="password-reset-label">이메일</span>
          <input
            className="password-reset-input"
            type="email"
            value={email}
            readOnly // 이메일 필드를 읽기 전용으로 설정
          />
        </div>
        <div className="password-reset-input-group">
          <span className="password-reset-label">인증 코드</span>
          <input
            className="password-reset-input"
            type="text"
            placeholder="인증 코드 입력"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
        </div>
        <div className="password-reset-input-group">
          <span className="password-reset-label">새 비밀번호</span>
          <input
            className="password-reset-input"
            type="password"
            placeholder="새 비밀번호 입력"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>
        <div className="password-reset-button-group">
          <button className="password-reset-button" type="submit">
            비밀번호 재설정
          </button>
          <button
            className="password-reset-back-button"
            type="button"
            onClick={() => navigate("/login")}
          >
            돌아가기
          </button>
        </div>
      </form>
    </div>
  );
}

export default PasswordReset;
