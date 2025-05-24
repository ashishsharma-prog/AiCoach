import React from 'react';
import ChatInterface from '../components/chat/ChatInterface';
import { useChat } from '../context/ChatContext';
import { Sparkles, Target, Zap, Clock } from 'lucide-react';

const Chat: React.FC = () => {
  const { sendMessage } = useChat();
  
  const quickPrompts = [
    { icon: <Sparkles size={16} />, text: "Generate a new coaching plan" },
    { icon: <Target size={16} />, text: "Help me define my goals" },
    { icon: <Zap size={16} />, text: "I'm feeling unmotivated today" },
    { icon: <Clock size={16} />, text: "Time management tips" }
  ];
  
  return (
    <div className="h-full flex flex-col md:flex-row gap-6">
      <div className="w-full md:w-3/4 h-[calc(100vh-9rem)] md:h-[calc(100vh-8rem)]">
        <ChatInterface />
      </div>
      
      <div className="w-full md:w-1/4">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h3 className="font-medium text-gray-900 mb-3">Quick Prompts</h3>
          
          <div className="space-y-2">
            {quickPrompts.map((prompt, index) => (
              <button
                key={index}
                onClick={() => sendMessage(prompt.text)}
                className="w-full flex items-center p-3 text-left rounded-md hover:bg-gray-50 border border-gray-200 transition-colors"
              >
                <span className="flex-shrink-0 mr-2 text-teal-500">{prompt.icon}</span>
                <span className="text-sm text-gray-700">{prompt.text}</span>
              </button>
            ))}
          </div>
          
          <div className="mt-6 bg-indigo-50 rounded-md p-4">
            <h4 className="text-sm font-medium text-indigo-800 mb-2">Pro Tip</h4>
            <p className="text-xs text-indigo-700">
              Be specific with your questions to get more personalized coaching. Try including details about your goals and challenges.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;