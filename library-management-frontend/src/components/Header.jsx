import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Header.css';

/**
 * 헤더 컴포넌트
 * 모든 페이지의 상단에 표시되는 공통 헤더
 * 페이지 새로고침 기능과 네비게이션 기능을 제공
 */
const Header = ({ title = "도서관 관리 시스템" }) => {
  const navigate = useNavigate();

  /**
   * 페이지 새로고침 함수
   * 헤더 제목을 클릭하면 현재 페이지를 새로고침
   */
  const handleRefresh = () => {
    window.location.reload();
  };

  /**
   * 관리자 메인 페이지로 이동하는 함수
   */
  const handleGoHome = () => {
    navigate('/admin');
  };

  return (
    <header className="header">
      <div className="header-content">
        {/* 헤더 왼쪽 영역 (로고 + 제목) */}
        <div className="header-left">
          {/* 헤더 로고 이미지 */}
          <div className="header-logo">
            <img 
              src="/images/image1.png" 
              alt="도서관 로고" 
              className="header-logo-image"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
          
          {/* 헤더 제목 - 클릭 시 페이지 새로고침 */}
          <h1 
            className="header-title" 
            onClick={handleRefresh}
            title="클릭하여 페이지 새로고침"
          >
            {title}
          </h1>
        </div>
        
        {/* 네비게이션 메뉴 */}
        <nav className="header-nav">
          <button 
            className="nav-button"
            onClick={handleGoHome}
          >
            🏠 관리자 메인
          </button>
          <button 
            className="nav-button"
            onClick={() => navigate('/admin/books')}
          >
            📚 도서목록
          </button>
          <button 
            className="nav-button"
            onClick={() => navigate('/admin/book-shelf')}
          >
            📖 책장상태
          </button>
          <button 
            className="nav-button"
            onClick={() => navigate('/')}
          >
            👤 사용자 페이지
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header; 