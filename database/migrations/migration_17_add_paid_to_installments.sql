-- Migration: Add paid column to installments table
-- Date: 2025-01-08
-- Description: Adds a boolean 'paid' column to track payment status for Stripe integration

DO $$
BEGIN
  -- Check if the paid column already exists
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'installments' 
    AND column_name = 'paid'
  ) THEN
    -- Add the paid column with default value of false
    ALTER TABLE installments 
    ADD COLUMN paid BOOLEAN DEFAULT false;
    
    RAISE NOTICE 'Successfully added paid column to installments table';
  ELSE
    RAISE NOTICE 'Column paid already exists in installments table';
  END IF;
END $$;