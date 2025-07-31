// ChatButton.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/ChatButton.css';

const ChatButton = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/chat');
  };

  return (
    <button className="chat-float-button" onClick={handleClick} title="상상챗으로 이동">
      💬
    </button>
  );
};

export default ChatButton;
