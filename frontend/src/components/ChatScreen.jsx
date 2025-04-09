import React, { useState, useEffect, useRef } from 'react';
import MessageList from './MessageList';
import InputBox from './InputBox';
import { GoSun } from "react-icons/go";
import { FaRegMoon } from "react-icons/fa";

const ChatScreen = () => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() =>
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );

  const botMessageIndexRef = useRef(null);

  // Handle system theme change
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => setIsDarkMode(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const handleSendMessage = async (message) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setMessages(prev => [...prev, { text: message, isUser: true, timestamp }]);
    setIsLoading(true);

    const botMessage = {
      text: '',
      isUser: false,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isTyping: true
    };

    setMessages(prev => {
      const updated = [...prev, botMessage];
      botMessageIndexRef.current = updated.length - 1;
      return updated;
    });

    try {
      const eventSource = new EventSource(`http://localhost:8000/chat-stream?prompt=${encodeURIComponent(message)}`);

      eventSource.onmessage = (event) => {
        if (event.data === "[DONE]") {
          eventSource.close();
          setIsLoading(false);
          return;
        }

        try {
          const data = JSON.parse(event.data);
          if (data.response) {
            const idx = botMessageIndexRef.current;
            setMessages(prev => {
              const updated = [...prev];
              if (updated[idx]) {
                updated[idx] = {
                  ...updated[idx],
                  text: updated[idx].text + data.response,
                  isTyping: false
                };
              }
              return updated;
            });
          }
        } catch (err) {
          console.error("Error parsing streamed message:", err);
        }
      };

      eventSource.onerror = (err) => {
        console.error("EventSource error:", err);
        eventSource.close();
        setIsLoading(false);
      };

    } catch (error) {
      console.error("Streaming error:", error);
      setMessages(prev => [...prev, {
        text: `[Error]: ${error.message}`,
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isTyping: false
      }]);
      setIsLoading(false);
    }
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div className={`flex flex-col h-screen ${isDarkMode ? 'bg-[#0F172A]' : 'bg-[#F8FAFC]'}`}>
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
