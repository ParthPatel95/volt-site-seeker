
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useVoltMarketAuth } from './useVoltMarketAuth';

interface Message {
  id: string;
  conversation_id: string;
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
    price: number;
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
      const { data, error } = await supabase
        .from('voltmarket_conversations')
        .select(`
          *,
          listing:voltmarket_listings(title, price),
          messages:voltmarket_messages(*),
          buyer:voltmarket_profiles!buyer_id(company_name, profile_image_url),
          seller:voltmarket_profiles!seller_id(company_name, profile_image_url)
        `)
        .or(`buyer_id.eq.${profile.id},seller_id.eq.${profile.id}`)
        .order('last_message_at', { ascending: false });

      if (error) throw error;

      const formattedConversations = data?.map(conv => {
        const otherParty = conv.buyer_id === profile.id ? conv.seller : conv.buyer;
        const messages = conv.messages || [];
        const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;
        const unreadCount = messages.filter(m => m.recipient_id === profile.id && !m.is_read).length;

        return {
          ...conv,
          other_party: otherParty,
          messages,
          last_message: lastMessage,
          unread_count: unreadCount
        };
      }) || [];

      setConversations(formattedConversations);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (listingId: string, recipientId: string, message: string) => {
    if (!profile) return;

    try {
      // First, find or create conversation
      let { data: conversation } = await supabase
        .from('voltmarket_conversations')
        .select('id')
        .eq('listing_id', listingId)
        .or(`and(buyer_id.eq.${profile.id},seller_id.eq.${recipientId}),and(buyer_id.eq.${recipientId},seller_id.eq.${profile.id})`)
        .single();

      if (!conversation) {
        const { data: newConv } = await supabase
          .from('voltmarket_conversations')
          .insert({
            listing_id: listingId,
            buyer_id: profile.id,
            seller_id: recipientId
          })
          .select('id')
          .single();
        conversation = newConv;
      }

      if (conversation) {
        await supabase
          .from('voltmarket_messages')
          .insert({
            conversation_id: conversation.id,
            sender_id: profile.id,
            recipient_id: recipientId,
            message
          });

        await supabase
          .from('voltmarket_conversations')
          .update({ last_message_at: new Date().toISOString() })
          .eq('id', conversation.id);

        fetchConversations();
      }
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
    sendMessage,
    markAsRead,
    fetchConversations
  };
};
