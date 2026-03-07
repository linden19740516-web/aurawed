-- Supabase Storage RLS Policies for wedding-media bucket

-- Allow public read access to all files in wedding-media
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'wedding-media' );

-- Allow authenticated users to upload files
CREATE POLICY "Auth Users Upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'wedding-media' );

-- Allow users to update their own files
CREATE POLICY "Auth Users Update"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'wedding-media' AND auth.uid() = owner )
WITH CHECK ( bucket_id = 'wedding-media' AND auth.uid() = owner );

-- Allow users to delete their own files
CREATE POLICY "Auth Users Delete"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'wedding-media' AND auth.uid() = owner );
