import axios from 'axios';

// Flask 백엔드 서버의 기본 URL 설정
// Flask 서버가 5001번 포트에서 실행됨
const API_BASE_URL = 'http://localhost:5001';

// axios 인스턴스 생성 및 기본 설정
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10초 타임아웃
  headers: {
    'Content-Type': 'application/json',
  },
});

// API 서비스 클래스 정의
class ApiService {
  /**
   * 모든 도서 목록을 가져오는 함수
   * @returns {Promise<Array>} 도서 목록 배열
   */
  static async getBooks() {
    try {
      const response = await api.get('/get_books');
      return response.data;
    } catch (error) {
      console.error('도서 목록 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 도서 검색 함수
   * @param {string} query - 검색어 (책 제목 또는 저자)
   * @returns {Promise<Array>} 검색 결과 배열
   */
  static async searchBooks(query) {
    try {
      const response = await api.get(`/search?query=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      console.error('도서 검색 실패:', error);
      throw error;
    }
  }

  /**
   * 책 스캔 시작 함수
   * @returns {Promise<Object>} 스캔 시작 결과
   */
  static async startScan() {
    try {
      const response = await api.post('/scan');
      return response.data;
    } catch (error) {
      console.error('스캔 시작 실패:', error);
      throw error;
    }
  }

  /**
   * 책 스캔 종료 함수
   * @returns {Promise<Object>} 스캔 종료 결과
   */
  static async stopScan() {
    try {
      const response = await api.post('/scan_exit');
      return response.data;
    } catch (error) {
      console.error('스캔 종료 실패:', error);
      throw error;
    }
  }

  /**
   * 도서 상태 업데이트 함수
   * @param {Object} scanData - 스캔된 데이터
   * @returns {Promise<Object>} 업데이트 결과
   */
  static async updateBookStatus(scanData) {
    try {
      const response = await api.post('/update_book_status', scanData);
      return response.data;
    } catch (error) {
      console.error('도서 상태 업데이트 실패:', error);
      throw error;
    }
  }

  /**
   * 로봇 상태 조회 함수
   * @returns {Promise<Object>} 로봇 상태 정보
   */
  static async getRobotStatus() {
    try {
      const response = await api.get('/robot_status');
      return response.data;
    } catch (error) {
      console.error('로봇 상태 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 로봇 상태 설정 함수
   * @param {string} status - 설정할 상태 ('normal', 'scanning', 'complete')
   * @returns {Promise<Object>} 상태 설정 결과
   */
  static async setRobotStatus(status) {
    try {
      const response = await api.post('/set_robot_status', { status });
      return response.data;
    } catch (error) {
      console.error('로봇 상태 설정 실패:', error);
      throw error;
    }
  }
  static async getRecommendations() {
    // TODO: 실제 엔드포인트가 준비되면 아래 주석 해제
    // const response = await api.get('/recommendations');
    // return response.data;

    // 임시 목 데이터
    return [
      {
        barcode: '0001',
        title: '따라하며 쉽게 배우는 모던 리액트 완벽 입문',
        author: '야마다 요시히로',
        thumbnail: `/images/example1.jpg`
      },
      {
        barcode: '0002',
        title: '웹 개발자를 위한 자바스크립트의 모든 것',
        author: 'T. J. 크라우더',
        thumbnail: `/images/example2.jpg`
      },
      // 필요에 따라 샘플 도서 추가…
    ];
  }
}

export default ApiService; 