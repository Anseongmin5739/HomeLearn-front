import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaCalendarPlus } from "react-icons/fa";
import axios from "../../../utils/axios";
import "./ManagerCalendar.css";
import ManagerModal from "../../Modal/ManagerModal/ManagerModal";

const ManagerCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [events, setEvents] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [curriculums, setCurriculums] = useState([]);
  const [newEvent, setNewEvent] = useState({
    title: "",
    startDate: null,
    endDate: null,
    curriculumId: "", // 기수 선택을 위한 필드
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const getToken = () => localStorage.getItem("access-token");

  // 교육과정 정보 가져오기
  useEffect(() => {
    const fetchCurriculums = async () => {
      try {
        const token = getToken();
        // NCP 및 AWS 커리큘럼 정보 가져오기
        const ncpResponse = await axios.get(
          "/managers/manage-curriculums/NCP",
          {
            headers: { access: token },
          }
        );
        const awsResponse = await axios.get(
          "/managers/manage-curriculums/AWS",
          {
            headers: { access: token },
          }
        );
        // 두 커리큘럼 정보를 하나로 합침
        const combinedCurriculums = [...ncpResponse.data, ...awsResponse.data];
        setCurriculums(combinedCurriculums); // 상태 업데이트
      } catch (error) {
        console.error("커리큘럼 정보 가져오기 실패:", error);
      }
    };

    fetchCurriculums(); // 커리큘럼 정보 가져오기 실행
  }, []);

  useEffect(() => {
    const storedEvents =
      JSON.parse(localStorage.getItem("calendarEvents")) || [];
    setEvents(storedEvents);
  }, []);

  useEffect(() => {
    localStorage.setItem("calendarEvents", JSON.stringify(events));
  }, [events]);

  // 공휴일 정보
  useEffect(() => {
    const fetchHolidays = async () => {
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, "0");
      const serviceKey =
        "t21Zxd4T5l%2FCFpu9dpVZ2U4nEIv06W14hNeu7Op7HA0yIBHYgMu23%2FL6JHBWQ%2Bp9HNG%2B93RJwgq7zANzmn%2B2%2BA%3D%3D";
      const url = `http://apis.data.go.kr/B090041/openapi/service/SpcdeInfoService/getHoliDeInfo?serviceKey=${serviceKey}&pageNo=1&numOfRows=100&solYear=${year}&solMonth=${month}`;

      try {
        const response = await fetch(url);
        if (response.ok) {
          const responseText = await response.text();
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(
            responseText,
            "application/xml"
          );
          const items = xmlDoc.getElementsByTagName("item");
          const holidays = Array.from(items)
            .map((item) => {
              const locdate =
                item.getElementsByTagName("locdate")[0].textContent;
              return locdate;
            })
            .filter((date) => { // 제헌절 빼기
              const monthDay = date.substr(4, 4);
              return monthDay !== "0717";
            });
          setHolidays(holidays); // 공휴일 상태 업데이트
        } else {
          console.error("공휴일 데이터 가져오기 실패:", response.statusText);
        }
      } catch (error) {
        console.error("공휴일 데이터 가져오는 중 오류:", error);
      }
    };

    fetchHolidays(); // 공휴일 정보 가져오기 실행
  }, [currentDate]);

  // 현재 달의 날짜 생성
  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();
  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay();

  // 달력에 표시될 날짜
  const generateCalendarDates = () => {
    const dates = [];
    const prevMonthLastDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      0
    );
    const nextMonthFirstDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      1
    );

    // 이전 달 마지막 날들 추가
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      dates.push({
        date: new Date(
          prevMonthLastDate.getFullYear(),
          prevMonthLastDate.getMonth(),
          prevMonthLastDate.getDate() - i
        ),
        isCurrentMonth: false,
      });
    }

    // 현재달 날짜 추가
    for (let i = 1; i <= daysInMonth; i++) {
      dates.push({
        date: new Date(currentDate.getFullYear(), currentDate.getMonth(), i),
        isCurrentMonth: true,
      });
    }

    // 다음달 날짜 추가
    const remainingDays = 7 - (dates.length % 7);
    if (remainingDays < 7) {
      for (let i = 0; i < remainingDays; i++) {
        dates.push({
          date: new Date(
            nextMonthFirstDate.getFullYear(),
            nextMonthFirstDate.getMonth(),
            i + 1
          ),
          isCurrentMonth: false,
        });
      }
    }

    return dates; // 생성된 날짜 리스트 반환
  };

  // 월 변경
  const handleMonthChange = (direction) => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1)
    );
  };

  const handleOpenModal = () => {
    setNewEvent({
      title: "",
      startDate: selectedDate,
      endDate: selectedDate,
      curriculumId: "", // 기수 필드 초기화
    });
    setIsModalOpen(true);
  };

  // 모달 닫기 핸들러
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setNewEvent({
      title: "",
      startDate: null,
      endDate: null,
      curriculumId: "", // 기수 필드 초기화
    });
  };

  // 저장
  const handleSaveEvent = async () => {
    if (newEvent.title && newEvent.startDate) {
      try {
        const eventToSave = {
          ...newEvent,
          startDate: new Date(newEvent.startDate),
          endDate: newEvent.endDate ? new Date(newEvent.endDate) : null,
        };

        const response = await axios.post("/managers/calendar", eventToSave);
        if (response.status === 200) {
          setEvents([...events, { ...eventToSave, id: Date.now() }]);
          handleCloseModal();
        } else {
          console.error("일정 등록 실패:", response.statusText);
        }
      } catch (error) {
        console.error("일정 등록 중 오류 발생:", error);
      }
    }
  };

  // 날짜 클릭
  const handleDateClick = (date) => {
    const adjustedDate = new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
    );
    setSelectedDate(adjustedDate);
    const eventsForDate = getEventsForDate(date);

    if (eventsForDate.length > 0) {
      navigate(`/managers/calendar/${eventsForDate[0].id}`);
    }
  };

  // 특정 날짜
  const getEventsForDate = (date) => {
    return events.filter(
      (event) =>
        new Date(event.startDate).toDateString() === date.toDateString() ||
        (new Date(event.startDate) <= date && new Date(event.endDate) >= date)
    );
  };

  // 오늘 날짜 확인
  const isCurrentDate = (date) => {
    const today = new Date();
    return (
      date &&
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  // 공휴일 확인
  const isHoliday = (date) => {
    return holidays.some((holiday) => {
      const holidayDate = new Date(
        holiday.substr(0, 4),
        holiday.substr(4, 2) - 1,
        holiday.substr(6, 2)
      );
      return holidayDate.toDateString() === date.toDateString();
    });
  };

  // 주말 확인
  const isWeekend = (date) => {
    const day = date.getDay();
    return { isSunday: day === 0, isSaturday: day === 6 };
  };

  const getCurriculumColor = (curriculumId) => {
    const curriculum = curriculums.find(
      (c) => String(c.id) === String(curriculumId)
    );
    return curriculum ? curriculum.color : "#000";
  };

  return (
    <section className="calendar-container">
      <div className="calendar">
        <div className="calendar-header">
          <button onClick={() => handleMonthChange(-1)}>&lt;</button>
          <h2>
            {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
          </h2>
          <button onClick={() => handleMonthChange(1)}>&gt;</button>
        </div>
        <div className="add-list">
          <button onClick={() => setCurrentDate(new Date())}>Today</button>
          <button onClick={handleOpenModal}>
            일정 추가
            <FaCalendarPlus style={{ marginLeft: "8px" }} />
          </button>
        </div>
        <div className="calendar-body">
          <div className="weekdays">
            {["일", "월", "화", "수", "목", "금", "토"].map((day) => (
              <div key={day}>{day}</div>
            ))}
          </div>
          <div className="days">
            {generateCalendarDates().map((day, index) => (
              <div
                key={index}
                className={`day ${day.isCurrentMonth ? "" : "other-month"} ${
                  selectedDate &&
                  day.date.getFullYear() === selectedDate.getFullYear() &&
                  day.date.getMonth() === selectedDate.getMonth() &&
                  day.date.getDate() === selectedDate.getDate()
                    ? "selected"
                    : ""
                } ${isCurrentDate(day.date) ? "current-date" : ""} ${
                  isHoliday(day.date) ? "holiday" : ""
                } ${
                  isWeekend(day.date).isSunday
                    ? "sunday"
                    : isWeekend(day.date).isSaturday
                    ? "saturday"
                    : ""
                }`}
                onClick={() => handleDateClick(day.date)}
              >
                <span className="day-number">{day.date.getDate()}</span>
                <div className="events-indicator">
                  {getEventsForDate(day.date)
                    .slice(0, 1)
                    .map((event) => (
                      <Link
                        key={event.id}
                        to={`/managers/calendar/${event.id}`}
                        className="event-dot-link"
                      >
                        <div
                          className="event-dot"
                          style={{
                            backgroundColor: getCurriculumColor(
                              event.curriculumId
                            ),
                          }}
                        ></div>
                      </Link>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <ManagerModal isOpen={isModalOpen} onClose={handleCloseModal}>
        <div>
          <h3 className="calendar-modal-add">일정 등록하기</h3>
          <div className="calendar-event-form-edit">
            <label>제목</label>
            <input
              type="text"
              placeholder="일정 제목"
              value={newEvent.title}
              onChange={(e) =>
                setNewEvent({ ...newEvent, title: e.target.value })
              }
            />
            <div className="date-input-container">
              <label>시작일</label>
              <input
                type="date"
                value={
                  newEvent.startDate
                    ? newEvent.startDate.toISOString().substr(0, 10)
                    : ""
                }
                onChange={(e) =>
                  setNewEvent({
                    ...newEvent,
                    startDate: new Date(e.target.value),
                  })
                }
              />
            </div>
            <div className="date-input-container">
              <label>종료일</label>
              <input
                type="date"
                value={
                  newEvent.endDate
                    ? newEvent.endDate.toISOString().substr(0, 10)
                    : ""
                }
                onChange={(e) =>
                  setNewEvent({
                    ...newEvent,
                    endDate: new Date(e.target.value),
                  })
                }
              />
            </div>
            <div className="date-input-container">
              <label>기수 선택</label>
              <select
                value={newEvent.curriculumId}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, curriculumId: e.target.value })
                }
              >
                <option value="">기수를 선택하세요</option>
                {curriculums.map((curriculum) => (
                  <option key={curriculum.id} value={curriculum.id}>
                    {curriculum.name} {curriculum.th}기
                  </option>
                ))}
              </select>
            </div>
            <div className="calendar-submit">
              <button onClick={handleSaveEvent}>등록</button>
            </div>
          </div>
        </div>
      </ManagerModal>
    </section>
  );
};

export default ManagerCalendar;
