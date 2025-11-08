-- Migration 1: Fix Contact Numbers Relationship
-- This reverts the simplified TEXT phone field and restores the proper many-to-many relationship

-- Step 1: If you have any phone numbers in the clients.contact_number TEXT field,
-- we'll migrate them to the contact_numbers table first
DO $$
DECLARE
    client_record RECORD;
BEGIN
    FOR client_record IN 
        SELECT id, contact_number 
        FROM clients 
        WHERE contact_number IS NOT NULL AND contact_number != ''
    LOOP
        -- Insert the phone number into contact_numbers table
        INSERT INTO contact_numbers (client_id, number, is_on_whatsapp)
        VALUES (client_record.id, client_record.contact_number, false)
        ON CONFLICT DO NOTHING;
    END LOOP;
END $$;

-- Step 2: Drop the contact_number column from clients table
ALTER TABLE clients DROP COLUMN IF EXISTS contact_number;

-- Step 3: Verify contact_numbers table structure
-- (This should already exist from the original schema)
CREATE TABLE IF NOT EXISTS contact_numbers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    number TEXT NOT NULL,
    is_on_whatsapp BOOLEAN DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_contact_numbers_client_id ON contact_numbers(client_id);

-- Migration complete! 
-- Clients now have zero or many phone numbers via the contact_numbers table
