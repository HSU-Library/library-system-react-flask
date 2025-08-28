import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import ApiService from '../services/api';
import '../styles/Books.css';

/**
 * 도서 목록 페이지 컴포넌트
 * 모든 도서의 목록을 테이블 형태로 표시
 * 도서 상태별 필터링 기능 포함
 */
const Books = () => {
  // 도서 목록 상태 관리
  const [books, setBooks] = useState([]);
  // 로딩 상태 관리
  const [isLoading, setIsLoading] = useState(true);
  // 필터 상태 관리
  const [filter, setFilter] = useState('all');
  // 정렬 상태 관리
  const [sortBy, setSortBy] = useState('title');
  // 정렬 방향 관리
  const [sortDirection, setSortDirection] = useState('asc');

  /**
   * 컴포넌트 마운트 시 도서 목록 로드
   */
  useEffect(() => {
    loadBooks();
  }, []);

  /**
   * 도서 목록 로드 함수
   */
  const loadBooks = async () => {
    try {
      setIsLoading(true);
      const booksData = await ApiService.getBooks();
      setBooks(booksData);
    } catch (error) {
      console.error('도서 목록 로드 실패:', error);
      alert('도서 목록을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 도서 상태에 따른 클래스명과 텍스트를 반환하는 함수
   * @param {Object} book - 도서 정보 객체
   * @returns {Object} 상태 정보 객체
   */
  const getBookStatus = (book) => {
    if (book.available) {
      return {
        className: 'status-available',
        text: '책 있음'
      };
    } else if (book.wrong_location) {
      return {
        className: 'status-wrong-location',
        text: '위치 잘못됨'
      };
    } else if (book.misplaced) {
      return {
        className: 'status-misplaced',
        text: '순서 바뀜'
      };
    } else {
      return {
        className: 'status-not-available',
        text: '책 없음'
      };
    }
  };

  /**
   * 필터링된 도서 목록을 반환하는 함수
   * @returns {Array} 필터링된 도서 목록
   */
  const getFilteredBooks = () => {
    let filteredBooks = [...books];

    // 상태별 필터링
    if (filter !== 'all') {
      filteredBooks = filteredBooks.filter(book => {
        const status = getBookStatus(book);
        return status.className === `status-${filter}`;
      });
    }

    // 정렬
    filteredBooks.sort((a, b) => {
      let aValue = a[sortBy] || '';
      let bValue = b[sortBy] || '';

      // 문자열 비교
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) {
        return sortDirection === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });

    return filteredBooks;
  };

  /**
   * 정렬 헤더 클릭 처리 함수
   * @param {string} field - 정렬할 필드명
   */
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('asc');
    }
  };

  /**
   * 정렬 방향에 따른 화살표 아이콘을 반환하는 함수
   * @param {string} field - 필드명
   * @returns {string} 화살표 아이콘
   */
  const getSortIcon = (field) => {
    if (sortBy !== field) return '↕️';
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  const filteredBooks = getFilteredBooks();

  return (
    <div className="books-page">
      {/* 헤더 컴포넌트 */}
      <Header title="도서 목록" />

      <main className="books-main">
        {/* 필터 섹션 */}
        <section className="filter-section">
          <div className="filter-buttons">
            <button
              className={`filter-button ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              전체 ({books.length})
            </button>
            <button
              className={`filter-button status-available ${filter === 'available' ? 'active' : ''}`}
              onClick={() => setFilter('available')}
            >
              책 있음 ({books.filter(book => book.available).length})
            </button>
            <button
              className={`filter-button status-not-available ${filter === 'not-available' ? 'active' : ''}`}
              onClick={() => setFilter('not-available')}
            >
              책 없음 ({books.filter(book => !book.available && !book.misplaced && !book.wrong_location).length})
            </button>
            <button
              className={`filter-button status-misplaced ${filter === 'misplaced' ? 'active' : ''}`}
              onClick={() => setFilter('misplaced')}
            >
              순서 바뀜 ({books.filter(book => book.misplaced).length})
            </button>
            <button
              className={`filter-button status-wrong-location ${filter === 'wrong-location' ? 'active' : ''}`}
              onClick={() => setFilter('wrong-location')}
            >
              위치 잘못됨 ({books.filter(book => book.wrong_location).length})
            </button>
          </div>
        </section>

        {/* 도서 목록 테이블 */}
        <section className="books-table-section">
          {isLoading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>도서 목록을 불러오는 중...</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="books-table">
                <thead>
                  <tr>
                    <th onClick={() => handleSort('title')}>
                      책 제목 {getSortIcon('title')}
                    </th>
                    <th onClick={() => handleSort('author')}>
                      저자 {getSortIcon('author')}
                    </th>
                    <th onClick={() => handleSort('location')}>
                      위치 {getSortIcon('location')}
                    </th>
                    <th onClick={() => handleSort('call_number')}>
                      청구기호 {getSortIcon('call_number')}
                    </th>
                    <th onClick={() => handleSort('barcode')}>
                      바코드 {getSortIcon('barcode')}
                    </th>
                    <th>책 유무</th>
                    <th>책 이미지</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBooks.map((book, index) => {
                    const status = getBookStatus(book);
                    return (
                      <tr key={`${book.barcode}-${index}`}>
                        <td className="book-title">{book.title}</td>
                        <td>{book.author}</td>
                        <td>{book.location}</td>
                        <td>{book.call_number || '없음'}</td>
                        <td>{book.barcode}</td>
                        <td>
                          <span className={`status-badge ${status.className}`}>
                            {status.text}
                          </span>
                        </td>
                        <td>
                          <img
                            src={book.image_url || '/default-book.jpg'}
                            alt={book.title}
                            className="book-thumbnail"
                            onError={(e) => {
                              e.target.src = '/default-book.jpg';
                            }}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* 결과 개수 표시 */}
              <div className="results-info">
                <p>
                  총 {filteredBooks.length}건의 도서가 표시됩니다.
                  {filter !== 'all' && ` (전체 ${books.length}건 중)`}
                </p>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Books; 