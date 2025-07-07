
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
  created_at: string;
  last_message_at: string;
  listing: {
    title: string;
    asking_price: number;
  };
  other_party: {
    company_name: string;
    profile_image_url?: string;
  };
  messages: Message[];
  last_message?: Message;
  unread_count: number;
}

export const useVoltMarketConversations = () => {
  const { profile } = useVoltMarketAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchConversations = async () => {
    if (!profile) return;

    setLoading(true);
    try {
      // Fetch conversations with related data
      const { data: conversationData, error: convError } = await supabase
        .from('voltmarket_conversations')
        .select(`
          *,
          listing:voltmarket_listings!voltmarket_conversations_listing_id_fkey(title, asking_price),
          buyer:voltmarket_profiles!voltmarket_conversations_buyer_id_fkey(company_name, profile_image_url),
          seller:voltmarket_profiles!voltmarket_conversations_seller_id_fkey(company_name, profile_image_url)
        `)
        .or(`buyer_id.eq.${profile.id},seller_id.eq.${profile.id}`)
        .order('last_message_at', { ascending: false });

      if (convError) throw convError;

      // Fetch messages for each conversation
      const conversationsWithMessages = await Promise.all(
        (conversationData || []).map(async (conv) => {
          const { data: messages, error: msgError } = await supabase
            .from('voltmarket_messages')
            .select('*')
            .eq('listing_id', conv.listing_id)
            .or(`sender_id.eq.${profile.id},recipient_id.eq.${profile.id}`)
            .order('created_at', { ascending: true });

          if (msgError) {
            console.error('Error fetching messages:', msgError);
          }

          const otherParty = conv.buyer_id === profile.id ? conv.seller : conv.buyer;
          const messageList = messages || [];
          const lastMessage = messageList.length > 0 ? messageList[messageList.length - 1] : null;
          const unreadCount = messageList.filter(m => m.recipient_id === profile.id && !m.is_read).length;

          return {
            ...conv,
            listing: conv.listing || { title: 'Unknown Listing', asking_price: 0 },
            other_party: otherParty || { company_name: 'Unknown', profile_image_url: null },
            messages: messageList,
            last_message: lastMessage,
            unread_count: unreadCount
          } as Conversation;
        })
      );

      setConversations(conversationsWithMessages);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const createConversation = async (listingId: string, recipientId: string) => {
    if (!profile) throw new Error('Must be logged in');

    console.log('createConversation called with:', { listingId, recipientId, profileId: profile.id });

    try {
      // Check if conversation already exists
      const { data: existingConv, error: existingError } = await supabase
        .from('voltmarket_conversations')
        .select('id')
        .eq('listing_id', listingId)
        .or(`and(buyer_id.eq.${profile.id},seller_id.eq.${recipientId}),and(buyer_id.eq.${recipientId},seller_id.eq.${profile.id})`)
        .maybeSingle();

      console.log('Existing conversation check:', { existingConv, existingError });

      if (existingConv) {
        console.log('Found existing conversation:', existingConv.id);
        return existingConv.id;
      }

      console.log('Creating new conversation...');
      // Create new conversation
      const { data: newConv, error } = await supabase
        .from('voltmarket_conversations')
        .insert({
          listing_id: listingId,
          buyer_id: profile.id,
          seller_id: recipientId
        })
        .select('id')
        .single();

      console.log('New conversation result:', { newConv, error });

      if (error) throw error;
      
      await fetchConversations();
      return newConv.id;
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  };

  const sendMessage = async (listingId: string, recipientId: string, message: string) => {
    if (!profile) return;

    try {
      // Insert message directly using listing_id
      await supabase
        .from('voltmarket_messages')
        .insert({
          listing_id: listingId,
          sender_id: profile.id,
          recipient_id: recipientId,
          message
        });

      // Update conversation last_message_at
      await supabase
        .from('voltmarket_conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('listing_id', listingId)
        .or(`and(buyer_id.eq.${profile.id},seller_id.eq.${recipientId}),and(buyer_id.eq.${recipientId},seller_id.eq.${profile.id})`);

      fetchConversations();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const markAsRead = async (messageId: string) => {
    try {
      await supabase
        .from('voltmarket_messages')
        .update({ is_read: true })
        .eq('id', messageId);
      
      fetchConversations();
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [profile]);

  return {
    conversations,
    loading,
    createConversation,
    sendMessage,
    markAsRead,
    fetchConversations
  };
};
