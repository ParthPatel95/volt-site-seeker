
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  MessageSquare, 
  Send, 
  Search, 
  Building2,
  Clock,
  Filter
} from 'lucide-react';

export const VoltMarketMessages: React.FC = () => {
  const [selectedConversation, setSelectedConversation] = useState<string | null>('1');
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data - in a real app, this would come from the database
  const conversations = [
    {
      id: '1',
      listingTitle: '150MW Data Center Site - Dallas, Texas',
      participantName: 'Texas Power Development',
      lastMessage: 'Would you be interested in a site visit next week?',
      lastMessageTime: '2 hours ago',
      unreadCount: 2,
      isRead: false,
      avatar: 'TP'
    },
    {
      id: '2',
      listingTitle: 'Bitcoin Mining Hosting - 50MW Available',
      participantName: 'Wyoming Mining Co',
      lastMessage: 'Our current rates are very competitive...',
      lastMessageTime: '1 day ago',
      unreadCount: 0,
      isRead: true,
      avatar: 'WM'
    },
    {
      id: '3',
      listingTitle: 'Industrial Equipment Package',
      participantName: 'PowerTech Solutions',
      lastMessage: 'The equipment is in excellent condition',
      lastMessageTime: '3 days ago',
      unreadCount: 1,
      isRead: false,
      avatar: 'PS'
    }
  ];

  const messages = [
    {
      id: '1',
      senderId: 'other',
      senderName: 'Texas Power Development',
      content: 'Hi, I saw your inquiry about our Dallas data center site. Would you like to schedule a call to discuss the details?',
      timestamp: '10:30 AM',
      isRead: true
    },
    {
      id: '2',
      senderId: 'me',
      senderName: 'You',
      content: 'Yes, I\'m very interested. What would be the best time for you this week?',
      timestamp: '10:45 AM',
      isRead: true
    },
    {
      id: '3',
      senderId: 'other',
      senderName: 'Texas Power Development',
      content: 'Would you be interested in a site visit next week? We can arrange a full tour of the facility and discuss the technical specifications in detail.',
      timestamp: '2 hours ago',
      isRead: false
    }
  ];

  const selectedConversationData = conversations.find(c => c.id === selectedConversation);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      console.log('Sending message:', newMessage);
      setNewMessage('');
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.participantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.listingTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Messages</h1>
          <p className="text-gray-600">Communicate with buyers and sellers</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[700px]">
          {/* Conversations List */}
          <div className="lg:col-span-1">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Conversations
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
                  {filteredConversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      onClick={() => setSelectedConversation(conversation.id)}
                      className={`p-4 cursor-pointer hover:bg-gray-50 border-b border-gray-100 ${
                        selectedConversation === conversation.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className="bg-blue-100 text-blue-600">
                            {conversation.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="text-sm font-medium text-gray-900 truncate">
                              {conversation.participantName}
                            </h3>
                            {conversation.unreadCount > 0 && (
                              <Badge variant="default" className="text-xs">
                                {conversation.unreadCount}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mb-1 truncate">
                            <Building2 className="w-3 h-3 inline mr-1" />
                            {conversation.listingTitle}
                          </p>
                          <p className={`text-xs truncate ${conversation.isRead ? 'text-gray-500' : 'text-gray-900 font-medium'}`}>
                            {conversation.lastMessage}
                          </p>
                          <div className="flex items-center text-xs text-gray-400 mt-1">
                            <Clock className="w-3 h-3 mr-1" />
                            {conversation.lastMessageTime}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Message Thread */}
          <div className="lg:col-span-2">
            <Card className="h-full flex flex-col">
              {selectedConversationData ? (
                <>
                  {/* Message Header */}
                  <CardHeader className="border-b">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{selectedConversationData.participantName}</CardTitle>
                        <p className="text-sm text-gray-600 flex items-center">
                          <Building2 className="w-4 h-4 mr-1" />
                          {selectedConversationData.listingTitle}
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        <Filter className="w-4 h-4 mr-1" />
                        View Listing
                      </Button>
                    </div>
                  </CardHeader>

                  {/* Messages */}
                  <CardContent className="flex-1 overflow-y-auto p-4">
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.senderId === 'me' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.senderId === 'me'
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}>
                            <p className="text-sm">{message.content}</p>
                            <p className={`text-xs mt-1 ${
                              message.senderId === 'me' ? 'text-blue-100' : 'text-gray-500'
                            }`}>
                              {message.timestamp}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>

                  {/* Message Input */}
                  <div className="border-t p-4">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Type your message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        className="flex-1"
                      />
                      <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <CardContent className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No conversation selected</h3>
                    <p className="text-gray-600">Select a conversation to start messaging</p>
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
