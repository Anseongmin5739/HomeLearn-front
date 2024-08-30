import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { CirclePicker } from "react-color"; // 색상 선택 라이브러리
import axios from "../../utils/axios";
import "./CurriculumManagement.css";
import "../../components/Modal/ManagerModal/ManagerModal.css";
import swal from "sweetalert";

const CurriculumManagement = () => {
  const [teachers, setTeachers] = useState([]);
  const [colors, setColors] = useState([]);
  const [ncpCurriculums, setNcpCurriculums] = useState([]);
  const [awsCurriculums, setAwsCurriculums] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [newCurriculum, setNewCurriculum] = useState({
    type: "",
    startDate: "",
    endDate: "",
    color: "",
    teacherId: "",
    courseLabel: "",
  }); // 새로운 교육 과정 정보

  // 토큰을 가져옴
  const getToken = () => localStorage.getItem("access-token");

  // 입력 값 변경 핸들러
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCurriculum({ ...newCurriculum, [name]: value });
  };

  // 교육 과정 유형 변경 핸들러 (NCP 또는 AWS)
  const handleCourseChange = (courseName) => {
    let courseLabel = "";

    if (courseName === "NCP") {
      courseLabel = "네이버 클라우드 데브옵스 과정";
    } else if (courseName === "AWS") {
      courseLabel = "AWS 자바 웹 개발자 과정";
    }

    setNewCurriculum({
      ...newCurriculum,
      type: courseName,
      courseLabel: courseLabel,
    });
  };

  // 색상 변경 핸들러
  const handleColorChange = (color) => {
    setNewCurriculum({ ...newCurriculum, color: color.hex });
    setIsColorPickerOpen(false);
  };

  // 새로운 교육 과정 추가 핸들러
  const handleAddCurriculum = async () => {
    // 색상 중복 체크
    if (colors.includes(newCurriculum.color.toLowerCase())) {
      swal(
        "등록 실패",
        "이미 사용된 색상입니다. 다른 색상을 선택하세요.",
        "warning"
      );
      return;
    }

    // 새로운 커리큘럼 객체 생성
    const newCurriculumItem = {
      type: newCurriculum.type,
      startDate: newCurriculum.startDate,
      endDate: newCurriculum.endDate,
      color: newCurriculum.color,
    };

    // teacherId가 유효한 경우에만 추가
    if (
      newCurriculum.teacherId &&
      !isNaN(newCurriculum.teacherId) &&
      newCurriculum.teacherId !== ""
    ) {
      newCurriculumItem.teacherId = parseInt(newCurriculum.teacherId, 10);
    }

    // 날짜 유효성 검사
    if (new Date(newCurriculum.endDate) <= new Date(newCurriculum.startDate)) {
      swal("등록 실패", "종료일은 시작일 이후여야 합니다.", "warning");
      return;
    }

    try {
      const token = getToken();
      const response = await axios.post(
        "/managers/manage-curriculums/enroll",
        newCurriculumItem,
        {
          headers: {
            "Content-Type": "application/json",
            access: token,
          },
        }
      );

      if (response.status === 200) {
        setIsModalOpen(false); // 모달 닫기
        await fetchCurriculums(newCurriculum.type); // 새로운 교육 과정 목록 갱신
        await fetchEnrollReadyData(); // 등록 준비 데이터 갱신
        swal("등록 성공", "교육 과정이 성공적으로 등록되었습니다.", "success");
      } else {
        console.error("교육 과정 등록 실패");
        swal(
          "등록 실패",
          "교육 과정 등록에 실패했습니다. 다시 시도해주세요.",
          "error"
        );
      }
    } catch (error) {
      console.error("교육 과정 등록 중 오류 발생:", error);
      swal(
        "등록 실패",
        "교육 과정 등록 중 오류가 발생했습니다. 다시 시도해주세요.",
        "error"
      );
    }
  };

  // 교육 과정 등록 준비 데이터 가져오기
  const fetchEnrollReadyData = async () => {
    try {
      const token = getToken();

      const response = await axios.get("/managers/enroll-curriculum-ready", {
        headers: { access: token },
      });

      const { teachers: availableTeachers, colors: usedColors } = response.data;

      const assignedTeacherIds = [...ncpCurriculums, ...awsCurriculums]
        .filter((curriculum) => curriculum.teacherId)
        .map((curriculum) => curriculum.teacherId);

      const availableTeachersFiltered = availableTeachers.filter(
        (teacher) => !assignedTeacherIds.includes(teacher.id)
      );

      setTeachers(availableTeachersFiltered); // 사용 가능한 강사 목록 설정
      setColors(usedColors.map((color) => color.toLowerCase())); // 이미 사용된 색상 목록 설정
    } catch (error) {
      console.error("등록 준비 데이터 가져오기 중 오류 발생:", error);
      setTeachers([]);
      setColors([]);
    }
  };

  // 특정 유형의 교육 과정 목록 가져오기 (NCP 또는 AWS)
  const fetchCurriculums = async (type) => {
    try {
      const token = getToken();

      const response = await axios.get(`/managers/manage-curriculums/${type}`, {
        headers: { access: token },
      });

      if (type === "NCP") {
        setNcpCurriculums(response.data || []);
      } else if (type === "AWS") {
        setAwsCurriculums(response.data || []);
      }
    } catch (error) {
      console.error(
        `${type} 과정 교육 과정 목록 가져오기 중 오류 발생:`,
        error
      );
    }
  };

  // 컴포넌트가 마운트될 때 데이터를 가져온다
  useEffect(() => {
    const fetchAllData = async () => {
      await fetchCurriculums("NCP");
      await fetchCurriculums("AWS");
      fetchEnrollReadyData();
    };

    fetchAllData();
  }, []);

  // 교육 과정 목록을 렌더링
  const renderCurriculumList = (curriculums) =>
    curriculums.map((curriculum) => (
      <div key={curriculum.id} className="curriculum-card">
        <div className="curriculum-header">
          <span
            className="curriculum-th"
            style={{ backgroundColor: curriculum.color }}
          >
            {curriculum.th}기
          </span>
          <Link
            to={`/managers/manage-curriculums/${curriculum.id}`}
            className="curriculum-type"
          >
            {curriculum.name}
          </Link>
        </div>
        <div className="curriculum-footer">
          {curriculum.teacherName ? (
            <span className="curriculum-teacher">
              강사 {curriculum.teacherName}
            </span>
          ) : (
            <span className="curriculum-teacher">강사 정보 없음</span>
          )}
          <span className="curriculum-students">
            <i className="fas fa-user"></i> {curriculum.attendance} /{" "}
            {curriculum.total}
          </span>
        </div>
      </div>
    ));

  return (
    <div className="curriculum-management">
      <h1>교육 과정</h1>
      <div className="button-container">
        <button
          className="curriculum-add-button"
          onClick={() => setIsModalOpen(true)}
        >
          교육 과정 추가
        </button>
      </div>
      <div className="curriculum-container">
        <div className="curriculum-column">
          <h2>
            <img
              src={process.env.PUBLIC_URL + '/images/curriculum/ncp.png'}
              alt="NCP 과정"
              className="curriculum-logo"
            />
          </h2>
          <div className="curriculum-list">
            {renderCurriculumList(ncpCurriculums)}
          </div>
        </div>
        <div className="curriculum-column">
          <h2>
            <img
              src={process.env.PUBLIC_URL + '/images/curriculum/aws.png'}
              alt="AWS 과정"
              className="curriculum-logo"
            />
          </h2>
          <div className="curriculum-list">
            {renderCurriculumList(awsCurriculums)}
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button
              className="modal-close"
              onClick={() => setIsModalOpen(false)}
            >
              ×
            </button>
            <span className="curriculum-submit">교육 과정 등록</span>
            <div className="course-selection">
              <button
                className={`course-button ${newCurriculum.type === "NCP" ? "selected" : ""}`}
                onClick={() => handleCourseChange("NCP")}
              >
                <img
                  src={process.env.PUBLIC_URL + '/images/curriculum/ncp.png'}
                  alt="NCP Logo"
                  className="course-logo"
                />
              </button>
              <button
                className={`course-button ${newCurriculum.type === "AWS" ? "selected" : ""}`}
                onClick={() => handleCourseChange("AWS")}
              >
                <img
                  src={process.env.PUBLIC_URL + '/images/curriculum/aws.png'}
                  alt="AWS Logo"
                  className="course-logo"
                />
              </button>
            </div>

            <div className="curriculum-input-group">
              <label>시작일</label>
              <input
                className="curriculum-start-date-input"
                type="date"
                name="startDate"
                value={newCurriculum.startDate}
                onChange={handleInputChange}
              />
            </div>
            <div className="curriculum-input-group">
              <label>종료일</label>
              <input
                className="curriculum-end-date-input"
                type="date"
                name="endDate"
                value={newCurriculum.endDate}
                onChange={handleInputChange}
              />
            </div>
            <div className="curriculum-input-group">
              <label>기수 색상</label>
              <div className="color-input-wrapper">
                <input
                  className="color-input"
                  type="text"
                  name="courseLabel"
                  value={newCurriculum.courseLabel}
                  readOnly
                />
                <div
                  className="color-input-select"
                  onClick={() => setIsColorPickerOpen(true)}
                >
                  <div
                    className="color-box"
                    style={{ backgroundColor: newCurriculum.color }}
                  ></div>
                </div>
              </div>
            </div>
            {isColorPickerOpen && (
              <div
                className="color-picker-modal-overlay"
                onClick={() => setIsColorPickerOpen(false)}
              >
                <div
                  className="color-picker-modal-content"
                  onClick={(e) => e.stopPropagation()}
                >
                  <CirclePicker
                    color={newCurriculum.color}
                    onChangeComplete={handleColorChange}
                    colors={[
                      "#F3C41E",
                      "#F58D11",
                      "#B85B27",
                      "#A90C57",
                      "#F45CE5",
                      "#AE59F0",
                      "#0A8735",
                      "#6F961E",
                      "#19E308",
                      "#1D1AA6",
                      "#20CFF5",
                      "#98B3E5",
                    ]}
                  />
                </div>
              </div>
            )}
            <div className="curriculum-input-group">
              <label>강사</label>
              <select
                name="teacherId"
                value={newCurriculum.teacherId}
                onChange={handleInputChange}
                className="teacher-select"
              >
                <option value="">선택 안 함</option>
                {teachers.length > 0 ? (
                  teachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.name}
                    </option>
                  ))
                ) : (
                  <option disabled>강사 정보 없음</option>
                )}
              </select>
            </div>
            <div className="modal-actions">
              <button className="modal-button" onClick={handleAddCurriculum}>
                교육 과정 등록
              </button>
              <button
                className="modal-button"
                onClick={() => setIsModalOpen(false)}
              >
                등록 취소
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CurriculumManagement;
