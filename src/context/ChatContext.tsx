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
      const { data: userData, error: Usererror } = await supabase
        .from('users')
        .insert({
          id: user.id,
        })
        .select()
        .single();
    
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
        plan_id: planData.id || 'kekwekekekek',
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
        console.log('Plan request detected:', content);
        
        const plan = await generatePlan(content);
        console.log('Generated plan:', plan);
        
        if (plan && plan.title && plan.description && Array.isArray(plan.steps)) {
          try {
            const savedPlan = await savePlanToDatabase(plan);
            console.log('Saved plan result:', savedPlan);
            
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
            } else {
              // Plan generation succeeded but saving failed
              const errorMessage: ChatMessage = {
                id: generateUniqueId(),
                sender: 'ai',
                content: '📋 I created a plan for you, but couldn\'t save it to your database. The plan is still available in this conversation.',
                timestamp: new Date(),
              };
              setMessages((prev) => [...prev, errorMessage]);
            }
          } catch (saveError) {
            console.error('Error saving plan to database:', saveError);
            
            // Still show the plan even if saving failed
            const formattedResponse = formatMessage(
              `📋 I've created a plan for you: "${plan.title}"\n\n${plan.description}\n\n` +
              `**Steps:**\n${plan.steps.map((step, index) => 
                `• ${step.title}: ${step.description}`
              ).join('\n')}\n\n` +
              `Note: I couldn't save this plan to your database, but you can still use it from this conversation.`
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
        } else {
          // Plan generation failed
          console.error('Plan generation failed or returned invalid structure:', plan);
          
          // Fall back to regular response generation
          console.log('Falling back to regular response generation');
          const response = await generateResponse(content);
          const formattedResponse = formatMessage(response || "I'm having trouble creating a detailed plan right now. Could you provide more specific details about what you'd like help with?");
          
          const aiMessage: ChatMessage = {
            id: generateUniqueId(),
            sender: 'ai',
            content: formattedResponse,
            timestamp: new Date(),
          };
          
          setMessages((prev) => [...prev, aiMessage]);
        }
      } else {
        console.log('Regular response generation');
        const response = await generateResponse(content);
        
        if (response) {
          const formattedResponse = formatMessage(response);
          const aiMessage: ChatMessage = {
            id: generateUniqueId(),
            sender: 'ai',
            content: formattedResponse,
            timestamp: new Date(),
          };
          
          setMessages((prev) => [...prev, aiMessage]);
        } else {
          // Handle case where generateResponse returns null/undefined
          const errorMessage: ChatMessage = {
            id: generateUniqueId(),
            sender: 'ai',
            content: '🤔 I\'m having trouble generating a response right now. Could you try rephrasing your question?',
            timestamp: new Date(),
          };
          
          setMessages((prev) => [...prev, errorMessage]);
        }
      }
    } catch (error) {
      console.error('Error in sendMessage:', error);
      
      // More detailed error logging
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      
      const errorMessage: ChatMessage = {
        id: generateUniqueId(),
        sender: 'ai',
        content: '😔 I apologize, but I encountered an unexpected error. Please try again or rephrase your request.',
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  }, []);
  
  // Optional: Add a separate function to handle plan requests more cleanly
  const handlePlanRequest = async (content: string): Promise<ChatMessage> => {
    try {
      const plan = await generatePlan(content);
      
      if (!plan || !plan.title || !plan.description || !Array.isArray(plan.steps)) {
        throw new Error('Invalid plan structure received');
      }
      
      const savedPlan = await savePlanToDatabase(plan);
      
      const baseMessage = `📋 I've created a plan for you: "${plan.title}"\n\n${plan.description}\n\n` +
        `**Steps:**\n${plan.steps.map((step, index) => 
          `• ${step.title}: ${step.description}`
        ).join('\n')}\n\n`;
      
      const saveMessage = savedPlan 
        ? `I've saved this plan to your Plans List, where you can view all the steps and track your progress.`
        : `Note: I couldn't save this plan to your database, but you can still use it from this conversation.`;
      
      const formattedResponse = formatMessage(baseMessage + saveMessage);
      
      return {
        id: generateUniqueId(),
        sender: 'ai',
        content: formattedResponse,
        timestamp: new Date(),
      };
    } catch (error) {
      console.error('Error handling plan request:', error);
      throw error; // Re-throw to be handled by the main try-catch
    }
  };

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
