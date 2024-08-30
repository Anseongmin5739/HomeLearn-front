import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../../utils/axios";
import StudentDetailCalendar from "../../components/Calendar/StudentCalendar/StudentDetailCalendar";
import "./StudentDetail.css";
import swal from "sweetalert";

const StudentDetail = () => {
  // 학생 ID 가져옴
  const { id } = useParams();
  const navigate = useNavigate();

  // 상태 변수 선언
  const [student, setStudent] = useState(null);
  const [curriculum, setCurriculum] = useState(null);
  const [attendance, setAttendance] = useState(null);
  const [events, setEvents] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editedStudent, setEditedStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 토큰 가져옴
  const getToken = () => localStorage.getItem("access-token");

  useEffect(() => {
    const token = getToken();
    const config = { headers: { access: token } };

    // 학생 정보
    const fetchStudent = async () => {
      try {
        const response = await axios.get(`managers/students/basic/${id}`, config);
        setStudent(response.data); // 학생 정보 데이터 설정
        setEditedStudent(response.data); // 수정 가능한 학생 정보 데이터 설정
      } catch (err) {
        setError("학생 정보를 불러오는데 실패했습니다.");
      } finally {
        setLoading(false); // 로딩 상태 종료
      }
    };

    // 교육 과정 정보
    const fetchCurriculum = async () => {
      try {
        const response = await axios.get(`managers/students/curriculum/${id}`, config);
        setCurriculum(response.data); // 교육 과정 정보 설정
      } catch (err) {
        setError("커리큘럼 정보를 불러오는데 실패했습니다.");
      }
    };

    // 출석 정보
    const fetchAttendance = async () => {
      try {
        const response = await axios.get(`managers/students/attendance/${id}`, config);
        setAttendance(response.data); // 출석 정보 설정

        // 출석 정보를 이벤트 데이터로 변환하여 캘린더에 표시
        if (response.data && response.data.dateAttendanceType) {
          const eventsData = Object.entries(response.data.dateAttendanceType).map(
            ([date, type]) => ({
              title: type,
              start: new Date(date),
              end: new Date(date),
              allDay: true,
              className: type.toLowerCase(),
            })
          );
          setEvents(eventsData);
        }
      } catch (err) {
        setError("출석 정보를 불러오는데 실패했습니다.");
      }
    };

    // 데이터를 fetch
    fetchStudent();
    fetchCurriculum();
    fetchAttendance();
  }, [id]);

  // 입력 값 변경
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedStudent((prev) => ({ ...prev, [name]: value }));
  };

  // 성별 변경
  const handleGenderChange = (gender) => {
    setEditedStudent((prev) => ({ ...prev, gender }));
  };

  // 학생 정보 수정
  const handleUpdateStudent = async () => {
    try {
      const token = getToken();
      const response = await axios.patch(
        `/managers/manage-students/${id}`,
        editedStudent,
        {
          headers: {
            "Content-Type": "application/json",
            access: token,
          },
        }
      );

      if (response.status === 200) {
        setStudent(editedStudent);
        setIsEditing(false);
        swal("수정 성공", "학생 정보가 성공적으로 수정되었습니다.", "success");
      } else {
        swal("수정 실패", "학생 정보 수정에 실패했습니다. 다시 시도해주세요.", "error");
      }
    } catch (error) {
      console.error("학생 정보 수정 중 오류 발생:", error);
      swal("수정 실패", "학생 정보 수정 중 오류가 발생했습니다. 다시 시도해주세요.", "error");
    }
  };

  // 출석률 계산
  const attendanceRatio = attendance && attendance.ratio !== undefined ? attendance.ratio.toFixed(1) : 0;

  // 로딩 중일 때
  if (loading) {
    return <p>로딩 중...</p>;
  }

  // 오류 발생 시
  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className="student-detail">
      <div className="student-header">
        <h2 className="student-detail-title">학생 정보</h2>
      </div>
      <div className="student-info-container">
        <div className="student-info-left">
          {curriculum && (
            <>
              <h3>{curriculum.name} {curriculum.th}기</h3>
              <div className="progress-info">
                <span>과정 진행률</span>
                <div className="student-progress-bar">
                  <div
                    className="student-progress-bar-inner"
                    style={{ width: `${curriculum.progress}%` }}
                  >
                    {curriculum.progress}%
                  </div>
                </div>
              </div>
              <div className="progress-info">
                <span>학생 출석률</span>
                <div className="student-progress-bar">
                  <div
                    className="progress-bar-inner progress-bar-attendance"
                    style={{ width: `${attendanceRatio}%` }}
                  >
                    {attendanceRatio}%
                  </div>
                </div>
              </div>
            </>
          )}

          {student && (
            <div className="student-basic-info">
              <label>이름</label>
              <input
                type="text"
                name="name"
                value={isEditing ? editedStudent.name : student.name}
                onChange={handleInputChange}
                readOnly={!isEditing}
              />
              <label>이메일</label>
              <input
                type="email"
                name="email"
                value={isEditing ? editedStudent.email : student.email}
                onChange={handleInputChange}
                readOnly={!isEditing}
              />
              <label>전화번호</label>
              <input
                type="text"
                name="phone"
                value={isEditing ? editedStudent.phone : student.phone}
                onChange={handleInputChange}
                readOnly={!isEditing}
              />
              <label>성별</label>
              <div className="gender-buttons">
                <button
                  className={editedStudent.gender === "MALE" ? "selected" : ""}
                  onClick={() => isEditing && handleGenderChange("MALE")}
                  disabled={!isEditing}
                >
                  남
                </button>
                <button
                  className={editedStudent.gender === "FEMALE" ? "selected" : ""}
                  onClick={() => isEditing && handleGenderChange("FEMALE")}
                  disabled={!isEditing}
                >
                  여
                </button>
              </div>
            </div>
          )}

          <div className="student-detail-actions">
            {isEditing ? (
              <>
                <button onClick={handleUpdateStudent}>저장</button>
                <button onClick={() => setIsEditing(false)}>취소</button>
              </>
            ) : (
              <button onClick={() => setIsEditing(true)}>학생 정보 수정</button>
            )}
            <button onClick={() => navigate(`/managers/manage-students`)}>목록으로</button>
          </div>
        </div>
        <div className="student-info-right">
          <h3>출석 현황</h3>
          {attendance ? (
            <>
              <StudentDetailCalendar studentId={id} />
              <div className="attendance-legend">
                <span className="present">출석</span>
                <span className="absent">결석</span>
                <span className="late">지각</span>
                <span className="excused">공결</span>
              </div>
            </>
          ) : (
            <p>출석 정보가 없습니다.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDetail;
