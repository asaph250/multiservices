-- Create storage bucket for service request documents
INSERT INTO storage.buckets (id, name, public) VALUES ('service-documents', 'service-documents', false);

-- Create RLS policies for service documents storage
CREATE POLICY "Users can upload their own service documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'service-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own service documents" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'service-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Admins can view all service documents" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'service-documents' 
  AND EXISTS (
    SELECT 1 FROM user_preferences 
    WHERE user_id = auth.uid() 
    AND user_role = 'admin'
  )
);

-- Add file_urls column to service_requests table to store uploaded document URLs
ALTER TABLE service_requests 
ADD COLUMN file_urls jsonb DEFAULT '[]'::jsonb;