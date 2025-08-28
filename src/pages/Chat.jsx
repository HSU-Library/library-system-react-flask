import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ApiService from '../services/api';
import '../styles/Chat.css';
import CustomDropdown from '../components/CustomDropdown';

const deptMap = {
  '크리에이티브인문예술대학': ['크리에이티브인문학부', '예술학부'],
  '미래융합사회과학대학': ['사회과학부'],
  '디자인대학': [
    '글로벌패션산업학부',
    'ICT디자인학부',
    '뷰티디자인매니지먼트학과',
    '뷰티매니지먼트학과(계)',
    '디지털콘텐츠디자인학과(계)',
    '인테리어디자인학과(계)',
  ],
  'IT공과대학': [
    '컴퓨터공학부',
    '기계전자공학부',
    '산업시스템공학부',
    '스마트제품혁신건설팅학과(계)',
  ],
  '창의융합대학': [
    '상상력인재학부',
    '문학문화콘텐츠학과',
    'AI응용학과',
    '융합보안학과',
    '미래모빌리티학과',
  ],
  '미래플러스대학': [
    '융합행정학과',
    '호텔외식경영학과',
    '뷰티디자인학과',
    '비즈니스컨설팅학과',
    'ICT융합디자인학과',
    'AI·소프트웨어학과',
  ],
  '글로벌인재대학': [
    '한국언어문화교육학과',
    '글로벌비즈니스인학과',
    '영상엔터테인먼트학과',
    '패션뷰티크리에이션학과',
    'SW융합학과',
    '글로벌벤처창업학과',
  ],
};

const Chat = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: '안녕하세요! 무엇을 도와드릴까요?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);

  const [recommendFlow, setRecommendFlow] = useState(false);
  const [year, setYear] = useState('');
  const [college, setCollege] = useState('');
  const [major, setMajor] = useState('');
  const [semester, setSemester] = useState('');

  const messagesEndRef = useRef(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  useEffect(scrollToBottom, [messages]);

  const handleBack = () => navigate(-1);

  const handleSuggestedClick = (type) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (type === 'recommend') {
      setRecommendFlow(true);
      return;
    }

    let userContent = '';
    switch (type) {
      case 'hours':
        userContent = '도서관 운영시간 알려줘';
        break;
      case 'loan':
        userContent = '대출 기간이 궁금해요';
        break;
      case 'homepage':
        window.open('https://hsel.hansung.ac.kr/', '_blank');
        return;
      default:
        return;
    }

    setMessages((prev) => [...prev, { role: 'user', content: userContent, timestamp: time }]);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return; // 공백 입력 방지
    
    // 1. 사용자 입력 메시지 객체 생성
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg = { role: 'user', content: input, timestamp: time };

    // 2. 메시지 목록에 사용자 메시지 추가
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsSending(true);

    try {
      // 3. Flask API 호출 (ApiService.chat)
      const response = await ApiService.chat(input);

       // 4. 응답 메시지 객체 생성
      const botTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const assistantMsg = {
        role: 'assistant',
        content: response.content, // 🔹 Flask → RAG 응답
        timestamp: botTime,
      };

      // 5. 메시지 목록에 봇 응답 추가
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error('채팅 전송 실패:', err);

      // 실패 시 에러 메시지 표시
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: '오류가 발생했습니다. 다시 시도해 주세요.',
          timestamp: time,
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="chat-page">
      <header className="chat-header">
        <button className="chat-back-button" onClick={handleBack} aria-label="뒤로 가기">
          ←
        </button>
        <div className="chat-header-content">
          <h1>상상 Chat</h1>
          <img
            src={`${process.env.PUBLIC_URL}/images/image3.png`}
            alt="HSU 마스코트"
            className="mascot-icon"
          />
        </div>
        <p>AI와 대화하며 도서를 추천받으세요</p>
      </header>

      <main className="chat-main">
        <ul className="message-list">
          {messages.map((msg, idx) => (
            <li key={idx} className={`message ${msg.role}`}>
              {msg.role === 'assistant' && (
                <img
                  src={`${process.env.PUBLIC_URL}/images/image3.png`}
                  alt="assistant icon"
                  className="message-icon"
                />
              )}
              <div className="message-bubble">
                <span className="message-content">{msg.content}</span>
                <span className="timestamp">{msg.timestamp}</span>
              </div>
            </li>
          ))}
          <div ref={messagesEndRef} />
        </ul>

        {messages.length === 1 && messages[0].role === 'assistant' && !recommendFlow && (
          <div className="suggested-questions">
            <p>👇 아래 질문 중 하나를 선택해보세요</p>
            <div className="button-group">
              <button onClick={() => handleSuggestedClick('recommend')}>📚 책 추천</button>
              <button onClick={() => handleSuggestedClick('hours')}>⏰ 오픈 / 마감</button>
              <button onClick={() => handleSuggestedClick('loan')}>📦 대출 기간</button>
              <button onClick={() => handleSuggestedClick('homepage')}>🌐 홈페이지</button>
            </div>
          </div>
        )}

        {recommendFlow && (
  <li className="message assistant">
    <img
      src={`${process.env.PUBLIC_URL}/images/image3.png`}
      alt="assistant icon"
      className="message-icon"
    />
    <div className="message-bubble">
      <p>📚 어떤 기준으로 책을 추천해드릴까요?<br />아래 항목을 모두 선택해주세요.</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
        {/* 학년 */}
        <CustomDropdown
  options={['1학년', '2학년', '3학년', '4학년']}
  selected={year}
  onSelect={setYear}
  placeholder="학년 선택"
/>


        {/* 단과대학 */}
        <CustomDropdown
          options={Object.keys(deptMap)}
          selected={college}
          onSelect={(option) => {
            setCollege(option);
            setMajor('');
          }}
          placeholder="단과대학 선택"
        />

        {/* 학과 */}
        {college && (
          <CustomDropdown
            options={deptMap[college]}
            selected={major}
            onSelect={setMajor}
            placeholder="학과 선택"
          />
        )}

        {/* 학기 */}
        <CustomDropdown
          options={["1학기", "2학기"]}
          selected={semester}
          onSelect={setSemester}
          placeholder="학기 선택"
        />

        {/* 추천 요청 */}
        <button
          className="search-button"
          onClick={() => {
            const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const message = `${year} ${college} ${major} 학생이 ${semester}에 읽을 책을 추천해줘`;
            setMessages((prev) => [
              ...prev,
              { role: 'user', content: message, timestamp: time }
            ]);
            setRecommendFlow(false);
            setYear('');
            setCollege('');
            setMajor('');
            setSemester('');
          }}
          disabled={!year || !college || !major || !semester}
        >
          📖 추천받기
        </button>
      </div>
    </div>
  </li>
)}

      </main>

      <form className="chat-form" onSubmit={handleSend}>
        <input
          type="text"
          className="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="메시지를 입력하세요..."
          disabled={isSending}
        />
        <button
          type="submit"
          className="chat-send-button"
          disabled={isSending || !input.trim()}
        >
          전송
        </button>
      </form>

      <footer className="chat-footer">
        <p>&copy; 2025 한성대학교 도서관 검색 시스템</p>
      </footer>
    </div>
  );
};

export default Chat;
