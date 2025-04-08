import React from 'react';

const TypingIndicator = ({ isDarkMode }) => {
  const dotStyles = isDarkMode
    ? 'bg-[#F1F5F9]'
    : 'bg-[#0F172A]';

  return (
    <div className="flex justify-start mb-2">
      <div className="flex flex-col max-w-[85%]">
        <div className={`rounded-2xl px-4 py-2 shadow-sm ${isDarkMode ? 'bg-[#1E293B]' : 'bg-[#E2E8F0]'}`}>
          <div className="flex space-x-1">
            <div className={`w-2 h-2 rounded-full ${dotStyles} animate-bounce`} style={{ animationDelay: '0ms' }}></div>
            <div className={`w-2 h-2 rounded-full ${dotStyles} animate-bounce`} style={{ animationDelay: '150ms' }}></div>
            <div className={`w-2 h-2 rounded-full ${dotStyles} animate-bounce`} style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator; 