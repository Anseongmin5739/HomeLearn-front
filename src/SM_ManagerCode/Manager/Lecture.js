import React, { useState, useEffect } from 'react';
import axios from '../../utils/axios';
import './Lecture.css';
import { Link } from 'react-router-dom';

const Lecture = () => {
  const [activeButton, setActiveButton] = useState('NCP'); // 버튼 변수
  const [lectures, setLectures] = useState([]); // 강의 데이터 상태

  // 토큰을 가져오기
  const getToken = () => localStorage.getItem('access-token');

  // 강의 데이터
  const fetchLectures = async (type) => {
    try {
      const token = getToken();
      const response = await axios.get(`/managers/manage-curriculums/${type}`, {
        headers: { access: token },
      });
      setLectures(response.data || []);
    } catch (error) {
      console.error('에러 메시지:', error);
    }
  };

  useEffect(() => {
    fetchLectures(activeButton); // 컴포넌트가 마운트될 때 데이터를 가져옴
  }, [activeButton]);

  const handleButtonClick = (buttonName) => {  // 버튼 클릭 시
    setActiveButton(buttonName);
  };

  return (
    <div className="lecture-progress">
      <div className="lecture-progress-header">
        <h2 className="lecture-progress-title">교육 과정 현황</h2>
        <div className="lecture-progress-buttons">
          <button
            className={activeButton === 'NCP' ? 'active' : ''}
            onClick={() => handleButtonClick('NCP')}
          >
            NCP
          </button>
          <button
            className={activeButton === 'AWS' ? 'active' : ''}
            onClick={() => handleButtonClick('AWS')}
          >
            AWS
          </button>
        </div>
      </div>
      <ul className="lecture-list">
        {lectures.map((lecture) => (
          <li key={lecture.id} className="lecture-item">
            <div className="lecture-info">
              <span className="lecture-id">{lecture.th}기</span>
              <Link to={`/managers/manage-curriculums/${lecture.id}`} className="lecture-title">{lecture.name}</Link>
            </div>
            <div className="lecture-details">
              <div className="lecture-teacher">
                <span className="lecture-teacher-name">강사 {lecture.teacherName}</span>
              </div>
              <span className="lecture-participants">
                <i className="fas fa-user"></i> {lecture.attendance} / {lecture.total}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Lecture;
