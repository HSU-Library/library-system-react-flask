import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import ApiService from '../services/api';
import '../styles/BookShelf.css';

/**
 * 책장 상태 페이지 컴포넌트
 * 도서를 책장 위치별로 그리드 형태로 표시
 * 상태별 필터링 및 실시간 업데이트 기능 포함
 */
const BookShelf = () => {
  // 도서 목록 상태 관리
  const [books, setBooks] = useState([]);
  // 그룹화된 책장 상태 관리
  const [groupedShelves, setGroupedShelves] = useState({});
  // 로딩 상태 관리
  const [isLoading, setIsLoading] = useState(true);
  // 필터 상태 관리
  const [currentFilter, setCurrentFilter] = useState(null);
  // 상태별 개수 관리
  const [statusCounts, setStatusCounts] = useState({
    available: 0,
    notAvailable: 0,
    misplaced: 0,
    wrongLocation: 0
  });

  /**
   * 컴포넌트 마운트 시 도서 목록 로드 및 그룹화
   */
  useEffect(() => {
    loadBooks();
  }, []);

  /**
   * 도서 목록 로드 및 그룹화 함수
   */
  const loadBooks = async () => {
    try {
      setIsLoading(true);
      const booksData = await ApiService.getBooks();
      setBooks(booksData);
      
      // 도서를 위치별로 그룹화
      const grouped = groupBooksByLocation(booksData);
      setGroupedShelves(grouped);
      
      // 상태별 개수 계산
      calculateStatusCounts(booksData);
    } catch (error) {
      console.error('도서 목록 로드 실패:', error);
      alert('도서 목록을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 도서를 위치별로 그룹화하는 함수
   * @param {Array} books - 도서 목록
   * @returns {Object} 그룹화된 도서 정보
   */
  const groupBooksByLocation = (books) => {
    const grouped = {};
    
    books.forEach(book => {
      // 특정 위치의 도서만 처리 (기존 로직과 동일)
      if (['1F-1-A-1-a', '1F-1-A-2-a', '2F-1-A-1-a', '2F-1-A-2-a'].includes(book.location)) {
        const location = book.location;
        
        if (!grouped[location]) {
          grouped[location] = [];
        }

        // 도서 상태에 따른 정보 설정
        let statusLabel = "";
        let colorClass = "";

        if (book.available) {
          statusLabel = "책 있음";
          colorClass = "available";
        } else if (!book.available && !book.misplaced && !book.wrong_location) {
          statusLabel = "책이 없음";
          colorClass = "not-available";
        } else if (book.misplaced) {
          statusLabel = "순서 잘못됨";
          colorClass = "misplaced";
        } else if (book.wrong_location) {
          statusLabel = "잘못 배치됨";
          colorClass = "wrong-location";
        }

        grouped[location].push({
          title: book.title,
          barcode: book.barcode,
          image_url: book.image_url || '/default-book.jpg',
          status_label: statusLabel,
          color_class: colorClass
        });
      }
    });

    return grouped;
  };

  /**
   * 상태별 도서 개수를 계산하는 함수
   * @param {Array} books - 도서 목록
   */
  const calculateStatusCounts = (books) => {
    const counts = {
      available: 0,
      notAvailable: 0,
      misplaced: 0,
      wrongLocation: 0
    };

    books.forEach(book => {
      if (book.available) {
        counts.available++;
      } else if (book.wrong_location) {
        counts.wrongLocation++;
      } else if (book.misplaced) {
        counts.misplaced++;
      } else {
        counts.notAvailable++;
      }
    });

    setStatusCounts(counts);
  };

  /**
   * 상태별 필터링 함수
   * @param {string} status - 필터할 상태
   */
  const filterStatus = (status) => {
    setCurrentFilter(currentFilter === status ? null : status);
  };

  /**
   * 모든 도서 표시 함수
   */
  const showAll = () => {
    setCurrentFilter(null);
  };

  /**
   * 필터링된 책장 아이템을 반환하는 함수
   * @param {Array} shelves - 책장 아이템 배열
   * @returns {Array} 필터링된 책장 아이템 배열
   */
  const getFilteredShelves = (shelves) => {
    if (!currentFilter) return shelves;
    
    return shelves.filter(shelf => shelf.color_class === currentFilter);
  };

  return (
    <div className="book-shelf-page">
      {/* 헤더 컴포넌트 */}
      <Header title="책장 상태" />

      <main className="book-shelf-main">
        {/* 상태별 개수 요약 */}
        <div className="status-summary">
          <p>책 있음: <span id="available-count">{statusCounts.available}</span></p>
          <p>책 없음: <span id="not-available-count">{statusCounts.notAvailable}</span></p>
          <p>순서 잘못됨: <span id="misplaced-count">{statusCounts.misplaced}</span></p>
          <p>잘못 배치됨: <span id="wrong-location-count">{statusCounts.wrongLocation}</span></p>
        </div>

        {/* 상태별 필터 버튼 */}
        <div className="filter-buttons">
          <button 
            className={`filter-available ${currentFilter === 'available' ? 'active' : ''}`}
            onClick={() => filterStatus('available')}
          >
            책 있음
          </button>
          <button 
            className={`filter-not-available ${currentFilter === 'not-available' ? 'active' : ''}`}
            onClick={() => filterStatus('not-available')}
          >
            책 없음
          </button>
          <button 
            className={`filter-misplaced ${currentFilter === 'misplaced' ? 'active' : ''}`}
            onClick={() => filterStatus('misplaced')}
          >
            순서 잘못됨
          </button>
          <button 
            className={`filter-wrong-location ${currentFilter === 'wrong-location' ? 'active' : ''}`}
            onClick={() => filterStatus('wrong-location')}
          >
            잘못 배치됨
          </button>
          <button 
            className="filter-all"
            onClick={showAll}
          >
            전체 보기
          </button>
        </div>

        {/* 책장 그리드 */}
        <section className="shelf-grid-section">
          {isLoading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>책장 상태를 불러오는 중...</p>
            </div>
          ) : (
            <div className="shelf-grid">
              {Object.entries(groupedShelves).map(([location, shelves]) => {
                const filteredShelves = getFilteredShelves(shelves);
                
                // 필터가 적용되어 있고 해당 위치에 필터링된 결과가 없으면 표시하지 않음
                if (currentFilter && filteredShelves.length === 0) {
                  return null;
                }

                return (
                  <div key={location} className="shelf-group">
                    <div className="shelf-title">{location}</div>
                    <div className="shelf-items">
                      {filteredShelves.map((shelf, index) => (
                        <div 
                          key={`${shelf.barcode}-${index}`}
                          className={`shelf-item ${shelf.color_class}`}
                        >
                          <div className="title" title={shelf.title}>
                            {shelf.title}
                          </div>
                          <div className="barcode">{shelf.barcode}</div>
                          <img 
                            src={shelf.image_url} 
                            alt="책 이미지"
                            onError={(e) => {
                              e.target.src = '/default-book.jpg';
                            }}
                          />
                          <div className="status-label">{shelf.status_label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default BookShelf; 