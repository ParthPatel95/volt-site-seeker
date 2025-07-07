-- Fix VoltMarket messaging system database schema

-- Add conversation_id to voltmarket_messages table
ALTER TABLE public.voltmarket_messages 
ADD COLUMN IF NOT EXISTS conversation_id UUID REFERENCES public.voltmarket_conversations(id) ON DELETE CASCADE;

-- Rename content column to message for consistency
ALTER TABLE public.voltmarket_messages 
RENAME COLUMN content TO message;

-- Update the WebSocket edge function to handle the correct column names
-- This migration will help sync the database with the expected schema