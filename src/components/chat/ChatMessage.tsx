import React from 'react';
import { User, Bot } from 'lucide-react';
import { ChatMessage as ChatMessageType } from '../../types';

interface ChatMessageProps {
  message: ChatMessageType;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.sender === 'user';
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[75%] ${isUser ? 'flex-row-reverse' : ''}`}>
        <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
          isUser ? 'bg-indigo-100 ml-2' : 'bg-teal-100 mr-2'
        }`}>
          {isUser ? (
            <User size={16} className="text-indigo-600" />
          ) : (
            <Bot size={16} className="text-teal-600" />
          )}
        </div>
        
        <div className={`p-3 rounded-lg ${
          isUser 
            ? 'bg-indigo-500 text-white rounded-tr-none' 
            : 'bg-gray-100 text-gray-800 rounded-tl-none'
        }`}>
          <p className="text-sm">{message.content}</p>
          <div className={`text-xs mt-1 ${isUser ? 'text-indigo-100' : 'text-gray-500'}`}>
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;