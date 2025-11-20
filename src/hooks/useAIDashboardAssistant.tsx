import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface DashboardContext {
  dashboardName: string;
  market: string;
  timeRange: string;
  widgets: any[];
}

export const useAIDashboardAssistant = (dashboardContext: DashboardContext) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Hi! I'm your AI market analyst for ${dashboardContext.dashboardName}. Ask me anything about your data!`
    }
  ]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async (query: string): Promise<string | null> => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('dashboard-ai-assistant', {
        body: {
          query,
          dashboardContext,
          conversationHistory: messages.slice(-10)
        }
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const response = data.response;
      
      setMessages(prev => [
        ...prev,
        { role: 'user', content: query },
        { role: 'assistant', content: response }
      ]);

      return response;
    } catch (error) {
      console.error('AI Assistant error:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    messages,
    loading,
    sendMessage
  };
};
