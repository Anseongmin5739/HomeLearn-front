import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import swal from "sweetalert";
import axios from "../../utils/axios";
import "./LoginFind.css";

function LoginFindId() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleEmailSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) {
      return; // 이미 제출 중이면 아무 동작도 하지 않음
    }

    if (!email) {
      swal("입력 오류", "이메일을 입력하세요.", "warning");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await axios.post("/account/find-id", { email });

      if (response.status === 200) {
        swal("아이디 찾기 성공", `아이디: ${response.data}`, "success");
      } else {
        swal("오류", "해당 이메일로 등록된 정보가 없습니다.", "error");
      }
    } catch (error) {
      console.error("오류:", error);
      swal("오류", "아이디 찾기 중 문제가 발생했습니다.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-find-container">
      <form onSubmit={handleEmailSubmit}>
        <h2 className="login-find-title">아이디 찾기</h2>
        <div className="login-find-input-group">
          <span className="login-find-email-title">이메일</span>
          <input
            className="login-find-input"
            type="email"
            placeholder="이메일 입력"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSubmitting}
          />
        </div>
        <div className="login-find-button-group">
          <button
            className="login-find-button"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "전송 중..." : "아이디 찾기"}
          </button>
          <button
            className="login-find-back-button"
            type="button"
            onClick={() => navigate("/login")}
            disabled={isSubmitting}
          >
            돌아가기
          </button>
        </div>
      </form>
    </div>
  );
}

export default LoginFindId;
