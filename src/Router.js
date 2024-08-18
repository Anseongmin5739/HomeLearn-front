import React from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import DefaultHeader from "./components/Nav/DefaultHeader";
import Footer from "./components/Footer/Footer";
import Main from "./pages/Main/Main";
import Login from "./components/Login/Login";
import Signup from "./components/Login/Register";
import LoginEmail from "./components/Login/Login_email";
import ManagerMain from "./pages/Manager/ManagerMain";
import StudentMain from "./pages/Student/StudentMain";
import TeacherMain from "./pages/Teacher/TeacherMain";
import YouTubePlayer from "./pages/Teacher/play";
import LoginFind from "./components/Login/LoginFind";
import PasswordReset from "./components/Login/PasswordReset";

const Router = () => {
  return (
    <BrowserRouter>
      <DefaultHeader />
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/email" element={<LoginEmail />} />
        <Route path="/main" element={<Main />} />
        <Route path="/find-id" element={<LoginFind findType="id" />} />
        <Route path="/find-password" element={<LoginFind findType="password" />} />
        <Route path="/reset-password" element={<PasswordReset />} /> {/* 비밀번호 재설정 경로 추가 */}
        <Route path="/managers/*" element={<ManagerMain />} />
        <Route path="/students/*" element={<StudentMain />} />
        <Route path="/teachers/*" element={<TeacherMain />} />
        <Route path="/play" element={<YouTubePlayer />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
};

export default Router;
