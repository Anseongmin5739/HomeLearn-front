import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "../../utils/axios";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import "./SurveyDetail.css";
import swal from "sweetalert";

// Chart.js 모듈
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const SurveyDetail = () => {
  //  curriculumId와 surveyId를 가져옴
  const { curriculumId, surveyId } = useParams();
  const navigate = useNavigate();

  const [surveyDetails, setSurveyDetails] = useState(null); // 현재 진행 중인 설문 조사
  const [curriculumSimple, setCurriculumSimple] = useState(null);
  const [endedSurveys, setEndedSurveys] = useState([]); // 종료된 설문 조사
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const getToken = () => localStorage.getItem("access-token");

  // 컴포넌트가 마운트될 때 데이터를 fetch
  useEffect(() => {
    const fetchSurveyData = async () => {
      try {
        const token = getToken();
        const config = { headers: { access: token } };

        // 여러 API 요청을 병렬로 처리
        const [
          surveyResponse, // 현재 진행 중인 설문 조사 정보
          curriculumResponse, // 교육 과정 간략 정보
          endedSurveysResponse, // 종료된 설문 조사 목록
        ] = await Promise.all([
          axios.get(`/managers/curriculum/${curriculumId}/survey-status/progress`, config),
          axios.get(`/managers/curriculum/${curriculumId}/survey-status/curriculum-simple`, config),
          axios.get(`/managers/curriculum/${curriculumId}/survey-status/end`, config),
        ]);

        // 서버에서 받은 데이터를 상태에 저장
        setSurveyDetails(surveyResponse.data);
        setCurriculumSimple(curriculumResponse.data);
        setEndedSurveys(endedSurveysResponse.data);
      } catch (error) {
        setError(error.response?.data || "데이터 가져오기 오류");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSurveyData();
  }, [curriculumId]); // curriculumId가 변경될 때마다 실행

  // 설문 마감
  const handleSurveyEnd = async () => {
    try {
      // 현재 설문 정보가 없거나 surveyId가 없으면 메시지 표시
      if (!surveyDetails || !surveyDetails.surveyId) {
        swal("등록 실패", "설문 조사 ID를 찾을 수 없습니다.", "warning");
        return;
      }

      const token = getToken();
      const config = { headers: { access: token } };

      // 설문 마감
      const response = await axios.post(
        `/managers/manage-curriculums/survey-stop/${surveyDetails.surveyId}`,
        {},
        config
      );

      if (response.status === 200) {
        // 설문 마감 후, 종료된 설문 조사 목록을 가져옴
        const endedSurveysResponse = await axios.get(
          `/managers/curriculum/${curriculumId}/survey-status/end`,
          config
        );
        setEndedSurveys(endedSurveysResponse.data);

        // 현재 설문 조사 정보를 초기화하여, 설문이 종료되었음을 UI에 반영
        setSurveyDetails(null);
        swal("설문 마감", "설문 조사가 성공적으로 마감되었습니다.", "success");

        // 이전 페이지로 이동
        navigate(-1);
      } else {
        swal("설문 마감 오류", "설문 마감 중 오류가 발생했습니다.", "error");
      }
    } catch (error) {
      console.error("설문 마감 중 오류 발생:", error);
      swal("등록 실패", "설문 마감 중 오류가 발생했습니다.", "warning");
    }
  };
  if (isLoading) return <div>로딩 중...</div>;

  if (error) return <div>오류 발생: {error}</div>;

  // 설문조사가 없는 경우 처리
  if (!surveyDetails) {
    return (
      <div className="survey-detail">
        <div className="survey-detail-title">
          <h2>{curriculumSimple?.name} <span>{curriculumSimple?.th}기</span></h2>
        </div>
        <div className="survey-content">
          <p>진행 중인 설문 조사가 없습니다.</p>
          <div className="survey-card-end completed-surveys">
            <h3>종료된 설문 조사</h3>
            <div className="completed-surveys-list">
              {endedSurveys.length > 0 ? (
                endedSurveys.map((survey, index) => (
                  <div key={index} className="completed-survey-item">
                    <Link to={`/managers/curriculum/${curriculumId}/survey/${survey.surveyId}/basic`} className="survey-info-title">
                      {survey.title}
                    </Link>
                    <p className="survey-count">
                      <i className="fa-solid fa-user"></i>{survey.completed}/{survey.total}
                    </p>
                  </div>
                ))
              ) : (
                <p>종료된 설문 조사가 없습니다.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 설문조사에 응답한 학생 수
  const chartData = {
    labels: [surveyDetails.title],
    datasets: [
      {
        label: "응답한 학생 수",
        data: [surveyDetails.completed], // 응답한 학생 수를 데이터로 사용
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    scales: {
      y: {
        beginAtZero: true,
        max: Math.max(surveyDetails.total, surveyDetails.completed) + 1, //최대 학생 수에서 +1 여유값 표시
        ticks: {
          stepSize: 1, // 정수 단위로 y축 표시
        },
      },
    },
  };

  return (
    <div className="survey-detail">
      <div className="survey-detail-title">
        <h2>
          {curriculumSimple.name} <span>{curriculumSimple.th}기</span>
        </h2>
      </div>
      <div className="survey-content">
        <div className="left-container">
          <div className="survey-card active-survey">
            <h3>진행 중인 설문 조사</h3>
            <div className="survey-info">
              <Link to={`/managers/curriculum/${curriculumId}/survey/${surveyDetails.surveyId}/basic`} className="survey-info-title">
                {surveyDetails.title}
              </Link>
              <div className="survey-info-title-right-title">
                <p className="survey-count">
                  <i className="fa-solid fa-user"></i>
                  {surveyDetails.completed}/{surveyDetails.total}
                </p>
                <button className="survey-end-button" onClick={handleSurveyEnd}>
                  설문 마감
                </button>
              </div>
            </div>
          </div>
          <div className="survey-chart">
            <h3>설문 조사 추이</h3>
            <Bar data={chartData} options={chartOptions} />
          </div>
        </div>
        <div className="right-container">
          <div className="survey-card-end completed-surveys">
            <h3>종료된 설문 조사</h3>
            <div className="completed-surveys-list">
              {endedSurveys.length > 0 ? (
                endedSurveys.map((survey, index) => (
                  <div key={index} className="completed-survey-item">
                    <Link to={`/managers/curriculum/${curriculumId}/survey/${survey.surveyId}/basic`} className="survey-info-title">
                      {survey.title}
                    </Link>
                    <p className="survey-count">
                      <i className="fa-solid fa-user"></i>
                      {survey.completed}/{survey.total}
                    </p>
                  </div>
                ))
              ) : (
                <p>종료된 설문 조사가 없습니다.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SurveyDetail;
