
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useVoltMarketAuth } from './useVoltMarketAuth';

interface Message {
  id: string;
  listing_id: string;
  sender_id: string;
  recipient_id: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

interface Conversation {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  last_message_at: string;
  listing: {
    title: string;
  };
  messages: Message[];
  other_party: {
    company_name: string;
  };
  unread_count: number;
  last_message?: Message;
}

export const useVoltMarketConversations = () => {
  const { profile } = useVoltMarketAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchConversations = async () => {
    if (!profile) return;

    setLoading(true);
    try {
      // Get all messages where user is sender or recipient
      const { data: messages, error: messagesError } = await supabase
        .from('voltmarket_messages')
        .select(`
          *,
          listing:voltmarket_listings(title),
          sender:voltmarket_profiles!sender_id(company_name),
          recipient:voltmarket_profiles!recipient_id(company_name)
        `)
        .or(`sender_id.eq.${profile.id},recipient_id.eq.${profile.id}`)
        .order('created_at', { ascending: false });

      if (messagesError) throw messagesError;

      // Group messages by listing and participants
      const conversationMap = new Map();
      
      messages?.forEach((message: any) => {
        const otherPartyId = message.sender_id === profile.id ? message.recipient_id : message.sender_id;
        const conversationKey = `${message.listing_id}-${otherPartyId}`;
        
        if (!conversationMap.has(conversationKey)) {
          const otherParty = message.sender_id === profile.id ? message.recipient : message.sender;
          const unreadCount = messages.filter(m => 
            m.recipient_id === profile.id && 
            !m.is_read && 
            m.listing_id === message.listing_id &&
            (m.sender_id === otherPartyId || m.recipient_id === otherPartyId)
          ).length;

          conversationMap.set(conversationKey, {
            id: conversationKey,
            listing_id: message.listing_id,
            buyer_id: message.sender_id === profile.id ? profile.id : otherPartyId,
            seller_id: message.recipient_id === profile.id ? profile.id : otherPartyId,
            last_message_at: message.created_at,
            listing: message.listing,
            messages: [],
            other_party: otherParty,
            unread_count: unreadCount,
            last_message: message
          });
        }
        
        conversationMap.get(conversationKey).messages.push(message);
        
        // Update last message if this one is newer
        const conversation = conversationMap.get(conversationKey);
        if (new Date(message.created_at) > new Date(conversation.last_message_at)) {
          conversation.last_message_at = message.created_at;
          conversation.last_message = message;
        }
      });

      setConversations(Array.from(conversationMap.values()));
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const createConversation = async (listingId: string, recipientId: string) => {
    if (!profile) return null;

    try {
      // Check if conversation already exists
      const { data: existingMessage } = await supabase
        .from('voltmarket_messages')
        .select('id')
        .eq('listing_id', listingId)
        .or(`and(sender_id.eq.${profile.id},recipient_id.eq.${recipientId}),and(sender_id.eq.${recipientId},recipient_id.eq.${profile.id})`)
        .limit(1)
        .maybeSingle();

      if (existingMessage) {
        await fetchConversations();
        return existingMessage;
      }

      // Create initial message
      const { data, error } = await supabase
        .from('voltmarket_messages')
        .insert({
          listing_id: listingId,
          sender_id: profile.id,
          recipient_id: recipientId,
          message: "Hello! I'm interested in your listing.",
          is_read: false
        })
        .select()
        .single();

      if (error) throw error;

      await fetchConversations();
      return data;
    } catch (error) {
      console.error('Error creating conversation:', error);
      return null;
    }
  };

  const sendMessage = async (listingId: string, recipientId: string, message: string) => {
    if (!profile) return null;

    try {
      const { data, error } = await supabase
        .from('voltmarket_messages')
        .insert({
          listing_id: listingId,
          sender_id: profile.id,
          recipient_id: recipientId,
          message,
          is_read: false
        })
        .select()
        .single();

      if (error) throw error;

      await fetchConversations();
      return data;
    } catch (error) {
      console.error('Error sending message:', error);
      return null;
    }
  };

  const markAsRead = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('voltmarket_messages')
        .update({ is_read: true })
        .eq('id', messageId)
        .eq('recipient_id', profile?.id);

      if (error) throw error;
      await fetchConversations();
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  useEffect(() => {
    if (profile) {
      fetchConversations();
    }
  }, [profile]);

  return {
    conversations,
    loading,
    fetchConversations,
    createConversation,
    sendMessage,
    markAsRead
  };
};
