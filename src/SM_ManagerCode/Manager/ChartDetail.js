import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "../../utils/axios";
import { Radar } from "react-chartjs-2"; //chart 라이브러리 설정
import "chart.js/auto";
import "./ChartDetail.css";

const ChartDetail = () => {
  const { curriculumId, surveyId } = useParams();
  const [surveyTitle, setSurveyTitle] = useState("");
  const [choiceResponses, setChoiceResponses] = useState([]);
  const [textResponses, setTextResponses] = useState([]);
  const [error, setError] = useState(null);

  // 로컬 스토리지에서 access-token을 가져오는 함수
  const getToken = () => localStorage.getItem("access-token");

  useEffect(() => {
    // 비동기 데이터 fetch 함수
    const fetchData = async () => {
      try {
        const token = getToken(); // 토큰 가져오기
        const config = { headers: { access: token } };

        // 설문조사 기본 정보 가져오기
        const surveyResponse = await axios.get(
          `/managers/curriculum/${curriculumId}/survey/${surveyId}/basic`,
          config
        );
        setSurveyTitle(surveyResponse.data.surveyTitle); // 설문조사 제목 설정

        // 객관식 응답 데이터 가져오기
        const choiceResponse = await axios.get(
          `/managers/curriculum/${curriculumId}/survey/${surveyId}/choice-response`,
          config
        );
        setChoiceResponses(choiceResponse.data); // 객관식 응답 데이터 설정

        // 주관식 응답 데이터 가져오기
        const textResponse = await axios.get(
          `/managers/curriculum/${curriculumId}/survey/${surveyId}/text-response`,
          config
        );
        setTextResponses(textResponse.data.content); // 주관식 응답 데이터 설정
      } catch (error) {
        setError("데이터 가져오기 오류"); // 오류 발생 시 메시지 설정
        console.error("Error fetching data for ChartDetail:", error);
      }
    };

    fetchData(); // 마운트 될 때 마다 데이터 fetch 실행
  }, [curriculumId, surveyId]); // curriculumId 와 surveyId가 변경될 때마다 useEffect 실행

  // 데이터 로딩 및 오류 처리
  if (error) return <div>{error}</div>;
  if (!choiceResponses.length) return <div>로딩 중...</div>;

  // 레이더 차트 옵션 설정
  const radarOptions = {
    scales: {
      r: {
        angleLines: { display: false },
        suggestedMin: 0,
        suggestedMax: 3,
        ticks: {
          display: false,
          stepSize: 1,
        },
        pointLabels: {
          font: {
            size: 14,
          },
          color: "#000",
        },
        grid: {
          color: "#ccc",
        },
      },
    },
    plugins: {
      legend: { display: false }, // 범례 비활성화
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            const value = tooltipItem.raw;
            return `${value} 명`; //  응답 수 표시
          },
        },
      },
      datalabels: {
        display: false,
      },
    },
    elements: {
      line: {
        borderWidth: 2,
        borderColor: "#555",
        backgroundColor: "rgba(0, 0, 0, 0.2)", // 차트 색상 설정
      },
      point: {
        radius: 3,
        backgroundColor: "#fff",
        borderColor: "#000",
      },
    },
  };

  // 레이더 차트 데이터를 생성하는 함수
  const createRadarData = (choice) => {
    const filteredData = [];
    const labels = ["1", "2", "3", "4", "5"];

    // 각 응답 수를 필터링하여 데이터 배열에 추가
    labels.forEach((label, index) => {
      const value = choice.scoreResponseCount[index + 1];
      if (value !== undefined && value !== null) {
        filteredData.push(value);
      }
    });

    return {
      labels: labels.slice(0, filteredData.length),
      datasets: [
        {
          label: "",
          data: filteredData, // 레이더 차트 데이터 설정
          fill: true,
        },
      ],
    };
  };

  return (
    <div className="chart-detail-container">
      <h1 className="chart-survey-title">{surveyTitle}</h1>
      <div className="chart-survey-content">
        <div className="objective-survey">
          <h2>객관식 만족도 조사</h2>
          <div className="radar-charts">
          {/* 객관식 질문 내용 */}
            {choiceResponses.map((choice, index) => (
              <div key={index} className="radar-chart-wrapper">
                <h3>{choice.content}</h3>
                <Radar
                  data={createRadarData(choice, index)}
                  options={radarOptions} // 레이더 차트 렌더링
                />
              </div>
            ))}
          </div>
        </div>
        <div className="subjective-survey">
          <h2>주관식 만족도 조사</h2>
          <div className="text-response-section">
            {textResponses && textResponses.length > 0 ? (
              <>
                <h3>소감 및 개선 사항에 대한 의견</h3>
                {/* 주관식 응답 내용 */}
                <div className="text-response-list">
                  {textResponses.slice(0, 6).map((response, index) => (
                    <div key={index} className="text-response-card">
                      <p>{response}</p>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-response-card">주관식 응답이 없습니다.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChartDetail;
