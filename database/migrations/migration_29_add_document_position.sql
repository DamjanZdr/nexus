-- Migration 29: Add position column to wiki_documents for drag-and-drop ordering
-- Run this in Supabase SQL Editor

-- Add position column with default 0
ALTER TABLE wiki_documents 
ADD COLUMN IF NOT EXISTS position integer NOT NULL DEFAULT 0;

-- Create index for faster ordering queries
CREATE INDEX IF NOT EXISTS idx_wiki_documents_position ON wiki_documents(folder_id, position);

-- Set initial positions based on creation date (oldest = 0, newest = higher)
WITH numbered_docs AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (PARTITION BY folder_id ORDER BY created_at ASC) - 1 AS new_position
  FROM wiki_documents
)
UPDATE wiki_documents
SET position = numbered_docs.new_position
FROM numbered_docs
WHERE wiki_documents.id = numbered_docs.id;