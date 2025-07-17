import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import BookCard from '../components/BookCard';
import ApiService from '../services/api';
import '../styles/UserHome.css';

/**
 * 사용자 메인 페이지 컴포넌트
 * 간단한 도서 검색 기능과 관리자 페이지로의 링크를 제공
 */
const UserHome = () => {
  const navigate = useNavigate();
  // 검색 결과 상태 관리
  const [searchResults, setSearchResults] = useState([]);
  // 검색 중 로딩 상태 관리
  const [isSearching, setIsSearching] = useState(false);
  // 검색 실행 여부 상태 관리
  const [hasSearched, setHasSearched] = useState(false);

  /**
   * 도서 검색 실행 함수
   * @param {string} query - 검색어
   */ 
  const handleSearch = async (query) => {
    try {
      setIsSearching(true);
      setHasSearched(true);

      const results = await ApiService.searchBooks(query);
      setSearchResults(results);
    } catch (error) {
      console.error('검색 오류:', error);
      alert('검색 중 오류가 발생했습니다. 다시 시도해 주세요.');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  /**
   * 검색 결과 초기화 함수
   */
  const handleClearSearch = () => {
    setSearchResults([]);
    setHasSearched(false);
  };

  /**
   * 관리자 페이지로 이동하는 함수
   */
  const handleGoToAdmin = () => {
    navigate('/admin');
  };
  /**
   * 책 추천 페이지로 이동하는 함수
   */
  const handleRecommend = () => {
    navigate('/recommendations');
  };

  const handleChat = () => {
    navigate('/chat')
  };

  return (
    <div className="user-home-page">
      {/* 관리자 페이지 링크 */}
      <div className="admin-link-container">
        <button 
          className="admin-link-button"
          onClick={handleGoToAdmin}
          title="관리자 페이지로 이동"
        >
          🔧 관리자 페이지
        </button>
      </div>

      {/* 메인 헤더 */}
      <header className="user-header">
        <div className="header-content">
          <h1 className="main-title">📚 도서관 검색 시스템</h1>
          <p className="subtitle">원하는 책을 쉽고 빠르게 찾아보세요</p>
        </div>
      </header>

      <main className="user-main-content">
        {/* 도서관 이미지 */}
        <div className="library-hero">
          <div className="hero-image">
            <img 
              src="/images/library-hero.jpg" 
              alt="도서관 이미지"
              onError={(e) => {
                e.target.src = '/images/image1.png';
              }}
            />
          </div>
          <div className="hero-overlay">
            <h2>지식을 찾는 여정을 시작하세요</h2>
            <p>수많은 도서 중에서 원하는 책을 빠르게 찾아보세요</p>
          </div>
        </div>

        {/* 검색 섹션 */}
        <section className="search-section">
          <div className="search-container">
            <h3>도서 검색</h3>
            <p>책 제목, 저자명으로 검색하세요</p>
            <SearchBar 
              onSearch={handleSearch}
              disabled={isSearching}
              placeholder="책 제목 또는 저자를 입력하세요"
            />
            
            {/* 검색 결과 초기화 버튼 */}
            {hasSearched && (
              <button 
                className="clear-results-button"
                onClick={handleClearSearch}
              >
                검색 결과 지우기
              </button>
            )}
          </div>
        </section>

        {/* 검색 결과 표시 섹션 */}
        <section className="search-results-section">
          {isSearching && (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>검색 중...</p>
            </div>
          )}

          {!isSearching && hasSearched && (
            <div className="results-container">
              {searchResults.length > 0 ? (
                <>
                  <h3 className="results-title">
                    검색 결과 ({searchResults.length}건)
                  </h3>
                  <div className="book-cards-grid">
                    {searchResults.map((book, index) => (
                      <BookCard key={`${book.barcode}-${index}`} book={book} />
                    ))}
                  </div>
                </>
              ) : (
                <div className="no-results">
                  <p>검색 결과가 없습니다.</p>
                  <p>다른 검색어를 시도해보세요.</p>
                </div>
              )}
            </div>
          )}
        </section>

        {/* 안내 섹션 */}
        <section className="info-section">
          <div className="info-container">
            <h3>📖 도서관 이용 안내</h3>
            <div className="info-grid">
              <div
                className="info-card clickable"
                onClick={handleChat}
                role="button"
                title="상상 Chat으로 이동"
              >
                <div className="info-icon">💬</div>
                <h4>상상 Chat</h4>
                <p>AI와 대화하며 도서를 추천받으세요.</p>
              </div>
              <div 
                className="info-card clickable"
                onClick={handleRecommend}
                role="button"
                title="책 추천 페이지로 이동"
              >
                <div className="info-icon">📚</div>
                <h4>책 추천</h4>
                <p>학생들의 책을 추천해 드립니다.</p>
              </div>
              <div className="info-card">
                <div className="info-icon">📘</div>
                <h4>대출 안내</h4>
                <p>대출 방법과 대출 기간을 확인해 주세요.</p>
              </div>
              <div className="info-card">
                <div className="info-icon">📕</div>
                <h4>반납 안내</h4>
                <p>반납 방법과 반납 기간을 확인해 주세요.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 푸터 */}
      <footer className="user-footer">
        <div className="footer-content">
          <p>&copy; 2025 한성대학교 도서관 검색 시스템</p>
        </div>
      </footer>
    </div>
  );
};

export default UserHome; 