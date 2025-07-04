-- Add foreign key constraints to ensure data integrity
ALTER TABLE public.voltmarket_conversations 
ADD CONSTRAINT fk_conversations_listing 
FOREIGN KEY (listing_id) REFERENCES public.voltmarket_listings(id) ON DELETE CASCADE;

ALTER TABLE public.voltmarket_conversations 
ADD CONSTRAINT fk_conversations_buyer 
FOREIGN KEY (buyer_id) REFERENCES public.voltmarket_profiles(id) ON DELETE CASCADE;

ALTER TABLE public.voltmarket_conversations 
ADD CONSTRAINT fk_conversations_seller 
FOREIGN KEY (seller_id) REFERENCES public.voltmarket_profiles(id) ON DELETE CASCADE;

ALTER TABLE public.voltmarket_messages 
ADD CONSTRAINT fk_messages_listing 
FOREIGN KEY (listing_id) REFERENCES public.voltmarket_listings(id) ON DELETE CASCADE;

ALTER TABLE public.voltmarket_messages 
ADD CONSTRAINT fk_messages_sender 
FOREIGN KEY (sender_id) REFERENCES public.voltmarket_profiles(id) ON DELETE CASCADE;

ALTER TABLE public.voltmarket_messages 
ADD CONSTRAINT fk_messages_recipient 
FOREIGN KEY (recipient_id) REFERENCES public.voltmarket_profiles(id) ON DELETE CASCADE;

-- Fix the conversations hook query issue by adding a default value for asking_price if null
UPDATE public.voltmarket_listings 
SET asking_price = 0 
WHERE asking_price IS NULL;