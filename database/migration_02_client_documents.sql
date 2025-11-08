-- Migration 2: Create Client Documents Table
-- This allows clients to have multiple documents (passport, visa, contracts, etc.)

CREATE TABLE IF NOT EXISTS client_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    file_path TEXT NOT NULL, -- Path in Supabase Storage
    file_type TEXT, -- MIME type (e.g., 'application/pdf', 'image/jpeg')
    file_size INTEGER, -- Size in bytes
    uploaded_by UUID REFERENCES users(id),
    uploaded_at TIMESTAMPTZ DEFAULT NOW(),
    description TEXT,
    document_category TEXT -- e.g., 'passport', 'visa', 'contract', 'other'
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_client_documents_client_id ON client_documents(client_id);
CREATE INDEX IF NOT EXISTS idx_client_documents_uploaded_at ON client_documents(uploaded_at DESC);
CREATE INDEX IF NOT EXISTS idx_client_documents_category ON client_documents(document_category);

-- Comments for documentation
COMMENT ON TABLE client_documents IS 'Stores metadata for documents uploaded for clients';
COMMENT ON COLUMN client_documents.file_path IS 'Storage path in Supabase Storage bucket: client_documents';
COMMENT ON COLUMN client_documents.document_category IS 'Categories: passport, visa, contract, photo, other';

-- Migration complete!
-- Next: Create 'client_documents' storage bucket in Supabase Storage UI
