import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import swal from "sweetalert";
import axios from "../../utils/axios";
import "./LoginFind.css";

function LoginFind() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCodeSent, setIsCodeSent] = useState(false); // 인증 코드 전송 여부
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
      // 서버로 이메일 전송, 응답 처리
      const response = await axios.post("/account/send-code", { email });

      if (response.status === 200) {
        swal(
          "코드 전송 성공",
          "해당 이메일로 비밀번호 재설정 코드를 전송했습니다.",
          "success"
        );
        setIsCodeSent(true); // 인증 코드 전송 상태로 변경
      } else {
        swal("오류", "해당 이메일로 등록된 정보가 없습니다.", "error");
      }
    } catch (error) {
      console.error("오류:", error);
      swal("오류", "해당 이메일로 등록된 정보가 없습니다.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCodeSubmit = async (e) => {
    e.preventDefault();

    if (!code) {
      swal("입력 오류", "인증 코드를 입력하세요.", "warning");
      return;
    }

    setIsSubmitting(true);

    try {
      // 서버로 인증 코드 전송, 응답 처리
      const response = await axios.post("/account/verify-code", {
        email,
        code,
      });

      if (response.status === 200) {
        swal("인증 성공", "코드 인증이 성공했습니다.", "success");
        navigate("/reset-password", { state: { email } });
      } else {
        swal("오류", "인증 코드가 잘못되었거나 만료되었습니다.", "error");
      }
    } catch (error) {
      console.error("오류:", error);
      swal("오류", "인증 코드 확인 중 문제가 발생했습니다.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-find-container">
      <form onSubmit={isCodeSent ? handleCodeSubmit : handleEmailSubmit}>
        <h2 className="login-find-title">비밀번호 찾기</h2>
        <div className="login-find-input-group">
          <span className="login-find-email-title">이메일</span>
          <input
            className="login-find-input"
            type="email"
            placeholder="이메일 입력"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSubmitting || isCodeSent}
          />
        </div>
        {isCodeSent && (
          <div className="login-find-input-group">
            <span className="login-find-email-title">인증 코드</span>
            <input
              className="login-find-input"
              type="text"
              placeholder="인증 코드 입력"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
        )}
        <div className="login-find-button-group">
          <button
            className="login-find-button"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? isCodeSent
                ? "확인 중..."
                : "전송 중..."
              : isCodeSent
              ? "확인"
              : "코드 전송"}
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

export default LoginFind;
