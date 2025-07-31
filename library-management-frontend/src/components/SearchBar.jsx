import React, { useState } from 'react';
import '../styles/SearchBar.css';

/**
 * 검색바 컴포넌트
 * 도서 검색 기능을 제공하는 재사용 가능한 컴포넌트
 * 
 * @param {Function} onSearch - 검색 실행 시 호출될 콜백 함수
 * @param {string} placeholder - 검색창에 표시될 플레이스홀더 텍스트
 * @param {boolean} disabled - 검색 기능 비활성화 여부
 */
const SearchBar = ({
  onSearch,
  placeholder = "책 이름 또는 저자를 입력하세요",
  disabled = false
}) => {
  // 검색어 상태 관리
  const [searchQuery, setSearchQuery] = useState('');

  /**
   * 검색어 입력 처리 함수
   * @param {Event} e - 입력 이벤트 객체
   */
  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  /**
   * 검색 실행 함수
   * 검색어가 비어있지 않을 때만 검색을 실행
   */
  const handleSearch = () => {
    const trimmedQuery = searchQuery.trim();
    if (!trimmedQuery) {
      alert('검색어를 입력하세요!');
      return;
    }

    if (onSearch) {
      onSearch(trimmedQuery);
    }
  };

  /**
   * 엔터키 입력 처리 함수
   * @param {Event} e - 키보드 이벤트 객체
   */
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  /**
   * 검색어 초기화 함수
   */
  const handleClear = () => {
    setSearchQuery('');
  };

   const handleSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    onSearch(searchQuery);
  };

  return (
    <div className="search-container">
      <form className="search-bar-form" onSubmit={handleSubmit}>
        <span className="search-icon">🔍</span>      
        {/* 검색 입력 필드 */}
        <input
          type="text"
          id="searchInput"
          className="search-input"
          value={searchQuery}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          disabled={disabled}
        />

        {/* 검색 버튼 */}
        <button
          className="search-button"
          onClick={handleSearch}
          disabled={disabled}
        >
          검색
        </button>
      </form>
      {/* 검색어 초기화 버튼 */}
      {searchQuery && (
        <button
          className="clear-button"
          onClick={handleClear}
          disabled={disabled}
          title="검색어 지우기"
        >
          ✕
        </button>
      )}
    </div>
  );
};

export default SearchBar;
