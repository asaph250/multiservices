
-- Create customer_groups table
CREATE TABLE public.customer_groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#3B82F6',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, name)
);

-- Create customer_group_memberships table (many-to-many relationship)
CREATE TABLE public.customer_group_memberships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  group_id UUID NOT NULL REFERENCES public.customer_groups(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(customer_id, group_id)
);

-- Enable Row Level Security
ALTER TABLE public.customer_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_group_memberships ENABLE ROW LEVEL SECURITY;

-- Create policies for customer_groups table
CREATE POLICY "Users can view their own customer groups" 
  ON public.customer_groups 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own customer groups" 
  ON public.customer_groups 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own customer groups" 
  ON public.customer_groups 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own customer groups" 
  ON public.customer_groups 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create policies for customer_group_memberships table
CREATE POLICY "Users can view their own customer group memberships" 
  ON public.customer_group_memberships 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.customers c 
    WHERE c.id = customer_id AND c.user_id = auth.uid()
  ));

CREATE POLICY "Users can create their own customer group memberships" 
  ON public.customer_group_memberships 
  FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.customers c 
    WHERE c.id = customer_id AND c.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete their own customer group memberships" 
  ON public.customer_group_memberships 
  FOR DELETE 
  USING (EXISTS (
    SELECT 1 FROM public.customers c 
    WHERE c.id = customer_id AND c.user_id = auth.uid()
  ));

-- Create indexes for better performance
CREATE INDEX idx_customer_groups_user_id ON public.customer_groups(user_id);
CREATE INDEX idx_customer_group_memberships_customer_id ON public.customer_group_memberships(customer_id);
CREATE INDEX idx_customer_group_memberships_group_id ON public.customer_group_memberships(group_id);

-- Create triggers to update updated_at column
CREATE TRIGGER update_customer_groups_updated_at 
  BEFORE UPDATE ON public.customer_groups 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
