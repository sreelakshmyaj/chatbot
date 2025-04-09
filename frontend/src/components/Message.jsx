import React from 'react';

const Message = ({ message, isUser, timestamp, isDarkMode, isTyping }) => {
  const userMessageStyles = isDarkMode
    ? 'bg-gradient-to-br from-[#3B82F6] to-[#6366F1] text-[#F1F5F9]'
    : 'bg-[#3B82F6] text-[#F1F5F9] hover:bg-[#60A5FA]';

  const botMessageStyles = isDarkMode
    ? 'bg-[#1E293B] text-[#F1F5F9]'
    : 'bg-[#E2E8F0] text-[#0F172A]';

  const timestampColor = isDarkMode ? 'text-[#94A3B8]' : 'text-[#64748B]';

  const dotStyles = isDarkMode ? 'bg-[#F1F5F9]' : 'bg-[#0F172A]';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-2`}>
      <div className="flex flex-col max-w-[85%]">
        <div
          className={`rounded-2xl px-4 py-2 shadow-sm transition-all duration-500 overflow-hidden ${
            isUser ? userMessageStyles : botMessageStyles
          }`}
        >
          {message ? (
            <div className="relative">
              <p className="text-sm break-words animate-text-appear">
                {message}
              </p>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer pointer-events-none" />
            </div>
          ) : isTyping ? (
            <div className="flex space-x-1 transition-opacity duration-300">
              <div className={`w-2 h-2 rounded-full ${dotStyles} animate-bounce transition-all duration-300`} style={{ animationDelay: '0ms' }}></div>
              <div className={`w-2 h-2 rounded-full ${dotStyles} animate-bounce transition-all duration-300`} style={{ animationDelay: '150ms' }}></div>
              <div className={`w-2 h-2 rounded-full ${dotStyles} animate-bounce transition-all duration-300`} style={{ animationDelay: '300ms' }}></div>
            </div>
          ) : null}
        </div>
        {timestamp && (
          <span
            className={`text-xs mt-1 transition-colors duration-300 ${
              isUser ? 'text-right' : 'text-left'
            } ${timestampColor}`}
          >
            {timestamp}
          </span>
        )}
      </div>
    </div>
  );
};

export default Message; 