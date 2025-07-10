import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useVoltMarketAuth } from '@/contexts/VoltMarketAuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  Mail, 
  Phone, 
  MessageSquare, 
  Clock, 
  CheckCircle,
  ExternalLink,
  Copy,
  Eye,
  User,
  Building
} from 'lucide-react';

interface ContactMessage {
  id: string;
  listing_id: string;
  sender_name: string;
  sender_email: string;
  sender_phone?: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export const VoltMarketContactMessages: React.FC = () => {
  const { profile } = useVoltMarketAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchMessages = async () => {
    if (!profile?.id) {
      setLoading(false);
      return;
    }

    try {
      const { data: contactMessages, error } = await supabase
        .from('voltmarket_contact_messages')
        .select('*')
        .eq('listing_owner_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching messages:', error);
        throw error;
      }

      setMessages(contactMessages || []);
      setUnreadCount((contactMessages || []).filter(msg => !msg.is_read).length);
    } catch (error) {
      console.error('Error fetching contact messages:', error);
      toast({
        title: "Error",
        description: "Failed to load contact messages",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('voltmarket_contact_messages')
        .update({ is_read: true })
        .eq('id', messageId);

      if (error) throw error;

      // Update local state
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId ? { ...msg, is_read: true } : msg
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));

      toast({
        title: "Message marked as read",
        description: "Message status updated successfully"
      });
    } catch (error) {
      console.error('Error marking message as read:', error);
      toast({
        title: "Error",
        description: "Failed to update message status",
        variant: "destructive"
      });
    }
  };

  const markAllAsRead = async () => {
    if (unreadCount === 0) return;

    try {
      const { error } = await supabase
        .from('voltmarket_contact_messages')
        .update({ is_read: true })
        .eq('listing_owner_id', profile?.id)
        .eq('is_read', false);

      if (error) throw error;

      // Update local state
      setMessages(prev => prev.map(msg => ({ ...msg, is_read: true })));
      setUnreadCount(0);

      toast({
        title: "All messages marked as read",
        description: "Successfully updated all message statuses"
      });
    } catch (error) {
      console.error('Error marking all messages as read:', error);
      toast({
        title: "Error",
        description: "Failed to update message statuses",
        variant: "destructive"
      });
    }
  };

  const copyContactInfo = (email: string, phone?: string) => {
    const contactInfo = `Email: ${email}${phone ? `\nPhone: ${phone}` : ''}`;
    navigator.clipboard.writeText(contactInfo);
    toast({
      title: "Contact info copied",
      description: "Contact information has been copied to clipboard"
    });
  };

  useEffect(() => {
    fetchMessages();
  }, [profile]);

  if (loading) {
    return (
      <div className="container mx-auto p-4 lg:p-6 max-w-4xl">
        <div className="mb-8">
          <div className="h-8 bg-muted rounded-lg w-48 mb-2 animate-pulse"></div>
          <div className="h-4 bg-muted rounded w-80 animate-pulse"></div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-32 mb-2"></div>
                <div className="h-4 bg-muted rounded w-48"></div>
              </CardHeader>
              <CardContent>
                <div className="h-20 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 lg:p-6 max-w-4xl">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Contact Messages</h1>
            <p className="text-muted-foreground text-lg">
              Messages from potential buyers about your listings
            </p>
          </div>
          
          {/* Stats & Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                <span>{messages.length} total</span>
              </div>
              {unreadCount > 0 && (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="font-medium text-primary">{unreadCount} unread</span>
                </div>
              )}
            </div>
            
            {unreadCount > 0 && (
              <Button onClick={markAllAsRead} variant="outline" size="sm">
                <CheckCircle className="w-4 h-4 mr-2" />
                Mark All Read
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Messages List */}
      {messages.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="py-16">
            <div className="text-center max-w-md mx-auto">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
                <MessageSquare className="w-10 h-10 text-muted-foreground/50" />
              </div>
              <h3 className="text-xl font-semibold mb-3">No messages yet</h3>
              <p className="text-muted-foreground leading-relaxed">
                When potential buyers contact you about your listings, their messages will appear here. 
                You'll receive notifications for new inquiries.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {messages.map((message) => (
            <Card 
              key={message.id} 
              className={`transition-all duration-200 hover:shadow-md ${
                !message.is_read 
                  ? 'border-primary/30 bg-gradient-to-r from-primary/5 to-transparent shadow-sm' 
                  : 'hover:border-border/60'
              }`}
            >
              <CardHeader className="pb-4">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-3">
                      {!message.is_read && (
                        <div className="w-2.5 h-2.5 bg-primary rounded-full flex-shrink-0"></div>
                      )}
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <User className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                        <CardTitle className="text-xl truncate">{message.sender_name}</CardTitle>
                        {!message.is_read && (
                          <Badge variant="default" className="bg-primary/10 text-primary hover:bg-primary/20">
                            New
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Building className="w-4 h-4" />
                        <span>Regarding Listing: <span className="font-medium text-foreground">#{message.listing_id.slice(-8)}</span></span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>{new Date(message.created_at).toLocaleDateString('en-US', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyContactInfo(message.sender_email, message.sender_phone)}
                      className="hover:bg-muted/50"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Contact
                    </Button>
                    {!message.is_read && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => markAsRead(message.id)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Mark Read
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Contact Information */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border">
                    <Mail className="w-5 h-5 text-primary flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-muted-foreground mb-1">Email</p>
                      <a 
                        href={`mailto:${message.sender_email}`}
                        className="text-sm font-medium text-primary hover:underline truncate block"
                      >
                        {message.sender_email}
                      </a>
                    </div>
                  </div>
                  
                  {message.sender_phone && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border">
                      <Phone className="w-5 h-5 text-primary flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-muted-foreground mb-1">Phone</p>
                        <a 
                          href={`tel:${message.sender_phone}`}
                          className="text-sm font-medium text-primary hover:underline"
                        >
                          {message.sender_phone}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Message Content */}
                <div className="bg-card rounded-lg p-4 border-l-4 border-primary/20">
                  <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Message
                  </h4>
                  <p className="text-foreground leading-relaxed whitespace-pre-line">
                    {message.message}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};