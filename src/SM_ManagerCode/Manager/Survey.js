import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from '../../utils/axios';
import './Survey.css';

const Survey = () => {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
    //설문조사 정보 가져오기
  useEffect(() => {
    const fetchSurveys = async () => {
      try {
        const response = await axios.get('/managers/dash-boards/survey');
        setSurveys(response.data);
      } catch (error) {
        console.error('설문조사 정보를 가져오는데 실패했습니다.', error);
      } finally {
        setLoading(false); // 로딩 상태 해제
      }
    };

    fetchSurveys();
  }, []);

  return (
    <div className="setting-list">
      <div className="setting-list-header">
        <h2>설문 조사</h2>
      </div>
      <ul className="survey-list">
        {loading ? (
          <li>로딩 중...</li>
        ) : surveys.length === 0 ? (
          <li>설문조사가 없습니다.</li>
        ) : (
          surveys.map(survey => (
            <li key={survey.id} className="survey-item">
              <div className="survey-info">
                <span className="survey-id">{survey.th}기</span>
                <div className="survey-details">
                  <Link to={`/managers/curriculum/${survey.th}/survey/${survey.id}/detail`} className="survey-title-dash">
                    {survey.title}
                  </Link>
                </div>
              </div>
              <div className="survey-status">
                <div className="survey-check">{survey.isCompleted ? '완료' : '진행중'}</div>
                <span className="survey-participants">
                  <i className="fa-solid fa-user"></i> {survey.participants}/{survey.total}
                </span>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default Survey;
