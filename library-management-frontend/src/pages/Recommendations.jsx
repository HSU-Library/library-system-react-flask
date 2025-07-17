import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BookCard from '../components/BookCard';
import ApiService from '../services/api';
import '../styles/Recommendations.css';

/**
 * 추천 도서 페이지 컴포넌트
 */
const Recommendations = () => {
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const data = await ApiService.getRecommendations();
        setRecommendations(data);
      } catch (err) {
        console.error('추천 도서 로드 실패:', err);
        setError('추천 도서를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchRecommendations();
  }, []);

  return (
    <div className="recommendations-page">
      {/* 뒤로가기 버튼 */}
      <button className="back-button" onClick={() => navigate(-1)} title="뒤로가기">
        ◀
      </button>

      {/* 헤더 */}
      <header className="recommendations-header">
        <h1>📚 추천 도서</h1>
        <p>당신을 위한 도서를 추천해 드립니다</p>
      </header>

      {/* 콘텐츠 */}
      <main className="recommendations-content">
        {isLoading && <div className="loading-container">로딩 중...</div>}
        {error && <div className="error-message">{error}</div>}
        {!isLoading && !error && (
          <div className="book-cards-grid">
            {recommendations.length > 0 ? (
              recommendations.map((book, idx) => (
                <BookCard key={`${book.barcode}-${idx}`} book={book} />
              ))
            ) : (
              <div className="no-results">추천 도서가 없습니다.</div>
            )}
          </div>
        )}
      </main>

      {/* 푸터 */}
      <footer className="recommendations-footer">
        <p>&copy; 2025 한성대학교 도서관 검색 시스템</p>
      </footer>
    </div>
  );
};

export default Recommendations;
