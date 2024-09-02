import React, { useState, useEffect, useRef } from 'react';
import './Register.css';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from '../../utils/axios';
import swal from 'sweetalert';

function Register() {
  //이전 페이지에서 정보를 가져옴
  const location = useLocation();
  const nameFromState = location.state?.name || '';
  const emailFromState = location.state?.email || '';
  const phoneFromState = location.state?.phone || '';
  const genderFromState = location.state?.gender || '';

  // 사용자 정보를 관리하는 상태 변수 선언
  const [name, setName] = useState(nameFromState);
  const [email, setEmail] = useState(emailFromState);
  const [phone, setPhone] = useState(phoneFromState);
  const [gender, setGender] = useState(genderFromState);

  // 추가적인 사용자 입력을 관리하는 상태 변수 선언
  const [username, setUsername] = useState(''); // 아이디
  const [password, setPassword] = useState(''); // 비밀번호
  const [confirmPassword, setConfirmPassword] = useState(''); // 비밀번호 확인
  const [passwordMatch, setPasswordMatch] = useState(true); // 비밀번호 일치 여부
  const [usernameAvailable, setUsernameAvailable] = useState(null); // 아이디 사용 가능
  const [usernameValid, setUsernameValid] = useState(false); // 아이디 유효성
  const [passwordValid, setPasswordValid] = useState(false); // 비밀번호 유효성

  // 프로필 이미지
  const [profileImage, setProfileImage] = useState(null); // 이미지 파일
  const [previewImage, setPreviewImage] = useState(null); // 이미지 미리보기
  const fileInputRef = useRef(null); // 파일 입력 요소에 접근하기 위한 ref
  const navigate = useNavigate();
  // 아이디 중복 여부 확인
  const checkUsernameAvailability = async () => {
    try {
      const response = await axios.post('/register/id-duplicate-check', { username }); // 서버에 아이디 중복 확인 요청
      setUsernameAvailable(response.status === 200); //성공
    } catch (error) {
      console.error('아이디 중복 에러:', error);
      setUsernameAvailable(false);
    }
  };
  // 아이디 중복 확인,유효성 검사
  useEffect(() => {
    if (username.length > 0) {
      checkUsernameAvailability(); // 아이디 중복 확인
      validateUsername(username); // 아이디 유효성 검사
    } else {
      setUsernameAvailable(null); // 아이디가 비어있을 때 사용 가능 상태 초기화
      setUsernameValid(false); // 아이디 유효성 상태 초기화
    }
  }, [username]);

  // 비밀번호가 변경될 때마다 유효성 검사
  useEffect(() => {
    validatePassword(password); // 비밀번호 유효성 검사 함수 호출
  }, [password]);
  // 비밀번호 일치 여부
  useEffect(() => {
    setPasswordMatch(password === confirmPassword);
  }, [password, confirmPassword]);

  // 아이디 유효성 검사
  const validateUsername = (username) => {
    const usernameRegex = /^(?=.*[a-zA-Z])[a-zA-Z\d]{6,12}$/; // 아이디 정규 표현식
    setUsernameValid(usernameRegex.test(username)); // 정규식 검사 후 상태 업데이트
  };

  // 비밀번호 유효성 검사
  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[A-Z])(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{10,18}$/; // 비밀번호 정규 표현식
    setPasswordValid(passwordRegex.test(password)); // 정규식 검사 후 상태 업데이트
  };

  // 파일 입력
  const handleFileChange = (e) => {
    const file = e.target.files[0]; // 선택된 파일 가져오기
    setProfileImage(file); // 이미지 파일 상태 업데이트
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result); // 파일 읽기 완료 시 미리보기 이미지 상태 업데이트
      };
      reader.readAsDataURL(file); // 파일을 데이터 URL로 읽기
    } else {
      setPreviewImage(null); // 파일이 없으면 이미지 상태 초기화
    }
  };

  // 편집 아이콘 클릭 시 파일 입력 클릭을 트리거(Update)하는 함수
  const handleEditClick = () => {
    fileInputRef.current.click();
  };

  // 폼 제출 시 실행되는 함수
  const handleSubmit = async (e) => {
    e.preventDefault(); // 기본 폼 제출 동작 방지
    // 모든 유효성 조건을 만족하지 않으면 함수 종료
    if (!passwordMatch || !usernameAvailable || !usernameValid || !passwordValid) {
      return;
    }

    try {
      const registerData = new FormData();
      registerData.append('username', username);
      registerData.append('password', password);
      registerData.append('name', name);
      registerData.append('phone', phone);
      registerData.append('email', email);

      if (gender) {
        registerData.append('gender', gender);
      }

      if (profileImage) {
        registerData.append('image', profileImage);
      }

//      // 폼 데이터 내용을 콘솔에 출력
//      for (let pair of registerData.entries()) {
//        console.log(`${pair[0]}: ${pair[1]}`);
//      }

      //회원가입 요청
      const response = await axios.post('/register', registerData, {
        headers: {
          'Content-Type': 'multipart/form-data', // 파일 전송 시 form-data 방식을 사용하여 서버로 보냄
        },
      });

      if (response.status === 200) {
        // 회원가입 성공 시 로그인 페이지로 이동
        swal("회원가입 성공", "회원가입이 성공적으로 완료되었습니다.", "success").then(() => {
          navigate('/login');
        });
      }
    } catch (error) {
      console.error('회원가입 실패:', error);
      swal("회원가입 실패", "회원가입 중 오류가 발생했습니다. 다시 시도해 주세요.", "error");
    }
  };

  // 이전 단계로 돌아가는 함수
  const handlePreviousStep = () => {
    navigate('/email'); // 이메일 인증 페이지로 이동
  };

  return (
    <div className="signup-container">
      <form onSubmit={handleSubmit}>
        <h2 className="signup-title">회원가입</h2>
        <div className="image-container">
          <div className="image-preview">
            {previewImage ? (
              <img src={previewImage} alt="Profile Preview" className="profile-preview-image" /> // 미리보기 이미지 표시
            ) : (
              <span>이미지 선택</span>
            )}
          </div>
          <div className="edit-icon" onClick={handleEditClick}>
            <i className="fa fa-pencil" aria-hidden="true"></i>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileChange} // 파일 변경 시
              style={{ display: 'none' }} // 파일 입력 요소 숨김
            />
          </div>
        </div>

        <div className="signup-input-group">
          <label htmlFor="name" className="signup-label">이름</label>
          <div className="signup-input-wrapper">
            <input
              className="signup-input"
              type="text"
              id="name"
              value={name}
              readOnly
            />
            <i className="fa-solid fa-lock signup-lock-icon"></i>
          </div>
        </div>

        <div className="signup-input-group">
          <label htmlFor="phone" className="signup-label">전화번호</label>
          <div className="signup-input-wrapper">
            <input
              className="signup-input"
              type="text"
              id="phone"
              value={phone}
              readOnly
            />
            <i className="fa-solid fa-lock signup-lock-icon"></i>
          </div>
        </div>

        <div className="signup-input-group">
          <label htmlFor="email" className="signup-label">이메일</label>
          <div className="signup-input-wrapper">
            <input
              className="signup-input"
              type="email"
              id="email"
              value={email}
              readOnly
            />
            <i className="fa-solid fa-lock signup-lock-icon"></i>
          </div>
        </div>

        <div className="signup-input-group">
          <label htmlFor="username" className="signup-label">아이디</label>
          <input
            className="signup-input"
            type="text"
            id="username"
            placeholder="아이디 입력"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <div className="user-id-check">
            {username && !usernameValid && (
              <span className="not-available">아이디는 영문자와 숫자를 포함하여 6-12자리여야 합니다</span> // 아이디 유효성 실패 시 메시지 표시
            )}
            {username && usernameValid && (
              <span className={usernameAvailable ? 'available' : 'not-available'}>
                {usernameAvailable ? '사용 가능한 아이디입니다' : '이미 사용 중인 아이디입니다'}
              </span>
            )}
          </div>
        </div>

        <div className="signup-input-group">
          <label htmlFor="password" className="signup-label">비밀번호</label>
          <input
            className="signup-input"
            type="password"
            id="password"
            placeholder="비밀번호 입력"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="password-check">
            {password && !passwordValid && (
              <span className="not-available">비밀번호는 대문자와 특수문자를 포함하여 10-18자리여야 합니다</span> // 비밀번호 유효성 실패 시 메시지 표시
            )}
          </div>
        </div>

        <div className="signup-input-group">
          <label htmlFor="confirm-password" className="signup-label">비밀번호 확인</label> {/* 비밀번호 확인 레이블 */}
          <input
            className="signup-input"
            type="password"
            id="confirm-password"
            placeholder="비밀번호 확인"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <div className="password-match-message">
            {confirmPassword && (
              <span className={passwordMatch ? 'match' : 'no-match'}>
                {passwordMatch ? '비밀번호가 일치합니다' : '비밀번호가 일치하지 않습니다'}
              </span>
            )}
          </div>
        </div>

        <div className="signup-button-group">
          <button
            className="signup-prev-button"
            type="button"
            onClick={handlePreviousStep}
          >
            이전 단계
          </button>
          <button
            className="signup-button"
            type="submit"
          >
            회원가입
          </button>
        </div>
      </form>
    </div>
  );
}

export default Register;
