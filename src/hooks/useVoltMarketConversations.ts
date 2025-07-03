
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
  listing_id: string;
  sender_id: string;
  recipient_id: string;
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
      // Get all messages involving this user and group by listing
      const { data: messagesData, error } = await supabase
        .from('voltmarket_messages')
        .select(`
          *,
          listing:voltmarket_listings!inner(id, title, status),
          sender:voltmarket_profiles!voltmarket_messages_sender_id_fkey(id, company_name, user_id),
          recipient:voltmarket_profiles!voltmarket_messages_recipient_id_fkey(id, company_name, user_id)
        `)
        .or(`sender_id.eq.${profile.id},recipient_id.eq.${profile.id}`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching messages:', error);
        return;
      }

      // Group messages by listing to create conversations
      const conversationMap = new Map<string, any>();
      
      messagesData?.forEach((msg: any) => {
        const listingId = msg.listing_id;
        const otherUserId = msg.sender_id === profile.id ? msg.recipient_id : msg.sender_id;
        const conversationKey = `${listingId}-${otherUserId}`;

        if (!conversationMap.has(conversationKey)) {
          const participant = msg.sender_id === profile.id ? msg.recipient : msg.sender;
          conversationMap.set(conversationKey, {
            id: conversationKey,
            listing_id: listingId,
            buyer_id: profile.id,
            seller_id: otherUserId,
            last_message_at: msg.created_at,
            created_at: msg.created_at,
            listing: msg.listing,
            participant,
            last_message: {
              message: msg.message,
              sender_id: msg.sender_id,
              created_at: msg.created_at
            },
            unread_count: 0
          });
        } else {
          // Update last message if this one is newer
          const conversation = conversationMap.get(conversationKey);
          if (new Date(msg.created_at) > new Date(conversation.last_message_at)) {
            conversation.last_message = {
              message: msg.message,
              sender_id: msg.sender_id,
              created_at: msg.created_at
            };
            conversation.last_message_at = msg.created_at;
          }
        }
      });

      // Calculate unread counts
      for (const [key, conversation] of conversationMap) {
        const { count } = await supabase
          .from('voltmarket_messages')
          .select('*', { count: 'exact', head: true })
          .eq('listing_id', conversation.listing_id)
          .eq('recipient_id', profile.id)
          .eq('is_read', false);
        
        conversation.unread_count = count || 0;
      }

      setConversations(Array.from(conversationMap.values()));
    } catch (error) {
      console.error('Error in fetchConversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    if (!profile) return;

    try {
      const [listingId, otherUserId] = conversationId.split('-');
      
      const { data, error } = await supabase
        .from('voltmarket_messages')
        .select(`
          *,
          sender:voltmarket_profiles!voltmarket_messages_sender_id_fkey(id, company_name, user_id)
        `)
        .eq('listing_id', listingId)
        .or(`and(sender_id.eq.${profile.id},recipient_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},recipient_id.eq.${profile.id})`)
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
      const [listingId, recipientId] = conversationId.split('-');
      
      const { error } = await supabase
        .from('voltmarket_messages')
        .insert({
          listing_id: listingId,
          sender_id: profile.id,
          recipient_id: recipientId,
          message,
          is_read: false
        });

      if (error) {
        console.error('Error sending message:', error);
        return;
      }

      // Refresh messages and conversations
      await fetchMessages(conversationId);
      await fetchConversations();
    } catch (error) {
      console.error('Error in sendMessage:', error);
    }
  };

  const markMessagesAsRead = async (conversationId: string) => {
    if (!profile) return;

    try {
      const [listingId, otherUserId] = conversationId.split('-');
      
      await supabase
        .from('voltmarket_messages')
        .update({ is_read: true })
        .eq('listing_id', listingId)
        .eq('sender_id', otherUserId)
        .eq('recipient_id', profile.id);

      // Refresh conversations to update unread count
      await fetchConversations();
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const createConversation = async (listingId: string, sellerId: string) => {
    if (!profile) return null;

    try {
      // Check if conversation already exists
      const { data: existingMessages } = await supabase
        .from('voltmarket_messages')
        .select('id')
        .eq('listing_id', listingId)
        .or(`and(sender_id.eq.${profile.id},recipient_id.eq.${sellerId}),and(sender_id.eq.${sellerId},recipient_id.eq.${profile.id})`)
        .limit(1);

      if (existingMessages && existingMessages.length > 0) {
        // Conversation already exists
        await fetchConversations();
        return { id: `${listingId}-${sellerId}` };
      }

      // Create initial message to start conversation
      const { error } = await supabase
        .from('voltmarket_messages')
        .insert({
          listing_id: listingId,
          sender_id: profile.id,
          recipient_id: sellerId,
          message: 'Hi, I\'m interested in your listing.',
          is_read: false
        });

      if (error) {
        console.error('Error creating conversation:', error);
        return null;
      }

      await fetchConversations();
      return { id: `${listingId}-${sellerId}` };
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

  // Set up real-time subscriptions for messages
  useEffect(() => {
    if (!profile) return;

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
