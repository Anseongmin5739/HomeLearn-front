import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import swal from "sweetalert";
import axios from "../../utils/axios";
import "./Login.css";
import qs from "qs";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username && !password) {
      swal("입력 오류", "아이디와 비밀번호를 입력하세요.", "warning");
    } else if (!username) {
      swal("입력 오류", "아이디를 입력하세요.", "warning");
    } else if (!password) {
      swal("입력 오류", "비밀번호를 입력하세요.", "warning");
    } else {
      try {
        const response = await axios.post(
          "/login",
          qs.stringify({
            username,
            password,
          }),
          {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
          }
        );

        if (response.status === 200) {
          const token = response.headers["access"];

          localStorage.setItem("access-token", token); // 토큰을 로컬 스토리지에 저장

          const userType = response.data.userType; // 서버 응답에서 사용자 유형을 받아옴

          if (userType === "manager") {
            navigate("/managers"); // 매니저 페이지로 이동
          } else if (userType === "teacher") {
            navigate("/teachers"); // 강사 페이지로 이동
          } else if (userType === "student") {
            navigate("/students"); // 학생 페이지로 이동
          } else {
            navigate("/main"); // 그 외 메인 페이지 이동
          }
        } else {
          swal(
            "로그인 실패",
            "아이디 또는 비밀번호가 잘못되었습니다.",
            "error"
          );
        }
      } catch (error) {
        console.error("로그인 오류:", error);
        swal("로그인 실패", "아이디 또는 비밀번호가 잘못되었습니다.", "error");
      }
    }
  };

  const handleSignup = () => {
    navigate("/email");
  };

  return (
    <div className="login_page">
      <div className="login-container">
        <form onSubmit={handleSubmit}>
          <h2 className="login-title">로그인</h2>
          <div className="login-input-group">
            <span className="login-id-title">아이디</span>
            <input
              className="login-input"
              type="text"
              placeholder="아이디 입력"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="login-input-group">
            <span className="login-pw-title">비밀번호</span>
            <input
              className="login-input"
              type="password"
              placeholder="비밀번호 입력"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="user-found">
            <span
              className="user-found-id"
              onClick={() => navigate("/find-id")}
            >
              아이디 찾기
            </span>
            /
            <span
              className="user-found-pw"
              onClick={() => navigate("/find-password")}
            >
              비밀번호 찾기
            </span>
          </div>
          <div className="login-button-group">
            <button className="login-button" type="submit">
              로그인
            </button>
            <button
              className="login-signup-button"
              type="button"
              onClick={handleSignup}
            >
              회원가입
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
