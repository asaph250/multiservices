-- Create enum for task status
CREATE TYPE public.task_status AS ENUM ('pending', 'approved', 'completed', 'cancelled');

-- Create enum for service request status  
CREATE TYPE public.service_request_status AS ENUM ('pending', 'approved', 'in_progress', 'completed', 'cancelled');

-- Create enum for user roles
CREATE TYPE public.user_role AS ENUM ('admin', 'agent', 'client');

-- Add role column to user_preferences table to track user roles
ALTER TABLE public.user_preferences ADD COLUMN user_role public.user_role DEFAULT 'client';

-- Create tasks table
CREATE TABLE public.tasks (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    client_name TEXT NOT NULL,
    service_type TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    status public.task_status NOT NULL DEFAULT 'pending',
    agent_id UUID REFERENCES auth.users(id),
    admin_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    completed_at TIMESTAMP WITH TIME ZONE,
    commission_rate DECIMAL(5,2) DEFAULT 50.00
);

-- Create service_requests table
CREATE TABLE public.service_requests (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    full_name TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    service_type TEXT NOT NULL,
    document_details TEXT,
    notes TEXT,
    file_url TEXT,
    status public.service_request_status NOT NULL DEFAULT 'pending',
    client_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create agent_payouts table
CREATE TABLE public.agent_payouts (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    agent_id UUID NOT NULL REFERENCES auth.users(id),
    week_start DATE NOT NULL,
    week_end DATE NOT NULL,
    total_commission DECIMAL(10,2) NOT NULL DEFAULT 0,
    tasks_completed INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending',
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_payouts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tasks table
CREATE POLICY "Agents can view their assigned tasks" ON public.tasks
    FOR SELECT USING (agent_id = auth.uid());

CREATE POLICY "Admins can view all tasks" ON public.tasks
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM user_preferences 
        WHERE user_id = auth.uid() AND user_role = 'admin'
    ));

CREATE POLICY "Admins can create tasks" ON public.tasks
    FOR INSERT WITH CHECK (EXISTS (
        SELECT 1 FROM user_preferences 
        WHERE user_id = auth.uid() AND user_role = 'admin'
    ));

CREATE POLICY "Agents can update their assigned tasks" ON public.tasks
    FOR UPDATE USING (agent_id = auth.uid());

CREATE POLICY "Admins can update all tasks" ON public.tasks
    FOR UPDATE USING (EXISTS (
        SELECT 1 FROM user_preferences 
        WHERE user_id = auth.uid() AND user_role = 'admin'
    ));

-- RLS Policies for service_requests table
CREATE POLICY "Users can view their own service requests" ON public.service_requests
    FOR SELECT USING (client_id = auth.uid());

CREATE POLICY "Admins can view all service requests" ON public.service_requests
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM user_preferences 
        WHERE user_id = auth.uid() AND user_role = 'admin'
    ));

CREATE POLICY "Users can create service requests" ON public.service_requests
    FOR INSERT WITH CHECK (client_id = auth.uid());

CREATE POLICY "Admins can update service requests" ON public.service_requests
    FOR UPDATE USING (EXISTS (
        SELECT 1 FROM user_preferences 
        WHERE user_id = auth.uid() AND user_role = 'admin'
    ));

-- RLS Policies for agent_payouts table
CREATE POLICY "Agents can view their own payouts" ON public.agent_payouts
    FOR SELECT USING (agent_id = auth.uid());

CREATE POLICY "Admins can view all payouts" ON public.agent_payouts
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM user_preferences 
        WHERE user_id = auth.uid() AND user_role = 'admin'
    ));

CREATE POLICY "Admins can create and update payouts" ON public.agent_payouts
    FOR ALL USING (EXISTS (
        SELECT 1 FROM user_preferences 
        WHERE user_id = auth.uid() AND user_role = 'admin'
    ));

-- Create updated_at triggers
CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON public.tasks
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_service_requests_updated_at
    BEFORE UPDATE ON public.service_requests
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_agent_payouts_updated_at
    BEFORE UPDATE ON public.agent_payouts
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();