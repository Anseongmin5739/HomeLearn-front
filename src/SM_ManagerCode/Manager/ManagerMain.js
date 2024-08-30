import React from "react";
import { Route, Routes } from "react-router-dom";
import ManagerSideBar from "../../components/SideBar/ManagerSideBar";
import ManagerCalendar from "../../components/Calendar/ManagerCalendar/ManagerCalendar";
import CalendarDetail from "../../components/Calendar/ManagerCalendar/ManagerCalendarDetail";
import Lecture from "./Lecture";
import Survey from "./Survey";
import MessageBox from "./MessageBox";
import StudentManagement from "./StudentManagement";
import CurriculumManagement from "./CurriculumManagement";
import TeacherManagement from "./TeacherManagement";
import Notice from "./Notice";
import TeacherContact from "./TeacherContact";
import CurriculumDetail from "./CurriculumDetail";
import SurveyDetail from "./SurveyDetail";
import StudentDetail from "./StudentDetail";
import ChartDetail from "./ChartDetail";
import "./ManagerMain.css";
import ManagerHeader from "../../components/Nav/ManagerHeader";
import StudentInquiryBoard from "./StudentInquiryBoard";

function Dashboard() {
  return (
      <>
        <h1>대시보드</h1>
        <div className="dashboard-grid">
          <div className="manager-dashboard-divide-box">
            <Lecture />
            <ManagerCalendar />
          </div>
          <div className="manager-dashboard-divide-box2">
            <Survey />
            <MessageBox />
          </div>
        </div>
      </>
  );
}

function ManagerMain() {
  return (
      <div className="App">
        <ManagerHeader />
        <div className="main-content">
          <ManagerSideBar />
          <div className="content-area">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="manage-students" element={<StudentManagement />} />
              <Route path="manage-students/:id" element={<StudentDetail />} />
              <Route path="manage-curriculums" element={<CurriculumManagement />} />
              <Route path="manage-curriculums/:id" element={<CurriculumDetail />} />
              <Route path="manage-teachers" element={<TeacherManagement />} />
              <Route path="notice" element={<Notice />} />
              <Route path="inquiry/student" element={<StudentInquiryBoard />} />
              <Route path="inquiry/teacher" element={<TeacherContact />} />
              <Route path="calendar/:eventId" element={<CalendarDetail />} />
              <Route path="curriculum/:curriculumId/survey/:surveyId/detail" element={<SurveyDetail />} />
              <Route path="curriculum/:curriculumId/survey/detail" element={<SurveyDetail />} />
              <Route path="curriculum/:curriculumId/survey/:surveyId/basic" element={<ChartDetail />} />
            </Routes>
          </div>
        </div>
      </div>
  );
}

export default ManagerMain;
