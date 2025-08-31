
-- Create customers table
CREATE TABLE public.customers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  segment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Create policies for customers table
CREATE POLICY "Users can view their own customers" 
  ON public.customers 
  FOR SELECT 
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can create their own customers" 
  ON public.customers 
  FOR INSERT 
  WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own customers" 
  ON public.customers 
  FOR UPDATE 
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete their own customers" 
  ON public.customers 
  FOR DELETE 
  USING (auth.uid()::text = user_id::text);

-- Create index for better performance
CREATE INDEX idx_customers_user_id ON public.customers(user_id);
