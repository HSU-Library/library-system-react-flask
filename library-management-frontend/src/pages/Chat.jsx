import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ApiService from '../services/api';
import '../styles/Chat.css';

const Chat = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: '안녕하세요! 무엇을 도와드릴까요?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);

  // 메시지 리스트 자동 스크롤용 ref
  const messagesEndRef = useRef(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  useEffect(scrollToBottom, [messages]);

  const handleBack = () => navigate(-1);

  const handleSend = async e => {
    e.preventDefault();
    if (!input.trim()) return;

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg = { role: 'user', content: input, timestamp: time };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsSending(true);

    try {
      // TODO: 실제 백엔드 Chat API 연결
      const response = await ApiService.chat(input);
      const botTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const assistantMsg = { role: 'assistant', content: response.content, timestamp: botTime };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.error('채팅 전송 실패:', err);
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: '오류가 발생했습니다. 다시 시도해 주세요.', timestamp: time }
      ]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="chat-page">

      <header className="chat-header">
        {/* 뒤로가기 */}
      <button
        className="chat-back-button"
        onClick={handleBack}
        aria-label="뒤로 가기"
      >
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
      </main>

      <form className="chat-form" onSubmit={handleSend}>
        <input
          type="text"
          className="chat-input"
          value={input}
          onChange={e => setInput(e.target.value)}
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
