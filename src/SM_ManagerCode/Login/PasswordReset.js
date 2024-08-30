import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import swal from "sweetalert";
import axios from "../../utils/axios";
import "./PasswordReset.css";
import ReCAPTCHA from "react-google-recaptcha";

function PasswordReset() {
  const [username, setUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [passwordValid, setPasswordValid] = useState(false);
  const [recaptchaValue, setRecaptchaValue] = useState("");  // reCAPTCHA 상태 추가
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.username) {
      setUsername(location.state.username);
    } else {
    }
  }, [location.state]);

  useEffect(() => {
    setPasswordMatch(newPassword === confirmPassword);
  }, [newPassword, confirmPassword]);

  useEffect(() => {
    validatePassword(newPassword);
  }, [newPassword]);

  const validatePassword = (password) => {
    const passwordRegex =
        /^(?=.*[A-Z])(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{10,18}$/;
    const isValid = passwordRegex.test(password);
    setPasswordValid(isValid);
    console.log("Password valid:", isValid);
  };

  // reCAPTCHA 완료 콜백
  const handleRecaptchaChange = (value) => {
    setRecaptchaValue(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!passwordMatch || !passwordValid) {
      swal("입력 오류", "비밀번호를 확인해 주세요.", "warning");
      return;
    }

    if (!username || !newPassword) {
      swal("입력 오류", "모든 필드를 입력하세요.", "warning");
      return;
    }

    if (!recaptchaValue) {
      swal("입력 오류", "reCAPTCHA를 완료해 주세요.", "warning");
      return;
    }

    try {
      const response = await axios.post("/account/reset-password", {
        username: username,
        password: newPassword,
        recaptcha: recaptchaValue,  // 서버로 reCAPTCHA 값 전달
      });

      if (response.status === 200) {
        swal("성공", "비밀번호가 성공적으로 재설정되었습니다.", "success");
        navigate("/login");
      } else {
        console.log("Response data:", response.data);
        swal(
            "오류",
            `비밀번호 재설정에 실패했습니다. 상태 코드: ${response.status}`,
            "error"
        );
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
            <span className="password-reset-label">아이디</span>
            <input
                className="password-reset-input"
                type="text"
                value={username}
                readOnly
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
            <div className="password-check">
              {newPassword && !passwordValid && (
                  <span className="not-available">
                비밀번호는 대문자와 특수문자를 포함하여 10-18자리여야 합니다
              </span>
              )}
            </div>
          </div>
          <div className="password-reset-input-group">
            <span className="password-reset-label">비밀번호 확인</span>
            <input
                className="password-reset-input"
                type="password"
                placeholder="비밀번호 확인"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <div className="g-recaptcha">
              <ReCAPTCHA
                  sitekey="6Lfv5iYqAAAAAAfw_OxSLJbsnxFJQ70UR73T0bH7"
                  onChange={handleRecaptchaChange}
              />
            </div>
            <div className="password-match-message">
              {confirmPassword && (
                  <span className={passwordMatch ? "match" : "no-match"}>
                {passwordMatch
                    ? "비밀번호가 일치합니다"
                    : "비밀번호가 일치하지 않습니다"}
              </span>
              )}
            </div>
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