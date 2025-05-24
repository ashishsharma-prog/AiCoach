import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { ChatMessage, CoachingPlan } from '../types';
import { generateUniqueId } from '../utils/helpers';
import { generateResponse, generatePlan } from '../lib/gemini';
import { supabase } from '../lib/supabase';

interface ChatContextType {
  messages: ChatMessage[];
  isTyping: boolean;
  sendMessage: (content: string) => void;
  clearMessages: () => void;
  generatedPlans: CoachingPlan[];
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'ai',
      content: "👋 Hello! I'm your AI coach. How can I help you with your goals today?",
      timestamp: new Date(),
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [generatedPlans, setGeneratedPlans] = useState<CoachingPlan[]>([]);

  const formatMessage = (content: string): string => {
    // Add emojis for common patterns
    let formatted = content
      .replace(/plan/i, '📋 plan')
      .replace(/goal/i, '🎯 goal')
      .replace(/help/i, '💡 help')
      .replace(/success/i, '✨ success')
      .replace(/motivation/i, '💪 motivation')
      .replace(/time/i, '⏰ time')
      .replace(/stress/i, '😌 stress')
      .replace(/balance/i, '⚖️ balance');

    // Format lists
    formatted = formatted.replace(/\n\d+\./g, '\n•');
    
    // Format headings
    formatted = formatted.replace(/^([A-Z][A-Za-z\s]+):/gm, '**$1:**');
    
    // Format important points
    formatted = formatted.replace(/Important:/gi, '**Important:**');
    formatted = formatted.replace(/Note:/gi, '**Note:**');
    
    return formatted;
  };

  const savePlanToDatabase = async (plan: any) => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.log('User not authenticated');
        return null;
      }

      const { data: planData, error: planError } = await supabase
        .from('plans')
        .insert({
          title: plan.title,
          description: plan.description,
          is_ai_generated: true,
          user_id: user.id,
        })
        .select()
        .single();

      if (planError) throw planError;

      const stepsToInsert = plan.steps.map((step: any) => ({
        plan_id: planData.id,
        title: step.title,
        description: step.description,
        order_number: step.order,
      }));

      const { error: stepsError } = await supabase
        .from('plan_steps')
        .insert(stepsToInsert);

      if (stepsError) throw stepsError;

      return planData;
    } catch (error) {
      console.error('Error saving plan:', error);
      return null;
    }
  };

  const sendMessage = useCallback(async (content: string) => {
    const userMessage: ChatMessage = {
      id: generateUniqueId(),
      sender: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    try {
      // Check if the message implies a plan request
      const isPlanRequest = content.toLowerCase().includes('plan') || 
                          content.toLowerCase().includes('routine') ||
                          content.toLowerCase().includes('help me');

      if (isPlanRequest) {
        const plan = await generatePlan(content);
        if (plan) {
          const savedPlan = await savePlanToDatabase(plan);
          if (savedPlan) {
            const formattedResponse = formatMessage(
              `📋 I've created a plan for you: "${plan.title}"\n\n${plan.description}\n\n` +
              `**Steps:**\n${plan.steps.map((step, index) => 
                `• ${step.title}: ${step.description}`
              ).join('\n')}\n\n` +
              `I've saved this plan to your Plans List, where you can view all the steps and track your progress.`
            );
            
            const aiMessage: ChatMessage = {
              id: generateUniqueId(),
              sender: 'ai',
              content: formattedResponse,
              timestamp: new Date(),
            };
            
            setMessages((prev) => [...prev, aiMessage]);
            setGeneratedPlans((prev) => [...prev, plan]);
          }
        }
      } else {
        const response = await generateResponse(content);
        const formattedResponse = formatMessage(response);
        const aiMessage: ChatMessage = {
          id: generateUniqueId(),
          sender: 'ai',
          content: formattedResponse,
          timestamp: new Date(),
        };
        
        setMessages((prev) => [...prev, aiMessage]);
      }
    } catch (error) {
      console.error('Error generating response:', error);
      const errorMessage: ChatMessage = {
        id: generateUniqueId(),
        sender: 'ai',
        content: '😔 I apologize, but I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([
      {
        id: generateUniqueId(),
        sender: 'ai',
        content: "👋 Hello! I'm your AI coach. How can I help you with your goals today?",
        timestamp: new Date(),
      },
    ]);
  }, []);

  return (
    <ChatContext.Provider
      value={{
        messages,
        isTyping,
        sendMessage,
        clearMessages,
        generatedPlans,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
