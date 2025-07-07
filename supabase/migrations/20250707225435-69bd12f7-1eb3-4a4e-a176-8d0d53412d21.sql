-- Add conversation_id to voltmarket_messages table
ALTER TABLE public.voltmarket_messages 
ADD COLUMN IF NOT EXISTS conversation_id UUID REFERENCES public.voltmarket_conversations(id) ON DELETE CASCADE;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_voltmarket_messages_conversation_id 
ON public.voltmarket_messages(conversation_id);

-- Add function to automatically set conversation_id when inserting messages
CREATE OR REPLACE FUNCTION public.set_message_conversation_id()
RETURNS TRIGGER AS $$
BEGIN
  -- Find or create conversation
  SELECT id INTO NEW.conversation_id
  FROM public.voltmarket_conversations
  WHERE listing_id = NEW.listing_id
    AND (
      (buyer_id = NEW.sender_id AND seller_id = NEW.recipient_id) OR
      (buyer_id = NEW.recipient_id AND seller_id = NEW.sender_id)
    );
  
  -- If no conversation exists, create one
  IF NEW.conversation_id IS NULL THEN
    INSERT INTO public.voltmarket_conversations (listing_id, buyer_id, seller_id)
    VALUES (NEW.listing_id, NEW.sender_id, NEW.recipient_id)
    RETURNING id INTO NEW.conversation_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically set conversation_id
DROP TRIGGER IF EXISTS set_message_conversation_id_trigger ON public.voltmarket_messages;
CREATE TRIGGER set_message_conversation_id_trigger
  BEFORE INSERT ON public.voltmarket_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.set_message_conversation_id();