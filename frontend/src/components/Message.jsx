import React from 'react';

const Message = ({ message, isUser, timestamp, isDarkMode }) => {
  const userMessageStyles = isDarkMode
    ? 'bg-gradient-to-br from-[#3B82F6] to-[#6366F1] text-[#F1F5F9]'
    : 'bg-[#3B82F6] text-[#F1F5F9] hover:bg-[#60A5FA]';

  const botMessageStyles = isDarkMode
    ? 'bg-[#1E293B] text-[#F1F5F9]'
    : 'bg-[#E2E8F0] text-[#0F172A]';

  const timestampColor = isDarkMode ? 'text-[#94A3B8]' : 'text-[#64748B]';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-2`}>
      <div className="flex flex-col max-w-[85%]">
        <div
          className={`rounded-2xl px-4 py-2 shadow-sm ${
            isUser ? userMessageStyles : botMessageStyles
          }`}
        >
          <p className="text-sm break-words">{message}</p>
        </div>
        {timestamp && (
          <span
            className={`text-xs mt-1 ${
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