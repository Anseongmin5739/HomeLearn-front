import React, { useEffect, useState, useRef, useCallback } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import "./ProgressModal.css";

const ProgressModal = ({ isOpen, onClose }) => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentStudent, setCurrentStudent] = useState(0);
  const [totalStudents, setTotalStudents] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [successCount, setSuccessCount] = useState(0);
  const animationRef = useRef(null);
  const targetProgressRef = useRef(0);

  // 파일 진행 상태를 애니메이션으로 업데이트
  const animateProgress = useCallback(() => {
    if (uploadProgress < targetProgressRef.current) {
      setUploadProgress((prev) => {
        const newProgress = Math.min(prev + 1, targetProgressRef.current);
        if (newProgress >= 100) {
          cancelAnimationFrame(animationRef.current);
          setTimeout(() => setIsCompleted(true), 500);
        }
        return newProgress;
      });
      animationRef.current = requestAnimationFrame(animateProgress);
    }
  }, [uploadProgress]);

  useEffect(() => {
    if (targetProgressRef.current > uploadProgress) {
      if (!animationRef.current) {
        animationRef.current = requestAnimationFrame(animateProgress);
      }
    }
  }, [targetProgressRef.current, uploadProgress, animateProgress]);

  useEffect(() => {
    if (isOpen) {
      setUploadProgress(0);
      setCurrentStudent(0);
      setTotalStudents(0);
      setIsCompleted(false);
      setSuccessCount(0);
      targetProgressRef.current = 0;

      // WebSocket 연결 설정
      const socket = new SockJS(`http://223.130.141.27/gs-guide-websocket`);
      const stompClient = new Client({
        webSocketFactory: () => socket,
        onConnect: () => {
          stompClient.subscribe("/topic/progress", (message) => {
            const progressUpdate = JSON.parse(message.body);
            targetProgressRef.current = progressUpdate.progress;
            setCurrentStudent(progressUpdate.current);
            setTotalStudents(progressUpdate.total);

            if (progressUpdate.progress === 100) {
              setSuccessCount(progressUpdate.successCount || progressUpdate.total);
            }
          });
        },
        onStompError: (frame) => {
          console.error("Broker reported error: " + frame.headers["message"]);
          console.error("Additional details: " + frame.body);
        },
      });

      stompClient.activate();

      // 컴포넌트가 언마운트될 때 WebSocket 연결 해제
      return () => {
        if (stompClient) {
          stompClient.deactivate();
        }
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
      <div className="file-progress-modal-overlay">
        <div className="file-progress-modal">
          {!isCompleted ? (
              <>
                <h2>메일 전송 중...</h2>
                <div id="file-progress">
                  <div id="file-bar" style={{ width: `${uploadProgress}%` }}>
                    {Math.round(uploadProgress)}%
                  </div>
                </div>
                <br />
                <span>
              {currentStudent}/{totalStudents}
            </span>
              </>
          ) : (
              <>
                <span className="file-success">파일 업로드 완료</span>
                <span className="file-success-total">
              총 {totalStudents}명 중 {successCount}명 성공
            </span>
                <br />
                <button onClick={onClose}>닫기</button>
              </>
          )}
        </div>
      </div>
  );
};

export default ProgressModal;