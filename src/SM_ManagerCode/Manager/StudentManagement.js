import React, { useState, useEffect } from "react";
import axios from "../../utils/axios";
import ManagerModal from "../../components/Modal/ManagerModal/ManagerModal";
import ProgressModal from "./ProgressModal";
import "./StudentManagement.css";
import swal from "sweetalert";

const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [curriculums, setCurriculums] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("전체"); // 선택된 교육 과정
  const [selectedGeneration, setSelectedGeneration] = useState("전체"); // 선택된 기수
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [newStudent, setNewStudent] = useState({
    name: "",
    gender: "",
    email: "",
    phone: "",
    curriculum: "",
    generation: "",
    curriculumFullName: "",
  }); // 새 학생 등록 정보
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0); // 업로드 진행률
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState([]); // 선택된 학생 목록

  // 토큰을 가져옴
  const getToken = () => localStorage.getItem("access-token");

  useEffect(() => {
    // 초기 데이터 fetch하는 함수
    const fetchInitialData = async () => {
      try {
        setIsLoading(true); // 데이터 로딩 시작
        await fetchStudents(); // 학생 목록 가져오기
        await fetchCurriculums(); // 커리큘럼 목록 가져오기
        setIsLoading(false); // 데이터 로딩 완료
      } catch (error) {
        console.error("데이터 초기화 중 오류 발생:", error);
        setIsLoading(false); // 오류 발생 시에도 로딩 상태 해제
      }
    };

    fetchInitialData();
  }, []);

  // 학생 목록을 가져오는 함수
  const fetchStudents = async () => {
    try {
      const response = await axios.get("/managers/manage-students");

      if (response.data && response.data.content) {
        setStudents(response.data.content);
      } else {
        setStudents([]);
      }
    } catch (error) {
      console.error("학생 데이터 가져오기 에러:", error);
      setStudents([]);
    }
  };

  // 커리큘럼 목록을 가져오는 함수
  const fetchCurriculums = async () => {
    try {
      const response = await axios.get("/managers/enroll-user-ready");
      if (response.data) {
        setCurriculums(response.data);
      } else {
        setCurriculums([]);
      }
    } catch (error) {
      console.error("기수 데이터 가져오기 에러:", error);
      setCurriculums([]);
    }
  };

  // 검색어 변경 핸들러
  const handleSearch = (event) => setSearchTerm(event.target.value);

  // 교육 과정 변경 핸들러
  const handleCourseChange = (course) => {
    const fullCourseName =
      course === "NCP"
        ? "네이버 클라우드 데브옵스 과정"
        : "AWS 클라우드 자바 웹 개발자 과정";
    setSelectedCourse(fullCourseName);
    setSelectedGeneration("전체");
    setNewStudent({ ...newStudent, curriculum: fullCourseName });
  };

  // 기수 변경 핸들러
  const handleGenerationChange = (event) =>
    setSelectedGeneration(event.target.value);

  // 검색 필터 초기화 핸들러
  const handleRefresh = () => {
    setSearchTerm("");
    setSelectedCourse("전체");
    setSelectedGeneration("전체");
  };

  // 필터링된 학생 목록
  const filteredStudents = students.filter(
    (student) =>
      student.name.includes(searchTerm) &&
      (selectedCourse === "전체" ||
        student.curriculumName === selectedCourse) &&
      (selectedGeneration === "전체" ||
        student.curriculumTh === parseInt(selectedGeneration))
  );

  // 새로운 학생 추가 핸들러
  const handleAddStudent = async () => {
    try {
      const token = getToken();

      const generation = newStudent.generation
        ? parseInt(newStudent.generation)
        : 1;
      const curriculumFullName = `${newStudent.curriculum} ${generation}기`;

      const studentData = {
        name: newStudent.name,
        gender: newStudent.gender,
        email: newStudent.email,
        phone: newStudent.phone,
        curriculumFullName: curriculumFullName,
      };

      const response = await axios.post(
        "/managers/manage-students/enroll",
        studentData,
        {
          headers: { access: token },
        }
      );

      if (response.status === 200) {
        setIsModalOpen(false);
        fetchStudents(); // 학생 목록 갱신
      } else {
        console.error("학생 등록 실패");
      }
    } catch (error) {
      console.error("학생 등록 중 오류 발생:", error);
    }
  };

  // 파일 업로드 핸들러
  const handleFileUpload = async () => {
    if (!selectedFile) {
      return;
    }
    try {
      const token = getToken();
      const formData = new FormData();
      formData.append("file", selectedFile);

      setIsProgressModalOpen(true);

      const response = await axios.post(
        "/managers/manage-students/enroll-file",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            access: token,
          },
        }
      );

      setSelectedFile(null); // 파일 선택 초기화
      setIsProgressModalOpen(false);

      swal({
        title: "업로드 성공",
        text: "파일 업로드가 완료되었습니다.",
        icon: "success",
        button: "확인",
      });
    } catch (error) {
      console.error("파일 업로드 에러:", error);
      console.error(
        "에러 상세 정보:",
        error.response ? error.response.data : "응답 없음"
      );
      setUploadProgress(0); // 업로드 진행률 초기화
      setIsProgressModalOpen(false);

      swal({
        title: "업로드 실패",
        text: "파일 업로드 중 오류가 발생했습니다.",
        icon: "error",
        button: "확인",
      });
    }
  };

  // 성별 변경
  const handleGenderChange = (gender) => {
    setNewStudent({
      ...newStudent,
      gender: gender === "남" ? "MALE" : "FEMALE",
    });
  };

  // 입력 값 변경
  const handleInputChange = (e) =>
    setNewStudent({ ...newStudent, [e.target.name]: e.target.value });

  // 파일 선택
  const handleFileChange = (e) => setSelectedFile(e.target.files[0]);

  // 학생 삭제
  const handleDeleteStudent = async () => {
    if (selectedStudents.length === 0) {
      swal({
        title: "학생 삭제",
        text: "선택된 학생이 없습니다. 삭제할 학생을 선택하세요.",
        icon: "warning",
        button: "확인",
      });
      return;
    }

    try {
      const token = getToken();
      const deletePromises = selectedStudents.map((id) =>
        axios.delete(`/managers/manage-students/${id}`, {
          headers: { "access-token": token },
        })
      );
      await Promise.all(deletePromises); // 선택된 모든 학생 삭제

      fetchStudents(); // 학생 목록 갱신
      setSelectedStudents([]); // 선택된 학생 목록 초기화

      swal({
        title: "삭제 완료",
        text: "선택된 학생이 삭제되었습니다.",
        icon: "success",
        button: "확인",
      });
    } catch (error) {
      console.error("삭제 에러:", error);

      swal({
        title: "삭제 실패",
        text: "학생 삭제 중 오류가 발생했습니다.",
        icon: "error",
        button: "확인",
      });
    }
  };

  // 체크박스 선택
  const handleCheckboxChange = (studentId) =>
    setSelectedStudents(
      selectedStudents.includes(studentId)
        ? selectedStudents.filter((id) => id !== studentId)
        : [...selectedStudents, studentId]
    );

  // 테이블 행 클릭 (학생 상세 페이지 이동)
  const handleRowClick = (studentId) => {
    window.location.href = `/managers/manage-students/${studentId}`;
  };

  // 파일 선택
  const handleRemoveFile = () => {
    setSelectedFile(null);
    setUploadProgress(0);
  };

  // 선택된 교육 과정에 따른 기수 필터링
  const filteredGenerations =
    curriculums.find(
      (curriculum) =>
        curriculum.type ===
        (selectedCourse === "네이버 클라우드 데브옵스 과정" ? "NCP" : "AWS")
    )?.th || [];

  return (
    <div className="student-management">
      <h1>학생 관리</h1>
      {isLoading ? (
        <p>로딩 중...</p>
      ) : (
        <>
          <div className="student-controls">
            <div className="student-program-buttons">
              <button
                className={`student-course-button ${
                  selectedCourse === "네이버 클라우드 데브옵스 과정"
                    ? "selected"
                    : ""
                }`}
                onClick={() => handleCourseChange("NCP")}
              >
                <img
                  src={process.env.PUBLIC_URL + "/images/curriculum/ncp.png"}
                  alt="NCP"
                  className="course-logo"
                />
              </button>
              <button
                className={`student-course-button ${
                  selectedCourse === "AWS 클라우드 자바 웹 개발자 과정"
                    ? "selected"
                    : ""
                }`}
                onClick={() => handleCourseChange("AWS")}
              >
                <img
                  src={process.env.PUBLIC_URL + "/images/curriculum/aws.png"}
                  alt="AWS"
                  className="course-logo"
                />
              </button>
              <select
                value={selectedGeneration}
                onChange={handleGenerationChange}
              >
                <option value="전체">전체</option>
                {filteredGenerations.map((th) => (
                  <option key={`${th}`} value={th}>{`${th}기`}</option>
                ))}
              </select>
            </div>
            <div className="student-search-container">
              <div className="student-search-wrapper">
                <input
                  type="text"
                  placeholder="검색"
                  value={searchTerm}
                  onChange={handleSearch}
                />
                <i className="fas fa-search student-search-icon"></i>
              </div>
              <button
                onClick={handleRefresh}
                className="student-refresh-button"
              >
                <i className="fas fa-sync"></i>
              </button>
            </div>
          </div>
          <div className="student-table-container">
            <table>
              <thead>
                <tr>
                  <th></th>
                  <th>번호</th>
                  <th>교육 과정명</th>
                  <th>기수</th>
                  <th>이름</th>
                  <th>성별</th>
                  <th>이메일</th>
                  <th>전화번호</th>
                  <th>출석 여부</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student, index) => (
                    <tr
                      key={index}
                      onClick={() => handleRowClick(student.studentId)}
                      className={
                        selectedStudents.includes(student.studentId)
                          ? "selected"
                          : ""
                      }
                    >
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedStudents.includes(student.studentId)}
                          onChange={() =>
                            handleCheckboxChange(student.studentId)
                          }
                          onClick={(e) => e.stopPropagation()}
                        />
                      </td>
                      <td>{index + 1}</td>
                      <td>{student.curriculumName}</td>
                      <td>{student.curriculumTh}</td>
                      <td>{student.name}</td>
                      <td>{student.gender === "MALE" ? "남" : "여"}</td>
                      <td>{student.email}</td>
                      <td>{student.phone}</td>
                      <td>
                        {student.attend === true ? (
                          <span className="status present">✔</span>
                        ) : (
                          <span className="status absent">✘</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9">등록된 학생이 없습니다</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="student-actions">
            <button onClick={() => setIsModalOpen(true)}>학생 등록</button>
            <button onClick={handleDeleteStudent}>학생 삭제</button>
          </div>
        </>
      )}
      <ManagerModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <span className="add_title">학생 등록</span>
        <div className="student-form-container">
          <label className="student-excel-label">엑셀 파일 첨부 </label>
          <div className="student-file-upload">
            {selectedFile ? (
              <div className="student-file-preview">
                <i className="fa-regular fa-file"></i>
                <span>{selectedFile.name}</span>
                <button
                  className="student-file-remove-button"
                  onClick={handleRemoveFile}
                >
                  삭제
                </button>
              </div>
            ) : (
              <>
                <label
                  htmlFor="file-upload"
                  className="student-custom-file-upload"
                >
                  파일 선택
                </label>
                <input
                  id="file-upload"
                  type="file"
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                />
              </>
            )}
          </div>
          <div className="student-modal-file">
            <button
              className="student-modal-file-button"
              onClick={handleFileUpload}
            >
              파일 업로드
            </button>
            <button
              className="student-modal-button"
              onClick={() => setIsModalOpen(false)}
            >
              등록 취소
            </button>
          </div>
          <span className="student-file-line" />
          <div className="student-course-selection">
            <button
              className={`student-course-button ${
                newStudent.curriculum === "네이버 클라우드 데브옵스 과정"
                  ? "selected"
                  : ""
              }`}
              onClick={() =>
                setNewStudent({
                  ...newStudent,
                  curriculum: "네이버 클라우드 데브옵스 과정",
                })
              }
            >
              NCP
            </button>
            <button
              className={`student-course-button ${
                newStudent.curriculum === "AWS 클라우드 자바 웹 개발자 과정"
                  ? "selected"
                  : ""
              }`}
              onClick={() =>
                setNewStudent({
                  ...newStudent,
                  curriculum: "AWS 클라우드 자바 웹 개발자 과정",
                })
              }
            >
              AWS
            </button>
          </div>
          <div className="student-generation-selection">
            <select
              name="generation"
              value={newStudent.generation}
              onChange={handleInputChange}
            >
              {(newStudent.curriculum === "네이버 클라우드 데브옵스 과정"
                ? curriculums.find((curriculum) => curriculum.type === "NCP")
                    ?.th
                : curriculums.find((curriculum) => curriculum.type === "AWS")
                    ?.th || []
              ).map((th) => (
                <option key={`${th}`} value={th}>{`${th}기`}</option>
              ))}
            </select>
          </div>
          <div className="student-input-group">
            <label>이름</label>
            <input
              type="text"
              name="name"
              value={newStudent.name}
              onChange={handleInputChange}
            />
          </div>
          <div className="student-gender-selection">
            <label className="student-gender-label">성별</label>
            <div className="student-gender-buttons">
              <button
                className={`student-gender-button ${
                  newStudent.gender === "MALE" ? "selected" : ""
                }`}
                onClick={() => handleGenderChange("남")}
              >
                남
              </button>
              <button
                className={`student-gender-button ${
                  newStudent.gender === "FEMALE" ? "selected" : ""
                }`}
                onClick={() => handleGenderChange("여")}
              >
                여
              </button>
            </div>
          </div>
          <div className="student-input-group">
            <label>이메일</label>
            <input
              type="email"
              name="email"
              value={newStudent.email}
              onChange={handleInputChange}
            />
          </div>
          <div className="student-input-group">
            <label>전화번호</label>
            <input
              type="text"
              name="phone"
              value={newStudent.phone}
              onChange={handleInputChange}
            />
          </div>
          <div className="student-modal-actions">
            <button className="student-modal-button" onClick={handleAddStudent}>
              학생 등록
            </button>
            <button
              className="student-modal-button"
              onClick={() => setIsModalOpen(false)}
            >
              등록 취소
            </button>
          </div>
        </div>
      </ManagerModal>
      <ProgressModal
        isOpen={isProgressModalOpen}
        onClose={() => setIsProgressModalOpen(false)}
        setUploadProgress={setUploadProgress}
      />
    </div>
  );
};

export default StudentManagement;