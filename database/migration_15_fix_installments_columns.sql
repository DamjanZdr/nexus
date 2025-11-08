-- Migration 15: Fix installments table columns
-- Description: Adds missing columns and renames automatically_send_invoice

-- Add is_down_payment column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'installments' AND column_name = 'is_down_payment'
    ) THEN
        ALTER TABLE installments ADD COLUMN is_down_payment BOOLEAN DEFAULT false;
    END IF;
END $$;

-- Rename automatically_send_invoice to automatic_invoice if needed
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'installments' AND column_name = 'automatically_send_invoice'
    ) THEN
        ALTER TABLE installments RENAME COLUMN automatically_send_invoice TO automatic_invoice;
    END IF;
END $$;

-- Add automatic_invoice column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'installments' AND column_name = 'automatic_invoice'
    ) THEN
        ALTER TABLE installments ADD COLUMN automatic_invoice BOOLEAN DEFAULT false;
    END IF;
END $$;

-- Comments
COMMENT ON COLUMN installments.is_down_payment IS 'Indicates if this is the down payment installment';
COMMENT ON COLUMN installments.automatic_invoice IS 'Whether to automatically send invoice when due';
