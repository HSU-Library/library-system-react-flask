import React, { useState } from 'react';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import ScanControls from '../components/ScanControls';
import BookCard from '../components/BookCard';
import ApiService from '../services/api';
import '../styles/Home.css';

/**
 * 관리자 메인 페이지 컴포넌트
 * 도서관 관리 시스템의 관리자 화면
 * 검색 기능, 스캔 제어, 검색 결과 표시를 포함
 */
const AdminHome = () => {
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

  return (
    <div className="home-page">
      {/* 헤더 컴포넌트 */}
      <Header />

      <main className="main-content">
        {/* 도서관 이미지 컨테이너 */}
        {/* <div className="image-container">
          <img 
            src="/images/image2.png" 
            alt="도서관 이미지 2" 
            className="library-image"
            onError={(e) => {
              e.target.src = '/default-library.jpg';
            }}
          />
          <img 
            src="/images/image1.png" 
            alt="도서관 이미지 1" 
            className="library-image"
            onError={(e) => {
              e.target.src = '/default-library.jpg';
            }}
          />
          <img 
            src="/images/image3.png" 
            alt="도서관 이미지 3" 
            className="library-image"
            onError={(e) => {
              e.target.src = '/default-library.jpg';
            }}
          />
        </div> */}

        {/* 검색 섹션 */}
        <section className="search-section">
          <SearchBar 
            onSearch={handleSearch}
            disabled={isSearching}
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
                  <p>책을 찾을 수 없습니다.</p>
                  <p>다른 검색어를 시도해보세요.</p>
                </div>
              )}
            </div>
          )}
        </section>

        {/* 스캔 제어 섹션 */}
        <section className="scan-section">
          <ScanControls />
        </section>
      </main>
    </div>
  );
};

export default AdminHome; 