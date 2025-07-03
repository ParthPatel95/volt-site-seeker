
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useVoltMarketAuth } from './useVoltMarketAuth';

export interface VoltMarketConversation {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  last_message_at: string;
  created_at: string;
  listing: {
    id: string;
    title: string;
    status: string;
  };
  participant: {
    id: string;
    company_name: string;
    user_id: string;
  };
  last_message?: {
    message: string;
    sender_id: string;
    created_at: string;
  };
  unread_count: number;
}

export interface VoltMarketMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  message: string;
  is_read: boolean;
  created_at: string;
  sender: {
    id: string;
    company_name: string;
    user_id: string;
  };
}

export const useVoltMarketConversations = () => {
  const { profile } = useVoltMarketAuth();
  const [conversations, setConversations] = useState<VoltMarketConversation[]>([]);
  const [messages, setMessages] = useState<VoltMarketMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConversations = async () => {
    if (!profile) return;

    try {
      const { data, error } = await supabase
        .from('voltmarket_conversations')
        .select(`
          *,
          listing:voltmarket_listings!inner(id, title, status),
          buyer:voltmarket_profiles!voltmarket_conversations_buyer_id_fkey(id, company_name, user_id),
          seller:voltmarket_profiles!voltmarket_conversations_seller_id_fkey(id, company_name, user_id)
        `)
        .order('last_message_at', { ascending: false });

      if (error) {
        console.error('Error fetching conversations:', error);
        return;
      }

      // Transform data to include participant info and last message
      const transformedConversations = await Promise.all(
        data.map(async (conv: any) => {
          const isUserBuyer = conv.buyer_id === profile.id;
          const participant = isUserBuyer ? conv.seller : conv.buyer;

          // Get last message for this conversation
          const { data: lastMessageData } = await supabase
            .from('voltmarket_messages')
            .select(`
              message,
              sender_id,
              created_at
            `)
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          // Get unread count
          const { count } = await supabase
            .from('voltmarket_messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conv.id)
            .eq('is_read', false)
            .neq('sender_id', profile.id);

          return {
            id: conv.id,
            listing_id: conv.listing_id,
            buyer_id: conv.buyer_id,
            seller_id: conv.seller_id,
            last_message_at: conv.last_message_at,
            created_at: conv.created_at,
            listing: conv.listing,
            participant,
            last_message: lastMessageData,
            unread_count: count || 0
          };
        })
      );

      setConversations(transformedConversations);
    } catch (error) {
      console.error('Error in fetchConversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from('voltmarket_messages')
        .select(`
          *,
          sender:voltmarket_profiles!voltmarket_messages_sender_id_fkey(id, company_name, user_id)
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        return;
      }

      setMessages(data || []);
    } catch (error) {
      console.error('Error in fetchMessages:', error);
    }
  };

  const sendMessage = async (conversationId: string, message: string) => {
    if (!profile) return;

    try {
      const { error } = await supabase
        .from('voltmarket_messages')
        .insert({
          conversation_id: conversationId,
          sender_id: profile.id,
          message,
          is_read: false
        });

      if (error) {
        console.error('Error sending message:', error);
        return;
      }

      // Update conversation's last_message_at
      await supabase
        .from('voltmarket_conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', conversationId);

      // Refresh messages
      await fetchMessages(conversationId);
      await fetchConversations();
    } catch (error) {
      console.error('Error in sendMessage:', error);
    }
  };

  const markMessagesAsRead = async (conversationId: string) => {
    if (!profile) return;

    try {
      await supabase
        .from('voltmarket_messages')
        .update({ is_read: true })
        .eq('conversation_id', conversationId)
        .neq('sender_id', profile.id);

      // Refresh conversations to update unread count
      await fetchConversations();
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const createConversation = async (listingId: string, sellerId: string) => {
    if (!profile) return null;

    try {
      const { data, error } = await supabase
        .from('voltmarket_conversations')
        .insert({
          listing_id: listingId,
          buyer_id: profile.id,
          seller_id: sellerId
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating conversation:', error);
        return null;
      }

      await fetchConversations();
      return data;
    } catch (error) {
      console.error('Error in createConversation:', error);
      return null;
    }
  };

  useEffect(() => {
    if (profile) {
      fetchConversations();
    }
  }, [profile]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!profile) return;

    const conversationsChannel = supabase
      .channel('conversations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'voltmarket_conversations'
        },
        () => {
          fetchConversations();
        }
      )
      .subscribe();

    const messagesChannel = supabase
      .channel('messages-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'voltmarket_messages'
        },
        () => {
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(conversationsChannel);
      supabase.removeChannel(messagesChannel);
    };
  }, [profile]);

  return {
    conversations,
    messages,
    loading,
    fetchMessages,
    sendMessage,
    markMessagesAsRead,
    createConversation,
    refreshConversations: fetchConversations
  };
};
