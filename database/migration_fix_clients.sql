-- Migration: Fix clients table to use TEXT for contact_number instead of UUID
-- Run this in Supabase SQL Editor if you already created the clients table

-- First, drop the foreign key constraint if it exists
ALTER TABLE clients 
DROP CONSTRAINT IF EXISTS clients_contact_number_fkey;

-- Then, change the column type from UUID to TEXT
ALTER TABLE clients 
ALTER COLUMN contact_number TYPE TEXT USING contact_number::TEXT;

-- Add comment to explain the field
COMMENT ON COLUMN clients.contact_number IS 'Direct phone number stored as text';
