
-- Add payment_status column to user_preferences table (assuming this is where user data is stored)
ALTER TABLE public.user_preferences ADD COLUMN payment_status text DEFAULT 'Not Paid';

-- Create message_history table
CREATE TABLE public.message_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  message_text TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  customer_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS)
ALTER TABLE public.message_history ENABLE ROW LEVEL SECURITY;

-- Create policy that allows users to view their own message history
CREATE POLICY "Users can view their own message history" 
  ON public.message_history 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Create policy that allows users to insert their own message history
CREATE POLICY "Users can insert their own message history" 
  ON public.message_history 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_message_history_user_id ON public.message_history(user_id);
CREATE INDEX idx_message_history_sent_at ON public.message_history(sent_at);
