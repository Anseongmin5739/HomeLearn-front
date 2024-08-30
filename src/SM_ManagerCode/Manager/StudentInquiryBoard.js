import React, { useState, useEffect } from "react";
import axios from "../../utils/axios";
import "./StudentInquiryBoard.css"; // 스타일 파일 불러오기

const StudentInquiryBoard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inquiries, setInquiries] = useState([]);
  const [filteredInquiries, setFilteredInquiries] = useState([]);
  const [curriculumName, setCurriculumName] = useState("");
  const [curriculumTh, setCurriculumTh] = useState("");
  const [status, setStatus] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  // 문의내역 모달창 요소
  const [contentInquiry, setContentInquiry] = useState({
    id: "",
    title: "",
    content: "",
    createdDate: "",
    userId: "",
    name: "",
    curriculumName: "",
    curriculumTh: "",
    response: "",
    responseDate: "",
  });
  const [isModalOpen, setIsModalOpen] = useState(false); // 모달 초기 상태
  const [answer, setAnswer] = useState(""); // 매니저 답변 상태

  const handleInquiryInfo = (inquiry) => {
    setContentInquiry({
      id: inquiry.id,
      title: inquiry.title,
      content: inquiry.content,
      createdDate: inquiry.createdDate,
      userId: inquiry.userId,
      name: inquiry.name,
      curriculumName: inquiry.curriculumName,
      curriculumTh: inquiry.curriculumTh,
      response: inquiry.response ? inquiry.response : "",
      responseDate: inquiry.responseDate ? inquiry.responseDate : "",
    });
    setAnswer("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };
    //학생 문의 내역
  const fetchInquiries = async () => {
    try {
      const response = await axios.get("/managers/students-inquiries");
      if (Array.isArray(response.data)) {
        setInquiries(response.data);
      } else {
        setInquiries([]);
      }
    } catch (e) {
      console.error("문의내역을 불러올 수 없음", e);
    } finally {
      setLoading(false);
    }
  };

  // FullName 교육과정명 => 변환
  const transformCurriculumName = (curriculumName) => {
    switch (curriculumName) {
      case "네이버 클라우드 데브옵스 과정":
        return "네이버 데브옵스";
      case "AWS 클라우드 자바 웹 개발자 과정":
        return "AWS 자바 웹";
      default:
        return "curriculumName";
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = ("0" + (date.getMonth() + 1)).slice(-2); // 두 자리 수로 만들기
    const day = ("0" + date.getDate()).slice(-2);
    const hours = ("0" + date.getHours()).slice(-2);
    const minutes = ("0" + date.getMinutes()).slice(-2);

    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };

  useEffect(() => {
    fetchInquiries();
  }, []);
    //답변여부 Filter 함수 생성
  const handleFilter = () => {
    const filtered = inquiries.filter((inquiry) => {
      const curriculumMatches =
        !curriculumName || inquiry.curriculumName === curriculumName;
      const curriculumThMatches =
        !curriculumTh || inquiry.curriculumTh.toString() === curriculumTh;
      const statusMatches =
        !status ||
        (status === "답변 완료" && inquiry.response !== null) ||
        (status === "미답변" && inquiry.response === null);

      return curriculumMatches && curriculumThMatches && statusMatches;
    });
    setFilteredInquiries(filtered);
    setHasSearched(true); // 조회 버튼 클릭 시 조회 상태 변경
  };

  // 필터링된 문의 내역을 두 개의 컬럼으로 나누는 함수
  const splitInquiries = (inquiries) => {
    const midIndex = Math.ceil(inquiries.length / 2);
    const leftColumn = inquiries.slice(0, midIndex);
    const rightColumn = inquiries.slice(midIndex);
    return { leftColumn, rightColumn };
  };

  const { leftColumn, rightColumn } = splitInquiries(filteredInquiries);

  const handleSaveAnswer = async () => {
    const response = await axios.post(
      `managers/inquiries/${contentInquiry.id}/add-response`,
      {
        response: answer,
      }
    );

    if (response.status === 200) {
      console.log("답변저장 완료", response.data);

      setContentInquiry((prev) => ({
        ...prev,
        response: answer,
        responseDate: new Date().toISOString(),
      }));
      setIsModalOpen(true);
    } else {
      console.error("저장 실패");
    }
  };

  return (
    <div className="student-contact">
      <h2>학생 문의</h2>
      <div className="filter-container">
        <img
          src="/images/curriculum/ncp.png"
          alt="Naver"
          className="filter-logo"
          onClick={() => setCurriculumName("네이버 클라우드 데브옵스 과정")}
        />
        <img
          src="/images/curriculum/aws.png"
          alt="AWS"
          className="filter-logo"
          onClick={() => setCurriculumName("AWS 클라우드 자바 웹 개발자 과정")}
        />
        <select
          className="batch-filter"
          value={curriculumTh}
          onChange={(e) => setCurriculumTh(e.target.value)}
        >
          <option value="">기수 선택</option>
          {Array.from(
            new Set(inquiries.map((inquiry) => inquiry.curriculumTh))
          ).map((th, index) => (
            <option key={`${th}-${index}`} value={th}>
              {th}기
            </option>
          ))}
        </select>
        <select
          className="status-filter"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">전체</option>
          <option value="답변 완료">답변 완료</option>
          <option value="미답변">미답변</option>
        </select>
        <div className="filter-button">
          <button onClick={handleFilter}>조회</button>
        </div>
      </div>

      {/* 조회 버튼을 클릭한 이후에만 결과를 표시 */}
      {hasSearched ? (
        filteredInquiries.length === 0 ? (
          <div className="no-inquiries-message">문의 내역이 없습니다.</div>
        ) : (
          <div className="inquiries-grid">
            <div className="inquiries-column">
              {leftColumn.map((inquiry, index) => (
                <div
                  key={index}
                  className={`inquiry-card ${
                    inquiry.response ? "answered" : "unanswered"
                  }`}
                  onClick={() => handleInquiryInfo(inquiry)} // 문의내역 클릭 시 모달 열기
                >
                  <div className="inquiry-header">
                    <span className="inquiry-batch">
                      {inquiry.curriculumTh}기
                    </span>
                    <span className="inquiry-course">
                      {transformCurriculumName(inquiry.curriculumName)}
                    </span>
                    <i className="fas fa-user"></i>
                    <span className="inquiry-instructor">{inquiry.name}</span>
                    <i className="fas fa-calendar-alt"></i>
                    <span className="inquiry-date">{inquiry.createdDate}</span>
                  </div>
                  <div className="inquiry-footer">
                    <p className="inquiry-question">{inquiry.title}</p>
                    <span
                      className={`inquiry-status ${
                        inquiry.response
                          ? "status-answered"
                          : "status-unanswered"
                      }`}
                    >
                      답변 여부
                      <i
                        className={`fas fa-${
                          inquiry.response ? "check-circle" : "times-circle"
                        }`}
                      ></i>
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="inquiries-column">
              {rightColumn.map((inquiry, index) => (
                <div
                  key={index}
                  className={`inquiry-card ${
                    inquiry.response ? "answered" : "unanswered"
                  }`}
                  onClick={() => handleInquiryInfo(inquiry)} // 문의 클릭시 모달 열기
                >
                  <div className="inquiry-header">
                    <span className="inquiry-batch">
                      {inquiry.curriculumTh}기
                    </span>
                    <span className="inquiry-course">
                      {transformCurriculumName(inquiry.curriculumName)}
                    </span>
                    <i className="fas fa-user"></i>
                    <span className="inquiry-instructor">{inquiry.name}</span>
                    <i className="fas fa-calendar-alt"></i>
                    <span className="inquiry-date">{inquiry.createdDate}</span>
                  </div>
                  <div className="inquiry-footer">
                    <p className="inquiry-question">{inquiry.title}</p>
                    <span
                      className={`inquiry-status ${
                        inquiry.response
                          ? "status-answered"
                          : "status-unanswered"
                      }`}
                    >
                      답변 여부
                      <i
                        className={`fas fa-${
                          inquiry.response ? "check-circle" : "times-circle"
                        }`}
                      ></i>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      ) : (
        <div className="no-inquiries-message">
          조회할 항목을 선택 후 조회 버튼을 눌러 주세요.
        </div>
      )}

      {/* 모달 */}
      {isModalOpen && (
        <div className="inquiry-student">
          <div className="inquiry-student-content">
            <button className="inquiry-student-close" onClick={closeModal}>
              X
            </button>
            <h1 className="inquiry-student-title">학생 문의 내역</h1>
            <div className="inquiry-student-header-row">
              <p>
                {transformCurriculumName(contentInquiry.curriculumName)}{" "}
                {contentInquiry.curriculumTh}기
              </p>
              <p>
                <i class="fa-solid fa-user"></i>
                {contentInquiry.name}
              </p>
            </div>
            <div className="inquiry-student-content-title">
              <p>{contentInquiry.title}</p>
              <p className="inquiry-student-content-date">
                <i class="fa-solid fa-calendar-days"></i>
                {contentInquiry.createdDate}
              </p>
            </div>
            <div className="inquiry-student-content-info">
              <p>{contentInquiry.content}</p>
            </div>
            <div className="inquiry-student-answer-section">
              <h4>매니저 답변</h4>
              {contentInquiry.response ? (
                <div>
                  <p>{contentInquiry.response}</p>
                  <p className="inquiry-student-response-date">
                    <i class="fa-solid fa-calendar-days"></i>
                    {formatDate(contentInquiry.responseDate)}
                  </p>
                </div>
              ) : (
                <div>
                  <textarea
                    placeholder="내용 입력"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                  />
                  <div className="button-answer">
                    <button
                      className="button-answer-btn"
                      onClick={handleSaveAnswer}
                    >
                      답변 등록
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentInquiryBoard;
