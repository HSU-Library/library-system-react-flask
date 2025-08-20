// ChatButton.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/ChatButton.css';
import chatIcon from '../assets/sangsang_chatLast.png'; 

const ChatButton = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/chat');
  };

  return (
    <button
      className="chat-float-button"
      onClick={handleClick}
      title="상상챗으로 이동"
    >
      <img
        src={chatIcon}
        alt="상상 chat"
        className="chat-float-icon"
      />
    </button>
  );
};

export default ChatButton;
