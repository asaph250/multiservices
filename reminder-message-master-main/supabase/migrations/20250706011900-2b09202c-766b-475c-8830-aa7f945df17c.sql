-- Add fields to support enhanced workflow
ALTER TABLE public.tasks ADD COLUMN service_request_id UUID REFERENCES service_requests(id);
ALTER TABLE public.tasks ADD COLUMN result_file_url TEXT;
ALTER TABLE public.tasks ADD COLUMN agent_notes TEXT;

-- Add new status for tasks to support admin review of agent work
ALTER TYPE public.task_status ADD VALUE 'submitted_for_review';

-- Add new status for service requests to track conversion to tasks  
ALTER TYPE public.service_request_status ADD VALUE 'converted_to_task';