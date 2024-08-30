import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../../../utils/axios';
import './ManagerCalendarDetail.css';
import ManagerCalendar from './ManagerCalendar';
import swal from "sweetalert";

const ManagerCalendarDetail = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [curriculums, setCurriculums] = useState([]);
  const [colorAssignments, setColorAssignments] = useState({}); // 이벤트 ID와 색상 매핑

  // 색상 배열 정의
  const colors = [
    "#F3C41E", "#F58D11", "#B85B27", "#A90C57", "#F45CE5",
    "#AE59F0", "#0A8735", "#6F961E", "#19E308", "#1D1AA6",
    "#20CFF5", "#98B3E5"
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 교육 과정 정보 가져오기
        const curriculumResponse = await axios.get('/managers/calendar/modal');
        setCurriculums(curriculumResponse.data);

        // 로컬 스토리지에서 이벤트 데이터를 가져옴
        const storedEvents = JSON.parse(localStorage.getItem('calendarEvents')) || [];
        setEvents(storedEvents);

        // 각 이벤트에 대해 색상 할당
        const initialColorAssignments = {};
        storedEvents.forEach((e, index) => {
          initialColorAssignments[e.id] = colors[index % colors.length];
        });
        setColorAssignments(initialColorAssignments);

        const foundEvent = storedEvents.find((e) => e.id === Number(eventId));
        if (foundEvent) {
          setEvent(foundEvent);
          setSelectedEvent(foundEvent);
        } else {
          navigate('/managers'); // 이벤트가 없으면 매니저 페이지로 리다이렉트
        }
      } catch (error) {
        console.error('데이터 가져오기 실패:', error);
      }
    };

    fetchData();
  }, [eventId, navigate]);

  // 특정 날짜에 해당하는 이벤트 가져오기
  const getEventsForDate = (date) => {
    return events.filter(event =>
      new Date(event.startDate).toDateString() === date.toDateString() ||
      (new Date(event.startDate) <= date && new Date(event.endDate) >= date)
    );
  };

  // 이벤트 삭제 핸들러
  const handleDeleteEvent = (id) => {
    swal({
      title: "삭제하시겠습니까?",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    }).then((willDelete) => {
      if (willDelete) {
        axios.delete(`/managers/calendar/${id}`)
          .then((response) => {
            if (response.status === 200) {
              const updatedEvents = events.filter((e) => e.id !== id);
              localStorage.setItem('calendarEvents', JSON.stringify(updatedEvents));
              setEvents(updatedEvents);

              if (selectedEvent && selectedEvent.id === id) {
                setSelectedEvent(null);
                setEditMode(false);
              }

              swal("일정이 성공적으로 삭제되었습니다!", {
                icon: "success",
              });
            } else {
              swal("일정 삭제에 실패했습니다.", {
                icon: "error",
              });
            }
          })
          .catch((error) => {
            console.error('DB에서 이벤트 삭제 실패:', error);
            swal("일정 삭제에 실패했습니다.", {
              icon: "error",
            });
          });
      }
    });
  };

  // 이벤트 수정 핸들러
  const handleEditEvent = (evt) => {
    setSelectedEvent(evt);
    setEditMode(true);
  };

  // 이벤트 저장 핸들러
  const handleSaveEvent = () => {
    swal({
      title: "변경 사항을 저장하시겠습니까?",
      icon: "info",
      buttons: true,
    }).then((willSave) => {
      if (willSave) {
        const updatedEvents = events.map((e) => e.id === selectedEvent.id ? selectedEvent : e);
        localStorage.setItem('calendarEvents', JSON.stringify(updatedEvents));
        setEvents(updatedEvents);
        setEvent(selectedEvent);
        setEditMode(false);
        swal("변경 사항이 성공적으로 저장되었습니다!", {
          icon: "success",
        });
      }
    });
  };

  // 입력값 변경 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setSelectedEvent({ ...selectedEvent, [name]: value });
  };

  // 날짜 클릭 핸들러
  const handleDayClick = (date) => {
    setSelectedDate(date);
    setSelectedEvent(null);
    setEditMode(false);
  };

  // 이벤트나 커리큘럼이 로드되지 않았을 때 로딩 상태 표시
  if (!event || curriculums.length === 0) {
    return <div>Loading...</div>;
  }

  return (
    <div className="detail-calendar-detail-page">
      <div className="detail-calendar-detail-sidebar">
        <ManagerCalendar events={events} onDayClick={handleDayClick} />
      </div>
      <div className="detail-calendar-detail-container">
        <div className="detail-calendar-detail-header">
          <h2>일정 관리</h2>
          <button onClick={() => navigate("/managers")}>돌아가기</button>
        </div>
        <div className="detail-calendar-detail-content">
          <div className="detail-all-events">
            <ul>
              {getEventsForDate(selectedDate || new Date(event.startDate)).map((evt, index) => (
                <li key={evt.id} className="detail-event-item">
                  <div className="detail-event-info">
                    <div className="detail-event-title-container">
                      <div className="detail-event-color" style={{ backgroundColor: colorAssignments[evt.id] }}></div>
                      <span className="detail-event-title" style={{ color: colorAssignments[evt.id] }}>
                        {evt.title}
                      </span>
                      <div className="detail-event-actions">
                        <button onClick={() => handleEditEvent(evt)}>
                          <i className="fas fa-pencil-alt"></i>
                        </button>
                        <button onClick={() => handleDeleteEvent(evt.id)}>
                          <i className="fas fa-trash-alt"></i>
                        </button>
                      </div>
                    </div>
                    <div className="detail-event-dates">
                      <p><strong>시작일:</strong> {new Date(evt.startDate).toLocaleDateString()}</p>
                      <p><strong>종료일:</strong> {new Date(evt.endDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {editMode && selectedEvent && (
            <div className="detail-event-edit">
              <input
                type="text"
                name="title"
                value={selectedEvent.title}
                onChange={handleChange}
                className="detail-event-title-input"
                style={{ color: colorAssignments[selectedEvent.id] }}
              />
              <input
                type="date"
                name="startDate"
                value={new Date(selectedEvent.startDate).toISOString().substr(0, 10)}
                onChange={handleChange}
                className="detail-event-date-input"
              />
              <input
                type="date"
                name="endDate"
                value={new Date(selectedEvent.endDate).toISOString().substr(0, 10)}
                onChange={handleChange}
                className="detail-event-date-input"
              />
              <div className="detail-event-actions-edit">
                <button onClick={handleSaveEvent}>저장<i className="fas fa-save"></i></button>
                <button onClick={() => setEditMode(false)}>취소</button>
                <button onClick={() => handleDeleteEvent(selectedEvent.id)}>삭제<i className="fas fa-trash-alt"></i></button>
              </div>
            </div>
          )}
        </div>
        <div className="detail-calendar-legend">
          <h3>교육 과정 색상</h3>
          <ul>
            {curriculums.map(curriculum => (
              <li key={curriculum.id}>
                <div
                  className="curriculum-color-box"
                  style={{ backgroundColor: curriculum.color }}
                ></div>
                {curriculum.name}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ManagerCalendarDetail;
