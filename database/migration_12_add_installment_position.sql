-- Migration 12: Add position column to installments table
-- Description: Adds position column for ordering installments

-- Add position column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'installments' AND column_name = 'position'
    ) THEN
        ALTER TABLE installments ADD COLUMN position INTEGER DEFAULT 1;
    END IF;
END $$;

-- Add created_at column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'installments' AND column_name = 'created_at'
    ) THEN
        ALTER TABLE installments ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
END $$;

-- Update existing records to have sequential positions
DO $$
BEGIN
    -- Check if we can use created_at for ordering
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'installments' AND column_name = 'created_at'
    ) THEN
        -- Use both due_date and created_at for ordering
        WITH numbered AS (
            SELECT id, ROW_NUMBER() OVER (PARTITION BY case_id ORDER BY due_date NULLS LAST, created_at) as rn
            FROM installments
        )
        UPDATE installments
        SET position = numbered.rn
        FROM numbered
        WHERE installments.id = numbered.id;
    ELSE
        -- Use only due_date for ordering
        WITH numbered AS (
            SELECT id, ROW_NUMBER() OVER (PARTITION BY case_id ORDER BY due_date NULLS LAST, id) as rn
            FROM installments
        )
        UPDATE installments
        SET position = numbered.rn
        FROM numbered
        WHERE installments.id = numbered.id;
    END IF;
END $$;

-- Comment
COMMENT ON COLUMN installments.position IS 'Order position of installment within a case';
