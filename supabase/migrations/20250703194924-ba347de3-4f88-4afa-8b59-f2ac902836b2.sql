
-- Create voltmarket_conversations table to group messages by listing
CREATE TABLE public.voltmarket_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL REFERENCES voltmarket_listings(id) ON DELETE CASCADE,
    buyer_id UUID NOT NULL REFERENCES voltmarket_profiles(id) ON DELETE CASCADE,
    seller_id UUID NOT NULL REFERENCES voltmarket_profiles(id) ON DELETE CASCADE,
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(listing_id, buyer_id, seller_id)
);

-- Enable RLS on conversations
ALTER TABLE public.voltmarket_conversations ENABLE ROW LEVEL SECURITY;

-- Create policies for conversations
CREATE POLICY "Users can view own conversations" ON public.voltmarket_conversations
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM voltmarket_profiles WHERE id IN (buyer_id, seller_id)
        )
    );

CREATE POLICY "Users can create conversations" ON public.voltmarket_conversations
    FOR INSERT WITH CHECK (
        auth.uid() IN (
            SELECT user_id FROM voltmarket_profiles WHERE id IN (buyer_id, seller_id)
        )
    );

CREATE POLICY "Users can update own conversations" ON public.voltmarket_conversations
    FOR UPDATE USING (
        auth.uid() IN (
            SELECT user_id FROM voltmarket_profiles WHERE id IN (buyer_id, seller_id)
        )
    );

-- Update voltmarket_messages to reference conversations
ALTER TABLE public.voltmarket_messages 
ADD COLUMN conversation_id UUID REFERENCES voltmarket_conversations(id) ON DELETE CASCADE;

-- Create voltmarket_watchlist table
CREATE TABLE public.voltmarket_watchlist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    listing_id UUID NOT NULL REFERENCES voltmarket_listings(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id, listing_id),
    CONSTRAINT fk_watchlist_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable RLS on watchlist
ALTER TABLE public.voltmarket_watchlist ENABLE ROW LEVEL SECURITY;

-- Create policies for watchlist
CREATE POLICY "Users can view own watchlist" ON public.voltmarket_watchlist
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own watchlist" ON public.voltmarket_watchlist
    FOR ALL USING (auth.uid() = user_id);

-- Enable realtime for conversations and messages
ALTER TABLE public.voltmarket_conversations REPLICA IDENTITY FULL;
ALTER TABLE public.voltmarket_messages REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.voltmarket_conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.voltmarket_messages;
