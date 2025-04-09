import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { IoCopyOutline } from "react-icons/io5";
import { IoCheckmarkOutline } from "react-icons/io5";

const Message = ({ message, isUser, timestamp, isDarkMode, isTyping, isRendered }) => {
  const [isCopied, setIsCopied] = useState(false);

  const userMessageStyles = isDarkMode
    ? 'bg-gradient-to-br from-[#3B82F6] to-[#6366F1] text-white'
    : 'bg-[#3B82F6] text-white hover:bg-[#60A5FA]';

  const botMessageStyles = isDarkMode
    ? 'bg-[#1E293B] text-[#F1F5F9]'
    : 'bg-[#E2E8F0] text-[#0F172A]';

  const timestampColor = isDarkMode ? 'text-[#94A3B8]' : 'text-[#64748B]';

  const dotStyles = isDarkMode ? 'bg-[#F1F5F9]' : 'bg-[#0F172A]';

  const copyButtonStyles = isDarkMode
    ? 'text-[#94A3B8] hover:text-[#F1F5F9]'
    : 'text-[#64748B] hover:text-[#0F172A]';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const markdownComponents = {
    p: ({ children }) => <p className="my-0 leading-relaxed">{children}</p>,
    strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
    em: ({ children }) => <em className="italic">{children}</em>,
    code: ({ children, inline }) =>
      inline ? (
        <code className="bg-gray-200 text-sm px-1 py-0.5 rounded">{children}</code>
      ) : (
        <pre className="bg-gray-800 text-gray-100 p-3 rounded-md overflow-x-auto text-sm my-2">
          <code className="whitespace-pre-wrap">{children}</code>
        </pre>
      ),
    ul: ({ children }) => <ul className="list-disc pl-5 my-0">{children}</ul>,
    ol: ({ children }) => <ol className="list-decimal pl-6 my-0 space-y-1">{children}</ol>,
    li: ({ children }) => <li className="my-0">{children}</li>,
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-600 dark:text-gray-300 my-2">
        {children}
      </blockquote>
    ),
    h1: ({ children }) => <h1 className="text-xl font-bold my-0">{children}</h1>,
    h2: ({ children }) => <h2 className="text-lg font-semibold my-0">{children}</h2>,
    a: ({ href, children }) => (
      <a href={href} className="text-blue-600 underline hover:text-blue-800" target="_blank" rel="noreferrer">
        {children}
      </a>
    ),
  };
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-2`}>
      <div className="flex flex-col max-w-[85%]">
        <div
          className={`rounded-3xl px-4 py-2 shadow-sm transition-all duration-500 overflow-hidden ${
            isUser ? userMessageStyles : botMessageStyles
          }`}
        >
          {message ? (
            <div className="relative w-full">
              <div className="my-markdown prose dark:prose-invert max-w-none text-inherit [&>p]:my-0 [&>p]:leading-relaxed">
                <ReactMarkdown components={markdownComponents}>
                  {message}
                </ReactMarkdown>
              </div>
              {!isUser && isRendered && (
                <div className="mt-2 mb-1 mr-1 flex justify-end">
                  <button
                    onClick={handleCopy}
                    className={`rounded-full ${copyButtonStyles}`}
                    title="Copy message"
                  >
                    {isCopied ? <IoCheckmarkOutline size={20} /> : <IoCopyOutline size={20} />}
                  </button>
                </div>
              )}
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