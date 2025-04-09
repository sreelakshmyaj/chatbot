import React, { useEffect, useRef, useState } from 'react';
import Message from './Message';

const MessageList = ({ messages, isDarkMode, renderedMessages }) => {
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);
  const [isAtBottom, setIsAtBottom] = useState(true);

  const scrollToBottom = () => {
    if (isAtBottom && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleScroll = () => {
    const container = containerRef.current;
    if (container) {
      const threshold = 40; 
      const atBottom = container.scrollHeight - container.scrollTop - container.clientHeight < threshold;
      setIsAtBottom(atBottom);
    }
  };

  // Scroll when new messages come in
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className={`h-full ${isDarkMode ? 'bg-[#0F172A]' : 'bg-[#F8FAFC]'}`}
    >
      <div className="flex flex-col space-y-3 px-4 py-2 w-full">
        {messages.map((msg, index) => (
          <Message
            key={index}
            message={msg.text}
            isUser={msg.isUser}
            timestamp={msg.timestamp}
            isDarkMode={isDarkMode}
            isTyping={msg.isTyping}
            isRendered={renderedMessages.has(index)}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default MessageList;
