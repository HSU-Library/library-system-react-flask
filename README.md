# Hansung University Library – 자율주행 서가 스캐너 로봇 프론트엔드
한성대학교 학술정보관 **자율주행 서가 스캐너 로봇**을 위한 **태블릿 기반 프론트엔드 시스템**입니다.  
로봇이 서가를 탐색하며 수집한 정보를 실시간으로 사용자(사서/이용자)에게 시각화해줍니다.

## 🚀 주요 기능
- 자율주행 로봇과 연동하여 실시간 데이터 수집
- 도서 위치 및 서가 상태 시각화
- 반응형 UI (Tablet 최적화)

## 🛠 Tech Stack
- **Frontend**: React, TypeScript, Tailwind CSS, React Query
- **Integration**: Flask (RAG 기반 챗봇 서버)


## 프로젝트 구조 (Folder Structure)
```md
## 📂 Project Structure
src/
 ┣ 📂 assets        # 이미지, 아이콘, 폰트 등 정적 리소스
 ┣ 📂 components    # 재사용 가능한 UI 컴포넌트 (Button, Header 등)
 ┣ 📂 pages         # 라우팅되는 화면 단위 컴포넌트 (ex. Home, Dashboard)
 ┣ 📂 services      # API 호출, 외부 통신 관련 모듈
 ┣ 📂 styles        # 전역 스타일, 테마, 공용 CSS
 ┣ App.css          # App.js 전용 스타일
 ┣ App.js           # 최상위 컴포넌트 (라우팅 및 레이아웃 관리)
 ┣ App.test.js      # App 컴포넌트 테스트 코드
 ┣ index.css        # 전역 스타일 시트
 ┣ index.js         # React DOM 진입점 (root 렌더링)
 ┣ logo.svg         # CRA 기본 로고 (커스터마이징 가능)
 ┣ reportWebVitals.js # 성능 측정/로그
 ┗ setupTests.js    # Jest/Testing Library 초기 세팅
