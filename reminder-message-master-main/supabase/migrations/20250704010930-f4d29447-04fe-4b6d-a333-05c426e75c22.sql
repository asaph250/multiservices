
-- Create scheduled_messages table
CREATE TABLE public.scheduled_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  message_title TEXT NOT NULL,
  message_body TEXT NOT NULL,
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'sent', 'cancelled')),
  customer_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  customer_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.scheduled_messages ENABLE ROW LEVEL SECURITY;

-- Create policies for scheduled_messages table
CREATE POLICY "Users can view their own scheduled messages" 
  ON public.scheduled_messages 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own scheduled messages" 
  ON public.scheduled_messages 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scheduled messages" 
  ON public.scheduled_messages 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own scheduled messages" 
  ON public.scheduled_messages 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_scheduled_messages_user_id ON public.scheduled_messages(user_id);
CREATE INDEX idx_scheduled_messages_status ON public.scheduled_messages(status);
CREATE INDEX idx_scheduled_messages_scheduled_for ON public.scheduled_messages(scheduled_for);

-- Create trigger to update updated_at column
CREATE TRIGGER update_scheduled_messages_updated_at 
  BEFORE UPDATE ON public.scheduled_messages 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
