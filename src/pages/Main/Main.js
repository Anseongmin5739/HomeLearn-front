import { jwtDecode } from "jwt-decode";
import "./Main.css";
import StudentMain from "../Student/StudentMain";
import TeacherMain from "../Teacher/TeacherMain";
import ManagerMain from "../Manager/ManagerMain";
import NCPMainContent from "./NCPMainContent";
import AWSMainContent from "./AWSMainContent";
import { useState } from "react";

const Main = () => {
  const [activeTab, setActiveTab] = useState("NCP");

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // localStorage에서 토큰을 가져오기
  const token = localStorage.getItem("access-token");

  // 토큰이 없으면 비로그인 시 보여줄 페이지를 표시
  if (!token) {
    return (
      <div className="main-body" style={{ height: "100vh" }}>
        <div className="tabs">
          <button
            className={activeTab === "NCP" ? "active" : ""}
            onClick={() => handleTabChange("NCP")}
          >
            NCP
          </button>
          <button
            className={activeTab === "AWS" ? "active" : ""}
            onClick={() => handleTabChange("AWS")}
          >
            AWS
          </button>
        </div>
        {activeTab === "NCP" && <NCPMainContent />}
        {activeTab === "AWS" && <AWSMainContent />}
      </div>
    );
  }

  // 토큰이 있을 때 디코딩해서 role을 가져오기
  try {
    const decodedToken = jwtDecode(token);

    const userRole = decodedToken.role;

    const roleComponent =
      userRole === "ROLE_STUDENT" ? (
        <StudentMain />
      ) : userRole === "ROLE_TEACHER" ? (
        <TeacherMain />
      ) : userRole === "ROLE_MANAGER" ? (
        <ManagerMain />
      ) : (
        <NCPMainContent />
      );

    return <div className="main-body">{roleComponent}</div>;
  } catch (error) {
    // 토큰 디코딩 중 오류가 발생하면 비로그인 페이지를 표시
    console.error("Invalid token:", error);
    return <div className="main-body">비로그인 시 보여줄 페이지</div>;
  }
};

export default Main;
