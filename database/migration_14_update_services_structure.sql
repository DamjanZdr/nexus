-- Migration 14: Update services table structure
-- Description: Adds category and gross_price columns, removes case_id (moved to case_services)

-- Remove case_id column if it exists (relationship moved to case_services table)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'services' AND column_name = 'case_id'
    ) THEN
        ALTER TABLE services DROP COLUMN case_id;
    END IF;
END $$;

-- Rename price to gross_price if price exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'services' AND column_name = 'price'
    ) THEN
        ALTER TABLE services RENAME COLUMN price TO gross_price;
    END IF;
END $$;

-- Add category column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'services' AND column_name = 'category'
    ) THEN
        ALTER TABLE services ADD COLUMN category TEXT;
    END IF;
END $$;

-- Add gross_price column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'services' AND column_name = 'gross_price'
    ) THEN
        ALTER TABLE services ADD COLUMN gross_price DECIMAL(10,2) DEFAULT 0;
    END IF;
END $$;

-- Add created_at column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'services' AND column_name = 'created_at'
    ) THEN
        ALTER TABLE services ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
END $$;

-- Add unique constraint on name if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'services_name_key'
    ) THEN
        BEGIN
            ALTER TABLE services ADD CONSTRAINT services_name_key UNIQUE (name);
        EXCEPTION
            WHEN unique_violation THEN
                -- If there are duplicate names, do nothing
                RAISE NOTICE 'Duplicate service names exist, skipping unique constraint';
        END;
    END IF;
END $$;

-- Comments
COMMENT ON COLUMN services.category IS 'Service category (Immigration, Driving, Language, Business)';
COMMENT ON COLUMN services.gross_price IS 'Gross price in PLN (0 means individual pricing)';
