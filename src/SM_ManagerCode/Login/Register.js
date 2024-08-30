import React, { useState, useEffect, useRef } from 'react';
import './Register.css';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from '../../utils/axios';
import swal from 'sweetalert';

function Register() {
  const location = useLocation();
  const nameFromState = location.state?.name || '';
  const emailFromState = location.state?.email || '';
  const phoneFromState = location.state?.phone || '';
  const genderFromState = location.state?.gender || '';

  const [name, setName] = useState(nameFromState);
  const [email, setEmail] = useState(emailFromState);
  const [phone, setPhone] = useState(phoneFromState);
  const [gender, setGender] = useState(genderFromState);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [usernameValid, setUsernameValid] = useState(false);
  const [passwordValid, setPasswordValid] = useState(false);

  const [profileImage, setProfileImage] = useState(null); // 이미지 파일 상태 추가
  const [previewImage, setPreviewImage] = useState(null); // 이미지 미리보기 상태 추가

  const fileInputRef = useRef(null);

  const navigate = useNavigate();

  useEffect(() => {
    setPasswordMatch(password === confirmPassword);
  }, [password, confirmPassword]);

  useEffect(() => {
    if (username.length > 0) {
      checkUsernameAvailability();
      validateUsername(username);
    } else {
      setUsernameAvailable(null);
      setUsernameValid(false);
    }
  }, [username]);

  useEffect(() => {
    validatePassword(password);
  }, [password]);

  const validateUsername = (username) => {
    const usernameRegex = /^(?=.*[a-zA-Z])[a-zA-Z\d]{6,12}$/;
    setUsernameValid(usernameRegex.test(username));
  };

  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[A-Z])(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{10,18}$/;
    setPasswordValid(passwordRegex.test(password));
  };

  const checkUsernameAvailability = async () => {
    try {
      const response = await axios.post('/register/id-duplicate-check', { username });
      setUsernameAvailable(response.status === 200);
    } catch (error) {
      console.error('아이디 중복 에러:', error);
      setUsernameAvailable(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setProfileImage(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewImage(null);
    }
  };

  const handleEditClick = () => {
    fileInputRef.current.click();
  };

const handleSubmit = async (e) => {
  e.preventDefault();
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
      registerData.append('image', profileImage); // 이미지 파일 추가
    }

    // 콘솔에 데이터를 출력합니다.
    for (let pair of registerData.entries()) {
      console.log(`${pair[0]}: ${pair[1]}`);
    }

    const response = await axios.post('/register', registerData, {
      headers: {
        'Content-Type': 'multipart/form-data', // 파일 전송 시에는 multipart/form-data 사용
      },
    });

    if (response.status === 200) {
      swal("회원가입 성공", "회원가입이 성공적으로 완료되었습니다.", "success").then(() => {
        navigate('/login');
      });
    }
  } catch (error) {
    console.error('회원가입 실패:', error);
    swal("회원가입 실패", "회원가입 중 오류가 발생했습니다. 다시 시도해 주세요.", "error");
  }
};

  const handlePreviousStep = () => {
    navigate('/email');
  };

  return (
    <div className="signup-container">
      <form onSubmit={handleSubmit}>
        <h2 className="signup-title">회원가입</h2>
        <div className="image-container">
          <div className="image-preview">
            {previewImage ? (
              <img src={previewImage} alt="Profile Preview" className="profile-preview-image" />
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
              onChange={handleFileChange}
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
              <span className="not-available">아이디는 영문자와 숫자를 포함하여 6-12자리여야 합니다</span>
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
              <span className="not-available">비밀번호는 대문자와 특수문자를 포함하여 10-18자리여야 합니다</span>
            )}
          </div>
        </div>
        <div className="signup-input-group">
          <label htmlFor="confirm-password" className="signup-label">비밀번호 확인</label>
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
          <button className="signup-prev-button" type="button" onClick={handlePreviousStep}>이전 단계</button>
          <button className="signup-button" type="submit">회원가입</button>
        </div>
      </form>
    </div>
  );
}

export default Register;
