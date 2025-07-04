import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import UserHome from './pages/UserHome';
import AdminHome from './pages/AdminHome';
import Books from './pages/Books';
import BookShelf from './pages/BookShelf';
import './App.css';

/**
 * 메인 App 컴포넌트
 * React Router를 사용하여 페이지 라우팅을 설정
 * 사용자 페이지를 기본으로 하고 관리자 페이지를 별도 경로로 설정
 */
function App() {
  return (
    <Router>
      <div className="App">
        {/* 라우트 설정 */}
        <Routes>
          {/* 사용자 메인 페이지 (기본 페이지) */}
          <Route path="/" element={<UserHome />} />
          
          {/* 관리자 페이지들 */}
          <Route path="/admin" element={<AdminHome />} />
          <Route path="/admin/books" element={<Books />} />
          <Route path="/admin/book-shelf" element={<BookShelf />} />
          
          {/* 관리자 페이지로 리다이렉트 */}
          <Route path="/books" element={<Navigate to="/admin/books" replace />} />
          <Route path="/book-shelf" element={<Navigate to="/admin/book-shelf" replace />} />
          
          {/* 기본 리다이렉트 - 잘못된 경로는 사용자 메인 페이지로 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
