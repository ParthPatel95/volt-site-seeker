
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { useVoltMarketConversations } from '@/hooks/useVoltMarketConversations';
import { useVoltMarketAuth } from '@/contexts/VoltMarketAuthContext';
import { useVoltMarketRealtime } from '@/hooks/useVoltMarketRealtime';
import { useVoltMarketAnalytics } from '@/hooks/useVoltMarketAnalytics';
import { 
  MessageSquare, 
  Send, 
  Search, 
  Building2,
  Clock,
  Circle,
  Phone,
  Video,
  MoreHorizontal,
  Bell,
  BellOff
} from 'lucide-react';

export const VoltMarketEnhancedMessages: React.FC = () => {
  const { profile } = useVoltMarketAuth();
  const { conversations, loading, sendMessage, markAsRead } = useVoltMarketConversations();
  const { messages, onlineUsers, isUserOnline } = useVoltMarketRealtime();
  const { trackUserActivity } = useVoltMarketAnalytics();
  const { toast } = useToast();
  
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedConversation = conversations.find(c => c.id === selectedConversationId);
  const conversationMessages = selectedConversation?.messages || [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationMessages]);

  useEffect(() => {
    // Track messaging activity
    if (selectedConversationId) {
      trackUserActivity('message_thread_viewed', { conversation_id: selectedConversationId });
    }
  }, [selectedConversationId, trackUserActivity]);

  // Real-time notification handler
  useEffect(() => {
    if (messages.length > 0 && notificationsEnabled) {
      const latestMessage = messages[messages.length - 1];
      if (latestMessage.recipient_id === profile?.id && !latestMessage.is_read) {
        // Show browser notification if supported
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('New VoltMarket Message', {
            body: `${latestMessage.message.substring(0, 50)}...`,
            icon: '/favicon.ico'
          });
        }
        
        toast({
          title: "New Message",
          description: "You have received a new message"
        });
      }
    }
  }, [messages, notificationsEnabled, profile, toast]);

  const handleConversationSelect = async (conversationId: string) => {
    setSelectedConversationId(conversationId);
    
    // Mark messages as read
    const conversation = conversations.find(c => c.id === conversationId);
    if (conversation && profile) {
      const unreadMessages = conversation.messages.filter(
        m => m.recipient_id === profile.id && !m.is_read
      );
      
      for (const message of unreadMessages) {
        await markAsRead(message.id);
      }
    }
  };

  const handleSendMessage = async () => {
    if (newMessage.trim() && selectedConversation && profile) {
      const recipientId = selectedConversation.buyer_id === profile.id 
        ? selectedConversation.seller_id 
        : selectedConversation.buyer_id;
        
      await sendMessage(selectedConversation.listing_id, recipientId, newMessage.trim());
      setNewMessage('');
      
      // Track message sent
      trackUserActivity('message_sent', { 
        conversation_id: selectedConversationId,
        message_length: newMessage.length 
      });
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        toast({
          title: "Notifications Enabled",
          description: "You'll now receive desktop notifications for new messages"
        });
      }
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.other_party.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.listing.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return '1 day ago';
    return `${Math.floor(diffInHours / 24)} days ago`;
  };

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n.charAt(0)).join('').toUpperCase() || 'U';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Enhanced Messages</h1>
            <p className="text-gray-600">Real-time communication with buyers and sellers</p>
          </div>
          
          <div className="flex items-center gap-4">
            <Button
              variant={notificationsEnabled ? "default" : "outline"}
              size="sm"
              onClick={() => {
                if (!notificationsEnabled) {
                  requestNotificationPermission();
                }
                setNotificationsEnabled(!notificationsEnabled);
              }}
            >
              {notificationsEnabled ? <Bell className="w-4 h-4 mr-2" /> : <BellOff className="w-4 h-4 mr-2" />}
              Notifications
            </Button>
            
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Circle className="w-2 h-2 fill-green-500 text-green-500" />
              {onlineUsers.size} online
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[700px]">
          {/* Enhanced Conversations List */}
          <div className="lg:col-span-1">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Conversations ({conversations.length})
                </CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-1 max-h-[500px] overflow-y-auto">
                  {filteredConversations.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      {conversations.length === 0 ? 'No conversations yet' : 'No matching conversations'}
                    </div>
                  ) : (
                    filteredConversations.map((conversation) => {
                      const otherPartyId = conversation.buyer_id === profile?.id 
                        ? conversation.seller_id 
                        : conversation.buyer_id;
                      const isOnline = isUserOnline(otherPartyId);
                      
                      return (
                        <div
                          key={conversation.id}
                          onClick={() => handleConversationSelect(conversation.id)}
                          className={`p-4 cursor-pointer hover:bg-gray-50 border-b border-gray-100 ${
                            selectedConversationId === conversation.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="relative">
                              <Avatar className="w-10 h-10">
                                <AvatarImage src={conversation.other_party.profile_image_url || ''} />
                                <AvatarFallback className="bg-blue-100 text-blue-600">
                                  {getInitials(conversation.other_party.company_name || 'Unknown')}
                                </AvatarFallback>
                              </Avatar>
                              {isOnline && (
                                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                              )}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <h3 className="text-sm font-medium text-gray-900 truncate">
                                  {conversation.other_party.company_name || 'Unknown Company'}
                                </h3>
                                {conversation.unread_count > 0 && (
                                  <Badge variant="default" className="text-xs">
                                    {conversation.unread_count}
                                  </Badge>
                                )}
                              </div>
                              
                              <p className="text-xs text-gray-500 mb-1 truncate">
                                <Building2 className="w-3 h-3 inline mr-1" />
                                {conversation.listing.title}
                              </p>
                              
                              {conversation.last_message && (
                                <p className="text-xs truncate text-gray-600">
                                  {conversation.last_message.message}
                                </p>
                              )}
                              
                              <div className="flex items-center justify-between text-xs text-gray-400 mt-1">
                                <div className="flex items-center">
                                  <Clock className="w-3 h-3 mr-1" />
                                  {formatTimeAgo(conversation.last_message?.created_at || conversation.last_message_at)}
                                </div>
                                {isOnline && (
                                  <span className="text-green-500 text-xs">Online</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Message Thread */}
          <div className="lg:col-span-2">
            <Card className="h-full flex flex-col">
              {selectedConversation ? (
                <>
                  {/* Enhanced Message Header */}
                  <CardHeader className="border-b">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={selectedConversation.other_party.profile_image_url || ''} />
                            <AvatarFallback className="bg-blue-100 text-blue-600">
                              {getInitials(selectedConversation.other_party.company_name || 'Unknown')}
                            </AvatarFallback>
                          </Avatar>
                          {isUserOnline(selectedConversation.buyer_id === profile?.id 
                            ? selectedConversation.seller_id 
                            : selectedConversation.buyer_id) && (
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                          )}
                        </div>
                        
                        <div>
                          <CardTitle className="text-lg">
                            {selectedConversation.other_party.company_name || 'Unknown Company'}
                          </CardTitle>
                          <p className="text-sm text-gray-600 flex items-center">
                            <Building2 className="w-4 h-4 mr-1" />
                            {selectedConversation.listing.title}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Phone className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Video className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  {/* Enhanced Messages */}
                  <CardContent className="flex-1 overflow-y-auto p-4">
                    <div className="space-y-4">
                      {conversationMessages
                        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                        .map((message) => {
                          const isOwnMessage = message.sender_id === profile?.id;
                          return (
                            <div
                              key={message.id}
                              className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                            >
                              <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                isOwnMessage
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-gray-100 text-gray-900'
                              }`}>
                                <p className="text-sm">{message.message}</p>
                                <div className="flex items-center justify-between mt-1">
                                  <p className={`text-xs ${
                                    isOwnMessage ? 'text-blue-100' : 'text-gray-500'
                                  }`}>
                                    {formatTimeAgo(message.created_at)}
                                  </p>
                                  {isOwnMessage && (
                                    <div className="flex">
                                      <div className={`w-1 h-1 rounded-full mr-1 ${
                                        message.is_read ? 'bg-blue-300' : 'bg-blue-100'
                                      }`} />
                                      <div className={`w-1 h-1 rounded-full ${
                                        message.is_read ? 'bg-blue-300' : 'bg-blue-100'
                                      }`} />
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      <div ref={messagesEndRef} />
                    </div>
                  </CardContent>

                  {/* Enhanced Message Input */}
                  <div className="border-t p-4">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Type your message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                        className="flex-1"
                      />
                      <Button 
                        onClick={handleSendMessage} 
                        disabled={!newMessage.trim()}
                        className="px-6"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                      <span>Press Enter to send, Shift+Enter for new line</span>
                      {isUserOnline(selectedConversation.buyer_id === profile?.id 
                        ? selectedConversation.seller_id 
                        : selectedConversation.buyer_id) && (
                        <span className="text-green-500">● Online</span>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <CardContent className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Enhanced Messaging</h3>
                    <p className="text-gray-600 mb-4">Select a conversation to start real-time messaging</p>
                    <div className="text-sm text-gray-500">
                      <p>✓ Real-time notifications</p>
                      <p>✓ Online status indicators</p>
                      <p>✓ Read receipts</p>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
