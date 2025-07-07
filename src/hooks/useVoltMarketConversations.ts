
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useVoltMarketAuth } from './useVoltMarketAuth';
import { useVoltMarketWebSocket } from './useVoltMarketWebSocket';

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
  const { sendMessage: wsSendMessage, onMessage } = useVoltMarketWebSocket();
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
          listing:voltmarket_listings(title, asking_price),
          buyer:voltmarket_profiles!buyer_id(company_name, profile_image_url),
          seller:voltmarket_profiles!seller_id(company_name, profile_image_url)
        `)
        .or(`buyer_id.eq.${profile.id},seller_id.eq.${profile.id}`)
        .order('last_message_at', { ascending: false });

      if (convError) {
        console.error('Conversation fetch error:', convError);
        // Fallback: try simpler query without joins
        const { data: simpleConversations, error: simpleError } = await supabase
          .from('voltmarket_conversations')
          .select('*')
          .or(`buyer_id.eq.${profile.id},seller_id.eq.${profile.id}`)
          .order('last_message_at', { ascending: false });
        
        if (simpleError) throw simpleError;
        
        // Transform simple data to expected format
        const conversationsWithDefaults = (simpleConversations || []).map(conv => ({
          ...conv,
          listing: { title: 'Loading...', asking_price: 0 },
          other_party: { company_name: 'Loading...', profile_image_url: null },
          messages: [],
          last_message: null,
          unread_count: 0
        }));
        
        setConversations(conversationsWithDefaults);
        setLoading(false);
        return;
      }

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
      // Set empty state on error
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  const createConversation = async (listingId: string, recipientId: string) => {
    if (!profile) throw new Error('Must be logged in');

    try {
      // Check if conversation already exists
      const { data: existingConv, error: existingError } = await supabase
        .from('voltmarket_conversations')
        .select('id')
        .eq('listing_id', listingId)
        .or(`and(buyer_id.eq.${profile.id},seller_id.eq.${recipientId}),and(buyer_id.eq.${recipientId},seller_id.eq.${profile.id})`)
        .maybeSingle();

      if (existingConv) {
        return existingConv.id;
      }

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

      if (error) throw error;
      
      return newConv.id;
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  };

  const sendMessage = async (listingId: string, recipientId: string, message: string) => {
    if (!profile) return;

    try {
      // Use WebSocket to send message (it handles database insertion)
      wsSendMessage(recipientId, listingId, message);
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
    if (!profile) return;
    
    fetchConversations();

    // Set up WebSocket message handling for real-time updates
    const unsubscribe = onMessage((message) => {
      console.log('WebSocket message received:', message);
      
      switch (message.type) {
        case 'new_message':
          // Refresh conversations when new message arrives
          fetchConversations();
          break;
          
        case 'message_read':
          // Update local state when message is marked as read
          setConversations(prev => 
            prev.map(conv => ({
              ...conv,
              messages: conv.messages.map(msg => 
                msg.id === message.messageId 
                  ? { ...msg, is_read: true }
                  : msg
              ),
              unread_count: conv.messages.filter(m => 
                m.recipient_id === profile.id && 
                !m.is_read && 
                m.id !== message.messageId
              ).length
            }))
          );
          break;
          
        case 'auth_success':
          console.log('WebSocket authenticated successfully');
          break;
          
        case 'error':
          console.error('WebSocket error:', message.message);
          break;
      }
    });

    // Cleanup WebSocket subscription
    return unsubscribe;
  }, [profile?.id, onMessage]); // Only re-run when profile id changes

  return {
    conversations,
    loading,
    createConversation,
    sendMessage,
    markAsRead,
    fetchConversations
  };
};
