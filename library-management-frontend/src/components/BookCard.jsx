import React from 'react';
import '../styles/BookCard.css';

/**
 * 도서 카드 컴포넌트
 * 개별 도서의 정보를 카드 형태로 표시
 * 
 * @param {Object} book - 도서 정보 객체
 * @param {string} book.title - 도서 제목
 * @param {string} book.author - 저자
 * @param {string} book.location - 도서 위치
 * @param {string} book.call_number - 청구기호
 * @param {string} book.barcode - 바코드
 * @param {string} book.image_url - 도서 이미지 URL
 * @param {boolean} book.available - 도서 대출 가능 여부
 * @param {boolean} book.misplaced - 도서 순서 잘못됨 여부
 * @param {boolean} book.wrong_location - 도서 잘못된 위치 여부
 */
const BookCard = ({ book }) => {
  /**
   * 도서 상태에 따른 클래스명과 텍스트를 반환하는 함수
   * @returns {Object} 상태 정보 객체
   */
  const getStatusInfo = () => {
    if (book.available) {
      return {
        className: 'status-available',
        text: '책 있음',
        color: 'green'
      };
    } else if (book.wrong_location) {
      return {
        className: 'status-wrong-location',
        text: '위치 잘못됨',
        color: 'purple'
      };
    } else if (book.misplaced) {
      return {
        className: 'status-misplaced',
        text: '순서 바뀜',
        color: 'yellow'
      };
    } else {
      return {
        className: 'status-not-available',
        text: '책 없음',
        color: 'red'
      };
    }
  };

  const statusInfo = getStatusInfo();

  /**
   * 이미지 로드 실패 시 기본 이미지로 대체하는 함수
   * @param {Event} e - 이미지 로드 이벤트 객체
   */
  const handleImageError = (e) => {
    e.target.src = '/default-book.jpg'; // 기본 이미지 경로
  };

  return (
    <div className="book-card">
      {/* 도서 이미지 */}
      <div className="book-image-container">
        <img
          src={book.image_url || '/default-book.jpg'}
          alt={book.title}
          className="book-image"
          onError={handleImageError}
        />
      </div>

      {/* 도서 정보 */}
      <div className="book-info">
        {/* 도서 제목 */}
        <h3 className="book-title" title={book.title}>
          {book.title}
        </h3>

        {/* 도서 상세 정보 */}
        <div className="book-details">
          <p className="book-author">
            <strong>저자:</strong> {book.author}
          </p>
          <p className="book-location">
            <strong>위치:</strong> {book.location}
          </p>
          {book.call_number && (
            <p className="book-call-number">
              <strong>청구기호:</strong> {book.call_number}
            </p>
          )}
          <p className="book-barcode">
            <strong>바코드:</strong> {book.barcode}
          </p>
        </div>

        {/* 도서 상태 표시 */}
        <div className={`book-status ${statusInfo.className}`}>
          <span 
            className="status-indicator"
            style={{ backgroundColor: statusInfo.color }}
          ></span>
          <span className="status-text">{statusInfo.text}</span>
        </div>
      </div>
    </div>
  );
};

export default BookCard; 