-- Migration: Create case_attachments table
-- Date: 2025-01-08
-- Description: Creates table to store metadata for case file attachments (files stored in Supabase Storage bucket)

-- Drop existing table if it exists (to fix foreign key constraint)
DROP TABLE IF EXISTS case_attachments CASCADE;

-- Create case_attachments table
CREATE TABLE IF NOT EXISTS case_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL, -- Path in Supabase Storage bucket
  file_size BIGINT, -- Size in bytes
  file_type TEXT, -- MIME type (e.g., 'application/pdf', 'image/png')
  uploaded_by UUID, -- User ID (nullable, not a foreign key)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_case_attachments_case_id ON case_attachments(case_id);
CREATE INDEX IF NOT EXISTS idx_case_attachments_created_at ON case_attachments(created_at);

-- Enable RLS
ALTER TABLE case_attachments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Authenticated users can view attachments"
ON case_attachments FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert attachments"
ON case_attachments FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can delete attachments"
ON case_attachments FOR DELETE
TO authenticated
USING (true);

-- Comments
COMMENT ON TABLE case_attachments IS 'Metadata for files attached to cases (actual files stored in Supabase Storage)';
COMMENT ON COLUMN case_attachments.file_path IS 'Path to file in case_attachments storage bucket';
