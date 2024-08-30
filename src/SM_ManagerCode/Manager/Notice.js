import React, { useState, useEffect } from "react";
import "./Notice.css";
import axios from "../../utils/axios";

const Notice = () => {
  const [notices, setNotices] = useState([]);
  const [expandedNoticeId, setExpandedNoticeId] = useState(null);
  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);
  const [isNoticeEditing, setIsNoticeEditing] = useState(false);
  const [currentNotice, setCurrentNotice] = useState({
    noticeId: null,
    noticeType: '공지',
    noticeTitle: '',
    noticeDate: '',
    noticeContent: '',
    noticeFile: '',
  });
  const [selectedNotices, setSelectedNotices] = useState([]); // 선택된 공지사항들 상태 관리
  const [selectedFile, setSelectedFile] = useState(null); // 선택된 파일 상태 관리

  // 컴포넌트가 마운트될 때 백엔드에서 공지사항 목록을 가져옴
  useEffect(() => {
    fetchNotices();
  }, []);

  // 공지사항 목록
  const fetchNotices = async () => {
    try {
      const token = localStorage.getItem("access-token"); // 토큰 가져오기
      const response = await axios.get("/managers/notification-boards", {
        headers: {
          access: token,
        },
      });
      setNotices(response.data.content); // 공지사항 목록 설정
    } catch (error) {
      console.error("Error fetching notices:", error);
    }
  };

  // 공지사항 상세 내용
  const handleToggleNotice = (noticeId) => {
    setExpandedNoticeId(expandedNoticeId === noticeId ? null : noticeId);
  };

  // 공지사항 등록/수정 모달
  const handleOpenNoticeModal = (notice = {
    noticeId: null,
    noticeType: '공지',
    noticeTitle: '',
    noticeDate: '',
    noticeContent: '',
    noticeFile: '',
  }) => {
    setCurrentNotice(notice);
    setIsNoticeEditing(!!notice.noticeId); // 공지사항 ID가 존재하면 수정
    setIsNoticeModalOpen(true);
  };

  // 공지사항 등록/수정 모달 닫기
  const handleCloseNoticeModal = () => {
    setIsNoticeModalOpen(false); // 모달 닫기
    setCurrentNotice({ // 현재 공지사항 상태 초기화
      noticeId: null,
      noticeType: '공지',
      noticeTitle: '',
      noticeDate: '',
      noticeContent: '',
      noticeFile: '',
    });
    setIsNoticeEditing(false); // 수정 모드 해제
    setSelectedFile(null); // 선택된 파일 초기화
  };

  // 공지사항 입력 필드의 변경을 처리하는 함수
  const handleNoticeChange = (e) => {
    const { name, value } = e.target;
    setCurrentNotice((prev) => ({ ...prev, [name]: value }));
  };

  // 파일 선택 시 처리하는 함수
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file); // 선택된 파일 설정
    setCurrentNotice((prev) => ({ ...prev, noticeFile: file ? file.name : '' })); // 현재 공지사항의 파일 정보 업데이트
  };

  // 선택된 파일을 삭제하는 함수
  const handleFileDelete = () => {
    setSelectedFile(null); // 선택된 파일 초기화
    setCurrentNotice((prev) => ({ ...prev, noticeFile: '' })); // 현재 공지사항의 파일 정보 초기화
  };

  // 공지사항 저장 함수 (등록 및 수정)
  const handleSaveNotice = async () => {
    try {
      const formData = new FormData();
      formData.append("title", currentNotice.noticeTitle);
      formData.append("content", currentNotice.noticeContent);
      formData.append("emergency", currentNotice.noticeType === '긴급');
      if (selectedFile) {
        formData.append("file", selectedFile);
      }

      const token = localStorage.getItem("access-token");

      if (isNoticeEditing) { // 수정
        await axios.patch(`/managers/notification-boards/${currentNotice.noticeId}`, formData, {
          headers: {
            access: token,
            "Content-Type": "multipart/form-data",
          },
        });
      } else { // 등록
        await axios.post("/managers/notification-boards", formData, {
          headers: {
            access: token,
            "Content-Type": "multipart/form-data",
          },
        });
      }

      fetchNotices(); // 공지사항 목록 갱신
      handleCloseNoticeModal(); // 모달 닫기
    } catch (error) {
      console.error("Error saving notice:", error);
    }
  };

  // 선택된 공지사항을 삭제하는 함수
  const handleDeleteNotices = async () => {
    try {
      const token = localStorage.getItem("access-token");

      if (selectedNotices.length > 0) { // 공지사항 삭제
        await axios.delete("/managers/notification-boards", {
          data: selectedNotices,
          headers: {
            access: token,
          },
        });
        setSelectedNotices([]); // 선택된 공지사항 초기화
      } else if (currentNotice.noticeId) { // 단일 공지사항 삭제
        await axios.delete(`/managers/notification-boards/${currentNotice.noticeId}`, {
          headers: {
            access: token,
          },
        });
      }

      fetchNotices(); // 공지사항 목록 갱신
      handleCloseNoticeModal();
    } catch (error) {
      console.error("Error deleting notices:", error);
    }
  };

  // 체크박스 상태를 변경하는 함수
  const handleCheckboxChange = (noticeId) => {
    setSelectedNotices((prev) =>
      prev.includes(noticeId) ? prev.filter((id) => id !== noticeId) : [...prev, noticeId]
    );
  };

  return (
    <div className="notice-container">
      <div className="notice-header">
        <h1>공지사항</h1>
        <div className="notice-actions">
          <button className="notice-action-button" onClick={() => handleOpenNoticeModal()}>
            등록
          </button>
          <button className="notice-action-button" onClick={handleDeleteNotices}>
            삭제
          </button>
        </div>
      </div>
      {notices.map((notice) => (
        <div key={notice.id} className="notice-item">
          <div className="notice-summary">
            <input
              type="checkbox"
              checked={selectedNotices.includes(notice.id)}
              onChange={() => handleCheckboxChange(notice.id)}
            />
            <span className={`notice-type ${notice.emergency ? 'urgent' : 'normal'}`}>
              {notice.emergency ? '긴급' : '공지'}
            </span>
            <div className="notice-title-date">
              <span className="notice-title">{notice.title}</span>
              <span className="notice-date">{notice.date}</span>
            </div>
            <button className="notice-toggle-button" onClick={() => handleToggleNotice(notice.id)}>
              {expandedNoticeId === notice.id ? '-' : '+'}
            </button>
          </div>
          {expandedNoticeId === notice.id && (
            <div className="notice-content">
              <button className="notice-edit-button" onClick={() => handleOpenNoticeModal({
                noticeId: notice.id,
                noticeType: notice.emergency ? '긴급' : '공지',
                noticeTitle: notice.title,
                noticeDate: notice.date,
                noticeContent: notice.content,
                noticeFile: notice.file,
              })}>
                수정
              </button>
              <p>{notice.content}</p>
              {notice.file && (
                <div className="notice-footer">
                  <span>{notice.file}</span>
                </div>
              )}
            </div>
          )}
        </div>
      ))}

      {isNoticeModalOpen && (
        <div className="notice-modal">
          <div className="notice-modal-header">
            <h2>{isNoticeEditing ? '공지 사항 수정' : '공지 사항 등록'}</h2>
            <button className="modal-close" onClick={handleCloseNoticeModal}>
              &times;
            </button>
          </div>
          <div className="notice-modal-body">
            <div className="modal-header-row">
              <div className="modal-title-label">제목</div>
              <div className="modal-emergency-group">
                <label className="emergency-checkbox">
                  <input
                    type="checkbox"
                    name="noticeType"
                    checked={currentNotice.noticeType === '긴급'}
                    onChange={(e) =>
                      setCurrentNotice((prev) => ({
                        ...prev,
                        noticeType: e.target.checked ? '긴급' : '공지',
                      }))
                    }
                  />
                  긴급 여부
                </label>
              </div>
            </div>
            <input
              type="text"
              name="noticeTitle"
              value={currentNotice.noticeTitle}
              onChange={handleNoticeChange}
              className="notice-title-input"
            />
            <label>내용</label>
            <textarea
              name="noticeContent"
              value={currentNotice.noticeContent}
              onChange={handleNoticeChange}
            />
            <label>파일 첨부</label>
            <div className="notice-file-upload">
              <input id="notice-file-upload" type="file" onChange={handleFileChange} style={{ display: 'none' }} />
              <div className="file-input-container">
                <input type="text" value={currentNotice.noticeFile} readOnly />
                {currentNotice.noticeFile && (
                  <button className="notice-file-delete-button" onClick={handleFileDelete}>
                    삭제
                  </button>
                )}
              </div>
              <label htmlFor="notice-file-upload" className="notice-custom-file-upload">
                <span>파일 첨부</span>
              </label>
            </div>
          </div>
          <div className="notice-modal-footer">
            <button className="notice-submit-button" onClick={handleSaveNotice}>
              {isNoticeEditing ? '공지 사항 수정' : '공지 사항 등록'}
            </button>
            <button className="notice-cancel-button" onClick={handleCloseNoticeModal}>
              등록취소
            </button>

          </div>
        </div>
      )}
    </div>
  );
};

export default Notice;
