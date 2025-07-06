import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { ChatMessage } from '../types';
import { generateUniqueId } from '../utils/helpers';
import { generateResponse, generatePlan } from '../lib/gemini';
import { API_URL } from '../constant';

interface GeneratePlanResponse {
  title: string;
  description: string;
  steps: Array<{
    title: string;
    description: string;
    order: number;
  }>;
}

interface ChatContextType {
  messages: ChatMessage[];
  isTyping: boolean;
  sendMessage: (content: string) => Promise<void>;
  clearMessages: () => void;
  generatedPlans: GeneratePlanResponse[];
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
  const [generatedPlans, setGeneratedPlans] = useState<GeneratePlanResponse[]>([]);

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

  const savePlanToDatabase = async (plan: GeneratePlanResponse): Promise<any> => {
    console.log('Attempting to save plan to database:', plan);

    try {
      // Add timeout to the fetch request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(`${API_URL}/plans`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          title: plan.title,
          description: plan.description,
          steps: plan.steps,
          category: 'personal', // Default category, can be enhanced later
          is_ai_generated: true,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server response error:', errorText);
        throw new Error(`Failed to save plan: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const savedPlan = await response.json();
      console.log('Plan saved successfully:', savedPlan);
      return savedPlan;
    } catch (error) {
      console.error('Error saving plan:', error);

      // More specific error handling
      if (error.name === 'AbortError') {
        console.error('Request timed out');
        throw new Error('Request timed out. Please check if the server is running.');
      } else if (error instanceof TypeError && error.message.includes('fetch')) {
        console.error('Network error - server might not be running');
        throw new Error('Cannot connect to server. Please check if the server is running on port 3001.');
      } else {
        throw error;
      }
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
      const isPlanRequest =
        content.toLowerCase().includes('plan') ||
        content.toLowerCase().includes('routine') ||
        content.toLowerCase().includes('help me') ||
        content.toLowerCase().includes('create') ||
        content.toLowerCase().includes('make');

      console.log('Plan request detected:', isPlanRequest, 'for message:', content);

      if (isPlanRequest) {
        console.log('Processing plan request:', content);

        try {
          const plan = await generatePlan(content);
          console.log('Generated plan:', plan);

          if (plan && plan.title && plan.description && Array.isArray(plan.steps) && plan.steps.length > 0) {
            try {
              const savedPlan = await savePlanToDatabase(plan);
              console.log('Plan saved to database:', savedPlan);

              const formattedResponse = formatMessage(
                `📋 I've created and saved a plan for you: "${plan.title}"\n\n${plan.description}\n\n` +
                  `**Steps:**\n${plan.steps
                    .map((step, index) => `${index + 1}. **${step.title}**: ${step.description}`)
                    .join('\n')}\n\n` +
                  `✅ This plan has been saved to your Plans List, where you can view all the steps and track your progress!`,
              );

              const aiMessage: ChatMessage = {
                id: generateUniqueId(),
                sender: 'ai',
                content: formattedResponse,
                timestamp: new Date(),
              };

              setMessages((prev) => [...prev, aiMessage]);
              setGeneratedPlans((prev) => [...prev, plan]);
            } catch (saveError) {
              console.error('Error saving plan to database:', saveError);

              // Still show the plan even if saving failed
              const formattedResponse = formatMessage(
                `📋 I've created a plan for you: "${plan.title}"\n\n${plan.description}\n\n` +
                  `**Steps:**\n${plan.steps
                    .map((step, index) => `${index + 1}. **${step.title}**: ${step.description}`)
                    .join('\n')}\n\n` +
                  `⚠️ Note: I couldn't save this plan to your database (${saveError.message}), but you can still use it from this conversation.`,
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
            // Plan generation failed or returned invalid structure
            console.error('Plan generation failed or returned invalid structure:', plan);

            // Fall back to regular response generation
            console.log('Falling back to regular response generation');
            const response = await generateResponse(content);
            const formattedResponse = formatMessage(
              response ||
                "I'm having trouble creating a detailed plan right now. Could you provide more specific details about what you'd like help with?",
            );

            const aiMessage: ChatMessage = {
              id: generateUniqueId(),
              sender: 'ai',
              content: formattedResponse,
              timestamp: new Date(),
            };

            setMessages((prev) => [...prev, aiMessage]);
          }
        } catch (planError) {
          console.error('Error generating plan:', planError);

          // Try regular response as fallback
          try {
            const response = await generateResponse(content);
            const formattedResponse = formatMessage(
              response || "I'm having some technical difficulties right now. Could you try again in a moment?",
            );

            const aiMessage: ChatMessage = {
              id: generateUniqueId(),
              sender: 'ai',
              content: formattedResponse,
              timestamp: new Date(),
            };

            setMessages((prev) => [...prev, aiMessage]);
          } catch (responseError) {
            console.error('Both plan generation and regular response failed:', responseError);

            const errorMessage: ChatMessage = {
              id: generateUniqueId(),
              sender: 'ai',
              content:
                "🤔 I'm experiencing some technical difficulties. Please try again in a moment, or rephrase your request.",
              timestamp: new Date(),
            };

            setMessages((prev) => [...prev, errorMessage]);
          }
        }
      } else {
        console.log('Regular response generation for:', content);

        try {
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
              content: "🤔 I'm having trouble generating a response right now. Could you try rephrasing your question?",
              timestamp: new Date(),
            };

            setMessages((prev) => [...prev, errorMessage]);
          }
        } catch (responseError) {
          console.error('Error generating regular response:', responseError);

          const errorMessage: ChatMessage = {
            id: generateUniqueId(),
            sender: 'ai',
            content: "😔 I'm having some technical issues right now. Please try again in a moment.",
            timestamp: new Date(),
          };

          setMessages((prev) => [...prev, errorMessage]);
        }
      }
    } catch (error) {
      console.error('Unexpected error in sendMessage:', error);

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
