/*
  # Create storage bucket for papers

  1. New Storage Bucket
    - Create 'papers' bucket for storing uploaded files
  
  2. Security
    - Enable public access for authenticated users
    - Add policies for read/write access
*/

-- Create a new storage bucket for papers
INSERT INTO storage.buckets (id, name, public)
VALUES ('papers', 'papers', true);

-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload files"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'papers' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow authenticated users to read their own files
CREATE POLICY "Users can read own files"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'papers' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow authenticated users to delete their own files
CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'papers' AND auth.uid()::text = (storage.foldername(name))[1]);