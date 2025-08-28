import React, { useState, useEffect } from 'react';
import ApiService from '../services/api';
import '../styles/ScanControls.css';

/**
 * 스캔 제어 컴포넌트
 * 도서 스캔 시작/종료 기능과 스캔 상태를 관리
 */
const ScanControls = () => {
  // 스캔 상태 관리
  const [isScanning, setIsScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState('');
  const [robotStatus, setRobotStatus] = useState('normal');

  /**
   * 컴포넌트 마운트 시 로봇 상태를 주기적으로 확인
   */
  useEffect(() => {
    // 초기 로봇 상태 확인
    checkRobotStatus();

    // 5초마다 로봇 상태 확인
    const interval = setInterval(checkRobotStatus, 5001);

    // 컴포넌트 언마운트 시 인터벌 정리
    return () => clearInterval(interval);
  }, []);

  /**
   * 로봇 상태 확인 함수
   */
  const checkRobotStatus = async () => {
    try {
      const response = await ApiService.getRobotStatus();
      setRobotStatus(response.status);
      
      // 스캔 상태에 따라 UI 업데이트
      if (response.status === 'scanning') {
        setIsScanning(true);
        setScanStatus('책 스캔 중...');
      } else if (response.status === 'complete') {
        setIsScanning(false);
        setScanStatus('스캔 완료!');
        
        // 3초 후 상태 메시지 제거
        setTimeout(() => {
          setScanStatus('');
        }, 3000);
      }
    } catch (error) {
      console.error('로봇 상태 확인 실패:', error);
    }
  };

  /**
   * 스캔 시작 함수
   */
  const handleStartScan = async () => {
    try {
      setIsScanning(true);
      setScanStatus('스캔 시작 중...');

      const response = await ApiService.startScan();
      
      if (response.success) {
        setScanStatus('책 스캔 중...');
        setRobotStatus('scanning');
      } else {
        setScanStatus('스캔 시작 실패!');
        setIsScanning(false);
        
        // 3초 후 상태 메시지 제거
        setTimeout(() => {
          setScanStatus('');
        }, 3000);
      }
    } catch (error) {
      console.error('스캔 시작 오류:', error);
      setScanStatus('오류 발생!');
      setIsScanning(false);
      
      // 3초 후 상태 메시지 제거
      setTimeout(() => {
        setScanStatus('');
      }, 3000);
    }
  };

  /**
   * 스캔 종료 함수
   */
  const handleStopScan = async () => {
    try {
      setScanStatus('종료 중...');

      const response = await ApiService.stopScan();
      
      if (response.success) {
        setScanStatus('스캔 종료됨');
        setIsScanning(false);
        setRobotStatus('complete');
      } else {
        setScanStatus('종료 실패');
      }
      
      // 3초 후 상태 메시지 제거
      setTimeout(() => {
        setScanStatus('');
      }, 3000);
    } catch (error) {
      console.error('스캔 종료 오류:', error);
      setScanStatus('오류 발생!');
      
      // 3초 후 상태 메시지 제거
      setTimeout(() => {
        setScanStatus('');
      }, 3000);
    }
  };

  return (
    <div className="scan-controls">
      {/* 스캔 제어 버튼들 */}
      <div className="scan-buttons">
        <button
          className={`scan-button start-scan ${isScanning ? 'disabled' : ''}`}
          onClick={handleStartScan}
          disabled={isScanning}
        >
          📖 책 스캔 시작
        </button>
        
        <button
          className={`scan-button stop-scan ${!isScanning ? 'disabled' : ''}`}
          onClick={handleStopScan}
          disabled={!isScanning}
        >
          ⏹️ 스캔 종료
        </button>
      </div>

      {/* 스캔 상태 표시 */}
      {scanStatus && (
        <div className="scan-status">
          <span className="status-text">{scanStatus}</span>
          {robotStatus === 'scanning' && (
            <div className="scanning-indicator">
              <div className="spinner"></div>
            </div>
          )}
        </div>
      )}

      {/* 로봇 상태 표시 */}
      <div className="robot-status">
        <span className="status-label">로봇 상태:</span>
        <span className={`status-value status-${robotStatus}`}>
          {robotStatus === 'normal' && '정상'}
          {robotStatus === 'scanning' && '스캔 중'}
          {robotStatus === 'complete' && '완료'}
        </span>
      </div>
    </div>
  );
};

export default ScanControls; 