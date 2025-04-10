import React, { useState, useEffect, useRef } from 'react';
import MessageList from './MessageList';
import InputBox from './InputBox';
import { GoSun } from "react-icons/go";
import { FaRegMoon } from "react-icons/fa";
import { IoDownloadOutline, IoDocumentTextOutline, IoDocumentAttachOutline } from "react-icons/io5";

const ChatScreen = () => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() =>
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportMenuRef = useRef(null);

  const botMessageIndexRef = useRef(null);
  const eventSourceRef = useRef(null);
  const [renderedMessages, setRenderedMessages] = useState(new Set());

  // Handle system theme change
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => setIsDarkMode(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Close export menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target)) {
        setShowExportMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleStopGeneration = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      setIsLoading(false);
      setMessages(prev => {
        const updated = [...prev];
        if (updated[botMessageIndexRef.current]) {
          updated[botMessageIndexRef.current] = {
            ...updated[botMessageIndexRef.current],
            isTyping: false
          };
        }
        return updated;
      });
    }
  };

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
      eventSourceRef.current = eventSource;

      eventSource.onmessage = (event) => {
        if (event.data === "[DONE]") {
          eventSource.close();
          setIsLoading(false);
          setRenderedMessages(prev => new Set([...prev, botMessageIndexRef.current]));
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
                  text: (updated[idx].text || "") + data.response,
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

  const handleExport = async (format) => {
    setShowExportMenu(false);
    try {
      const response = await fetch(`http://localhost:8000/export-conversation?format=${format}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `conversation_${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export error:', error);
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
          <div className="flex items-center space-x-4">
            <div className="relative" ref={exportMenuRef}>
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className={`p-2 rounded-full transition-all duration-200 ${
                  isDarkMode 
                    ? 'text-[#F1F5F9] hover:bg-[#1E293B] hover:shadow-lg hover:shadow-[#1E293B]/20' 
                    : 'text-[#0F172A] hover:bg-[#E2E8F0] hover:shadow-lg hover:shadow-[#E2E8F0]/20'
                }`}
                title="Export conversation"
              >
                <IoDownloadOutline size={20} />
              </button>
              {showExportMenu && (
                <div className={`absolute right-0 mt-2 w-48 rounded-lg shadow-2xl z-50 ${
                  isDarkMode 
                    ? 'bg-[#1E293B] border border-[#334155] shadow-[#1E293B]/50' 
                    : 'bg-white border border-[#E2E8F0] shadow-[#0F172A]/10'
                }`}>
                  <div className="py-1">
                    <button
                      onClick={() => handleExport('pdf')}
                      className={`flex items-center w-full px-4 py-2.5 text-sm transition-colors duration-200 ${
                        isDarkMode 
                          ? 'text-[#F1F5F9] hover:bg-[#334155]' 
                          : 'text-[#0F172A] hover:bg-[#F1F5F9]'
                      }`}
                    >
                      <IoDocumentAttachOutline className="mr-2" size={18} />
                      Export as PDF
                    </button>
                    <button
                      onClick={() => handleExport('md')}
                      className={`flex items-center w-full px-4 py-2.5 text-sm transition-colors duration-200 ${
                        isDarkMode 
                          ? 'text-[#F1F5F9] hover:bg-[#334155]' 
                          : 'text-[#0F172A] hover:bg-[#F1F5F9]'
                      }`}
                    >
                      <IoDocumentTextOutline className="mr-2" size={18} />
                      Export as Markdown
                    </button>
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={toggleTheme}
              className={`p-2 text-lg rounded-full transition-all duration-200 ${
                isDarkMode 
                  ? 'text-[#F1F5F9] hover:bg-[#1E293B] hover:shadow-lg hover:shadow-[#1E293B]/20' 
                  : 'text-[#0F172A] hover:bg-[#E2E8F0] hover:shadow-lg hover:shadow-[#E2E8F0]/20'
              }`}
            >
              {isDarkMode ? <GoSun /> : <FaRegMoon />}
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="max-w-2xl mx-auto">
            <MessageList 
              messages={messages} 
              isDarkMode={isDarkMode} 
              renderedMessages={renderedMessages}
            />
          </div>
        </div>
        <div className="max-w-2xl mx-auto w-full">
          <InputBox 
            onSendMessage={handleSendMessage} 
            isDarkMode={isDarkMode} 
            isLoading={isLoading}
            onStopGeneration={handleStopGeneration}
          />
        </div>
      </div>
    </div>
  );
};

export default ChatScreen;
