import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import swal from "sweetalert";
import axios from "../../utils/axios";
import "./Login_email.css";

function LoginEmail() {
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const navigate = useNavigate();

  // 다음 단계로 넘어가는 버튼
  const handleNextStep = async () => {
    // 이메일이 입력되지 않았을 경우
    if (!email) {
      swal({
        icon: "error",
        title: "이메일 오류",
        text: "이메일을 입력해주세요.",
      });
      return;
    }

    // 인증 코드가 입력되지 않았을 경우
    if (!verificationCode) {
      swal({
        icon: "error",
        title: "인증 코드 오류",
        text: "인증 코드를 입력해주세요.",
      });
      return;
    }

    try {
      // 서버에 이메일과 인증 코드를 보내서 검증 요청
      const response = await axios.post("/code-verify", {
        email,
        code: verificationCode,
      });

      // 서버 200 상태 코드
      if (response.status === 200) {
        const { name, phone, gender } = response.data; // 서버로부터 이름 전화번호 성별 정보 받음
        // 회원가입 페이지로 이동하면서 사용자 정보를 전달
        navigate("/signup", { state: { email, name, phone, gender } });
      } else {
        swal({
          icon: "error",
          title: "인증 오류",
          text: "인증 코드가 올바르지 않습니다.",
        });
      }
    } catch (error) {
      // 서버 응답에 따른 오류 처리
      if (error.response && error.response.status === 400) {
        swal({
          icon: "error",
          title: "인증 실패",
          text: "인증 코드가 올바르지 않습니다.",
        });
      } else {
        // 그외 오류 처리
        console.error("인증 오류:", error); // 콘솔 오류 로그
        swal({
          icon: "error",
          title: "오류 발생",
          text: "인증 중 오류가 발생했습니다. 나중에 다시 시도해주세요.",
        });
      }
    }
  };

  // 이전 단계로 돌아가는 버튼
  const handlePreviousStep = () => {
    navigate("/login");
  };

  return (
    <div className="login-email-container">
      <form>
        <h2 className="login-email-title">회원가입</h2>
        <h3 className="login-email-subtitle">이메일 인증</h3>
        {/* 이메일 입력 필드 */}
        <div className="login-email-input-group">
          <label className="login-email-label">이메일</label>
          <div className="login-email-input-wrapper">
            <input
              className="login-email-input"
              type="email"
              placeholder="이메일 입력" // 입력 필드의 플레이스홀더
              value={email} // 이메일 상태 변수 값
              onChange={(e) => setEmail(e.target.value)} // 사용자가 입력할 때 상태 변수 업데이트
            />
          </div>
        </div>

        {/* 인증 코드 입력 필드 */}
        <div className="login-email-input-group">
          <label className="login-email-label">인증코드</label>
          <div className="login-email-input-wrapper">
            <input
              className="login-email-input"
              type="text"
              placeholder="인증코드 입력"
              value={verificationCode} // 인증 코드 상태 변수 값
              onChange={(e) => setVerificationCode(e.target.value)} // 사용자가 입력할 때 상태 변수 업데이트
            />
          </div>
        </div>

        <div className="login-email-button-group">
          <button
            className="login-email-prev-button"
            type="button"
            onClick={handlePreviousStep} // 이전 버튼 클릭 시
          >
            이전
          </button>
          <button
            className="login-email-next-button"
            type="button"
            onClick={handleNextStep} // 다음 버튼 클릭 시
          >
            다음
          </button>
        </div>
      </form>
    </div>
  );
}

export default LoginEmail;
