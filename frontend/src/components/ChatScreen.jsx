import React, { useState, useEffect } from 'react';
import MessageList from './MessageList';
import InputBox from './InputBox';
import TypingIndicator from './TypingIndicator';
import { GoSun } from "react-icons/go";
import { FaRegMoon } from "react-icons/fa";


const ChatScreen = () => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Handle system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => setIsDarkMode(e.matches);
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const handleSendMessage = async (message) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Add user message
    setMessages((prev) => [...prev, { 
      text: message, 
      isUser: true,
      timestamp 
    }]);
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message,
          model: "llama2",
          stream: false
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 504) {
          throw new Error("The model is taking too long to respond. Please try breaking down your question into smaller parts.");
        }
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Add bot response
      setMessages((prev) => [...prev, { 
        text: data.response, 
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages((prev) => [...prev, { 
        text: `Error: ${error.message}`, 
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div className={`flex flex-col h-screen ${isDarkMode ? 'bg-[#0F172A]' : 'light bg-[#F8FAFC]'}`}>
      <header className={`px-6 py-3 border-b ${isDarkMode ? 'border-[#1E293B] bg-[#0F172A]' : 'border-[#E2E8F0] bg-white'}`}>
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <h1 className={`text-xl font-bold ${isDarkMode ? 'text-[#F1F5F9]' : 'text-[#0F172A]'}`}>
            ChatBot
          </h1>
          <button
            onClick={toggleTheme}
            className={`p-2 text-lg rounded-full ${isDarkMode ? 'text-[#F1F5F9] hover:bg-[#1E293B]' : 'text-[#0F172A] hover:bg-[#E2E8F0]'}`}
          >
            {isDarkMode ? <GoSun /> : <FaRegMoon />}
          </button>
        </div>
      </header>
      
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="max-w-2xl mx-auto">
            <MessageList messages={messages} isDarkMode={isDarkMode} />
            {isLoading && <TypingIndicator isDarkMode={isDarkMode} />}
          </div>
        </div>
        <div className="max-w-2xl mx-auto w-full">
          <InputBox onSendMessage={handleSendMessage} isDarkMode={isDarkMode} />
        </div>
      </div>
    </div>
  );
};

export default ChatScreen; 