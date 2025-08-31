
-- Create a table to store login details
CREATE TABLE public.login_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  login_attempt_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  success BOOLEAN NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS)
ALTER TABLE public.login_logs ENABLE ROW LEVEL SECURITY;

-- Create policy that allows users to view their own login logs
CREATE POLICY "Users can view their own login logs" 
  ON public.login_logs 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Create policy that allows authenticated users to insert login logs
CREATE POLICY "Allow insert of login logs" 
  ON public.login_logs 
  FOR INSERT 
  WITH CHECK (true);

-- Create an index for better performance on queries
CREATE INDEX idx_login_logs_user_id ON public.login_logs(user_id);
CREATE INDEX idx_login_logs_email ON public.login_logs(email);
CREATE INDEX idx_login_logs_created_at ON public.login_logs(created_at);
