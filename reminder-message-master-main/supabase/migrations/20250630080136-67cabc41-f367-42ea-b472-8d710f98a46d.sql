
-- Add last_message_sent column to customers table
ALTER TABLE public.customers ADD COLUMN last_message_sent TIMESTAMP WITH TIME ZONE;

-- Update message_history table to include message_title and message_body
ALTER TABLE public.message_history ADD COLUMN message_title TEXT;
ALTER TABLE public.message_history ADD COLUMN message_body TEXT;

-- Update existing message_text column to be nullable since we now have separate title/body
ALTER TABLE public.message_history ALTER COLUMN message_text DROP NOT NULL;
