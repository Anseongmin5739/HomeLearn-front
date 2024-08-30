import React, { useState, useEffect } from "react";
import "./StudentContact.css";
import axios from "../../utils/axios";

const StudentContact = () => {
  const [selectedCurriculum, setSelectedCurriculum] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [inquiries, setInquiries] = useState([]);

  // 백엔드에서 데이터를 가져오는 함수
  const fetchInquiries = async () => {
    try {
      const token = localStorage.getItem("access-token");
      const response = await axios.get("/managers/students-inquiries", {
        headers: {
          access: token,
        },
      });

      // 받아온 데이터가 배열인지 확인
      if (Array.isArray(response.data)) {
        setInquiries(response.data);
      } else {
        setInquiries([]); // 배열이 아니면 빈 배열로 설정
      }
    } catch (error) {
      console.error("Error fetching inquiries:", error);
      setInquiries([]); // 오류 발생 시 빈 배열로 설정
    }
  };

  // 컴포넌트가 마운트될 때 데이터를 가져옴
  useEffect(() => {
    fetchInquiries();
  }, []);

  // 필터링된 문의 목록을 계산
  const filteredInquiries = inquiries.filter((inquiry) => {
    const curriculumMatches =
      selectedCurriculum === "all" || inquiry.curriculumName === selectedCurriculum;
    const statusMatches =
      selectedStatus === "all" ||
      (selectedStatus === "답변 완료" && inquiry.response) ||
      (selectedStatus === "미답변" && !inquiry.response);

    return curriculumMatches && statusMatches;
  });

  return (
    <div className="student-contact">
      <h2>학생 문의</h2>
      <div className="filter-container">
        <select
          className="curriculum-filter"
          onChange={(e) => setSelectedCurriculum(e.target.value)}
        >
          <option value="all">모든 과정</option>
          <option value="네이버 데브옵스">네이버 데브옵스</option>
          <option value="AWS">AWS</option>
        </select>
        <select
          className="status-filter"
          onChange={(e) => setSelectedStatus(e.target.value)}
        >
          <option value="all">전체</option>
          <option value="답변 완료">답변 완료</option>
          <option value="미답변">미답변</option>
        </select>
      </div>
      <div className="inquiries-border">
        <div className="inquiries-container">
          {filteredInquiries.length > 0 ? (
            filteredInquiries.map((inquiry) => (
              <div
                key={inquiry.id}
                className={`inquiry-card ${
                  inquiry.response ? "answered" : "unanswered"
                }`}
              >
                <div className="inquiry-header">
                  <span className="inquiry-course">{inquiry.curriculumName}</span>
                  <i className="fas fa-user"></i>{" "}
                  <span className="inquiry-instructor">{inquiry.user.name}</span>
                  <i className="fas fa-calendar-alt"></i>{" "}
                  <span className="inquiry-date">
                    {new Date(inquiry.createdDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="inquiry-footer">
                  <p className="inquiry-question">{inquiry.content}</p>
                  <span
                    className={`inquiry-status ${
                      inquiry.response ? "status-answered" : "status-unanswered"
                    }`}
                  >
                    {inquiry.response ? "답변 완료" : "미답변"}
                    <i
                      className={`fas fa-${
                        inquiry.response ? "check" : "times"
                      }`}
                    ></i>
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p>문의가 없습니다.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentContact;
