import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../../../utils/axios'; // axios 임포트
import './ManagerCalendarDetail.css';
import ManagerCalendar from './ManagerCalendar';
import swal from "sweetalert";

const CalendarDetail = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [curriculums, setCurriculums] = useState([]); // 커리큘럼 상태 추가

  const predefinedColors = ['#FF9999', '#99FF99', '#9999FF'];

  useEffect(() => {
    const storedEvents = JSON.parse(localStorage.getItem('calendarEvents')) || [];
    setEvents(storedEvents);
    const foundEvent = storedEvents.find((e) => e.id === Number(eventId));
    setEvent(foundEvent);
    setSelectedEvent(foundEvent);

    // 커리큘럼 정보 가져오기
    const fetchCurriculums = async () => {
      try {
        const response = await axios.get('/managers/calendar/modal');
        setCurriculums(response.data);
      } catch (error) {
        console.error('커리큘럼 정보 가져오기 실패:', error);
      }
    };

    fetchCurriculums();
  }, [eventId]);

  const getEventsForDate = (date) => {
    return events.filter(event =>
      new Date(event.startDate).toDateString() === date.toDateString() ||
      (new Date(event.startDate) <= date && new Date(event.endDate) >= date)
    );
  };

  if (!event) {
    return navigate('/managers');
  }

  const handleDeleteEvent = (id) => {
    swal({
      title: "삭제하시겠습니까?",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    }).then((willDelete) => {
      if (willDelete) {
        const updatedEvents = events.filter((e) => e.id !== id);
        localStorage.setItem('calendarEvents', JSON.stringify(updatedEvents));
        setEvents(updatedEvents);
        if (id === selectedEvent.id) {
          setSelectedEvent(null);
          setEditMode(false);
        }
        swal("일정이 성공적으로 삭제되었습니다!", {
          icon: "success",
        });
      }
    });
  };

  const handleEditEvent = (evt) => {
    setSelectedEvent(evt);
    setEditMode(true);
  };

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSelectedEvent({ ...selectedEvent, [name]: value });
  };

  const handleDayClick = (date) => {
    setSelectedDate(date);
    setSelectedEvent(null);
    setEditMode(false);
  };

  const getCurriculumColor = (curriculumId) => {
    const curriculum = curriculums.find(c => c.id === curriculumId);
    return curriculum ? curriculum.color : '#ffffff'; // 기본값으로 흰색 설정
  };

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
              {getEventsForDate(selectedDate || new Date(event.startDate)).map((evt) => (
                <li key={evt.id} className="detail-event-item">
                  <div className="detail-event-color" style={{ backgroundColor: getCurriculumColor(evt.curriculumId) }}></div>
                  <div className="detail-event-info">
                    <div className="detail-event-title-container">
                      <span className="detail-event-title">{evt.title}</span>
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
              <div className="detail-event-color-picker">
                {predefinedColors.map(color => (
                  <div
                    key={color}
                    className={`color-option ${selectedEvent.color === color ? 'selected' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => setSelectedEvent({ ...selectedEvent, color })}
                  ></div>
                ))}
              </div>
              <input
                type="text"
                name="title"
                value={selectedEvent.title}
                onChange={handleChange}
                className="detail-event-title-input"
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
                <button onClick={() => handleDeleteEvent(selectedEvent.id)}>삭제<i className="fas fa-trash-alt"></i></button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalendarDetail;
