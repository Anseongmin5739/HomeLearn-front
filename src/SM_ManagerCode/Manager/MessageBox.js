import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './MessageBox.css';

const MessageBox = () => {
  const [studentInquiryCount, setStudentInquiryCount] = useState(0);
  const [teacherInquiryCount, setTeacherInquiryCount] = useState(0);

  useEffect(() => {
    const fetchInquiryCounts = async () => {
      try {
        // 학생 문의 개수 조회
        const studentResponse = await fetch('/managers/dash-boards/inquiry/ROLE_STUDENT');
        const studentCount = await studentResponse.json();
        setStudentInquiryCount(studentCount);

        // 강사 문의 개수 조회
        const teacherResponse = await fetch('/managers/dash-boards/inquiry/ROLE_TEACHER');
        const teacherCount = await teacherResponse.json();
        setTeacherInquiryCount(teacherCount);
      } catch (error) {
        console.error('문의 내역을 가져오는 중 오류 발생:', error);
      }
    };

    fetchInquiryCounts();
  }, []);

  return (
    <section className="message-box-wrapper">
      <div className="message-item">
        <h2>1:1 문의 내역</h2>
        <h3>학생</h3>
        <div className="message-content">
          <div className="message-icon">
            <Link to="/managers/inquiry/student">
              <i className="fa-regular fa-envelope"></i>
              <span className="message-count">{studentInquiryCount}</span>
            </Link>
          </div>
        </div>
        <Link to="/managers/inquiry/student" className="view-more">자세히 보기 &gt;</Link>
      </div>
      <div className="message-item">
        <h2>1:1 문의 내역</h2>
        <h3>강사</h3>
        <div className="message-content">
          <div className="message-icon">
            <Link to="/managers/inquiry/teacher">
              <i className="fa-regular fa-envelope"></i>
              <span className="message-count">{teacherInquiryCount}</span>
            </Link>
          </div>
        </div>
        <Link to="/managers/inquiry/teacher" className="view-more">자세히 보기 &gt;</Link>
      </div>
    </section>
  );
};

export default MessageBox;
