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
  ExternalLink
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
      console.log('❌ No profile or profile.id found:', profile);
      setLoading(false);
      return;
    }

    console.log('🔍 Fetching messages for profile ID:', profile.id);
    console.log('🔍 Profile object:', profile);

    try {
      // Check if user is authenticated
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      console.log('🔐 Auth check - user:', user);
      console.log('🔐 Auth check - error:', authError);
      
      if (!user) {
        console.log('❌ User not authenticated, attempting to get session...');
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        console.log('🔐 Session check - session:', session);
        console.log('🔐 Session check - error:', sessionError);
        
        if (!session) {
          console.log('❌ No valid session found');
          toast({
            title: "Authentication Required",
            description: "Please sign in to view your messages",
            variant: "destructive"
          });
          setLoading(false);
          return;
        }
      }

      console.log('🚀 About to execute query...');
      console.log('🚀 Query parameters - listing_owner_id:', profile.id);
      
      const { data: contactMessages, error } = await supabase
        .from('voltmarket_contact_messages')
        .select('*')
        .eq('listing_owner_id', profile.id)
        .order('created_at', { ascending: false });

      console.log('📊 Query result - error:', error);
      console.log('📊 Query result - data:', contactMessages);
      console.log('📊 Data length:', contactMessages?.length);
      
      // Let's also test if we can access the table at all
      const { data: allMessages, error: allError } = await supabase
        .from('voltmarket_contact_messages')
        .select('*')
        .limit(5);
      
      console.log('🔍 All messages test - error:', allError);
      console.log('🔍 All messages test - data:', allMessages);
      console.log('🔍 All messages test - count:', allMessages?.length);

      if (error) {
        console.error('❌ Database error:', error);
        throw error;
      }

      console.log('✅ Setting messages:', contactMessages || []);
      setMessages(contactMessages || []);
      setUnreadCount((contactMessages || []).filter(msg => !msg.is_read).length);
    } catch (error) {
      console.error('❌ Error in fetchMessages:', error);
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
      <div className="space-y-4">
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-muted rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Contact Messages</h2>
          <p className="text-muted-foreground">Messages from potential buyers about your listings</p>
        </div>
        {unreadCount > 0 && (
          <Button onClick={markAllAsRead} variant="outline">
            <CheckCircle className="w-4 h-4 mr-2" />
            Mark All Read ({unreadCount})
          </Button>
        )}
      </div>

      {messages.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <MessageSquare className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No messages yet</h3>
              <p className="text-muted-foreground">
                When potential buyers contact you about your listings, their messages will appear here.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {messages.map((message) => (
            <Card key={message.id} className={`${!message.is_read ? 'border-primary/50 bg-primary/5' : ''}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {!message.is_read && (
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                      )}
                      {message.sender_name}
                      {!message.is_read && (
                        <Badge variant="secondary">
                          New
                        </Badge>
                      )}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Regarding: <span className="font-medium">Listing ID: {message.listing_id}</span>
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <Clock className="w-3 h-3" />
                      {new Date(message.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyContactInfo(message.sender_email, message.sender_phone)}
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      Copy Contact
                    </Button>
                    {!message.is_read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markAsRead(message.id)}
                      >
                        Mark Read
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-6">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    <a 
                      href={`mailto:${message.sender_email}`}
                      className="text-primary hover:underline"
                    >
                      {message.sender_email}
                    </a>
                  </div>
                  {message.sender_phone && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="w-4 h-4" />
                      <a 
                        href={`tel:${message.sender_phone}`}
                        className="text-primary hover:underline"
                      >
                        {message.sender_phone}
                      </a>
                    </div>
                  )}
                </div>
                
                <div className="bg-background rounded-lg p-4 border">
                  <h4 className="font-medium mb-2">Message:</h4>
                  <p className="text-foreground whitespace-pre-line">{message.message}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};