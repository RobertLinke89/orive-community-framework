-- Create storage bucket for documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO NOTHING;

-- Create documents table for metadata
CREATE TABLE public.documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER NOT NULL DEFAULT 0,
  file_type TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  visibility TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'private')),
  uploaded_by UUID NOT NULL,
  facilitator_id UUID,
  download_count INTEGER NOT NULL DEFAULT 0,
  is_admin_resource BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Indexes for performance
CREATE INDEX idx_documents_category ON public.documents(category);
CREATE INDEX idx_documents_visibility ON public.documents(visibility);
CREATE INDEX idx_documents_facilitator ON public.documents(facilitator_id);
CREATE INDEX idx_documents_admin_resource ON public.documents(is_admin_resource);

-- Public can view public admin resources
CREATE POLICY "Public can view public admin resources"
  ON public.documents FOR SELECT
  USING (visibility = 'public' AND is_admin_resource = true);

-- Authenticated users can view all public resources
CREATE POLICY "Authenticated can view public resources"
  ON public.documents FOR SELECT
  USING (auth.role() = 'authenticated' AND visibility = 'public');

-- Facilitators can view their own private documents
CREATE POLICY "Facilitators can view own documents"
  ON public.documents FOR SELECT
  USING (auth.uid() = facilitator_id);

-- Admins can insert admin resources
CREATE POLICY "Admins can insert admin resources"
  ON public.documents FOR INSERT
  WITH CHECK (
    has_role(auth.uid(), 'admin') AND is_admin_resource = true
  );

-- Facilitators can insert their own documents
CREATE POLICY "Facilitators can insert own documents"
  ON public.documents FOR INSERT
  WITH CHECK (
    auth.uid() = facilitator_id AND is_admin_resource = false
  );

-- Admins can update admin resources
CREATE POLICY "Admins can update admin resources"
  ON public.documents FOR UPDATE
  USING (has_role(auth.uid(), 'admin') AND is_admin_resource = true);

-- Facilitators can update their own documents
CREATE POLICY "Facilitators can update own documents"
  ON public.documents FOR UPDATE
  USING (auth.uid() = facilitator_id AND is_admin_resource = false);

-- Admins can delete admin resources
CREATE POLICY "Admins can delete admin resources"
  ON public.documents FOR DELETE
  USING (has_role(auth.uid(), 'admin') AND is_admin_resource = true);

-- Facilitators can delete their own documents
CREATE POLICY "Facilitators can delete own documents"
  ON public.documents FOR DELETE
  USING (auth.uid() = facilitator_id AND is_admin_resource = false);

-- Storage policies for documents bucket
CREATE POLICY "Public can view public document files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'documents' AND (storage.foldername(name))[1] = 'public');

CREATE POLICY "Authenticated can view all documents"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'documents' AND auth.role() = 'authenticated');

CREATE POLICY "Admins can upload to public folder"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'documents' 
    AND (storage.foldername(name))[1] = 'public'
    AND has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Facilitators can upload to their folder"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'documents' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Admins can delete public files"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'documents' 
    AND (storage.foldername(name))[1] = 'public'
    AND has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Facilitators can delete their files"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'documents' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Trigger for updated_at
CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON public.documents
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();