import React, { useState } from 'react';
import { RiSendPlaneFill } from "react-icons/ri";

const InputBox = ({ onSendMessage, isDarkMode }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const inputStyles = isDarkMode
    ? 'bg-[#1E293B] text-[#F1F5F9] placeholder-[#94A3B8] border-[#334155]'
    : 'bg-white text-[#0F172A] placeholder-[#64748B] border-[#E2E8F0]';

  const buttonStyles = isDarkMode
    ? 'bg-gradient-to-br from-[#3B82F6] to-[#6366F1] hover:from-[#60A5FA] hover:to-[#818CF8]'
    : 'bg-[#3B82F6] hover:bg-[#60A5FA]';

  return (
    <form
      onSubmit={handleSubmit}
      className={`flex justify-center p-4 border-t ${isDarkMode ? 'border-[#1E293B] bg-[#0F172A]' : 'border-[#E2E8F0] bg-[#F8FAFC]'}`}
    >
      <div className="flex items-center w-1/2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          className={`flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] ${inputStyles}`}
        />
        <button
          type="submit"
          className={`ml-2 text-white rounded-full p-2 focus:outline-none ${buttonStyles}`}
        >
          <RiSendPlaneFill />
        </button>
      </div>
    </form>
  );
};

export default InputBox; 