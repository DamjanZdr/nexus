-- Migration: Create invoices table
-- Date: 2025-01-08
-- Description: Creates invoices table to track all invoices sent to clients for Stripe integration

-- Create invoices table if it doesn't exist
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  installment_id UUID REFERENCES installments(id) ON DELETE SET NULL,
  invoice_number VARCHAR(50) UNIQUE,
  invoice_name TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'draft',
  -- Status can be: draft, sent, viewed, paid, overdue, cancelled
  stripe_invoice_id VARCHAR(255),
  stripe_payment_intent_id VARCHAR(255),
  payment_link TEXT,
  sent_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  due_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create invoice number generation function
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS VARCHAR(50) AS $$
DECLARE
  new_number INTEGER;
  new_code VARCHAR(50);
BEGIN
  -- Get the latest invoice number
  SELECT COALESCE(
    MAX(CAST(SUBSTRING(invoice_number FROM 4) AS INTEGER)),
    0
  ) INTO new_number
  FROM invoices
  WHERE invoice_number ~ '^INV[0-9]+$';
  
  -- Increment and format with leading zeros (INV0000001)
  new_number := new_number + 1;
  new_code := 'INV' || LPAD(new_number::TEXT, 7, '0');
  
  RETURN new_code;
END;
$$ LANGUAGE plpgsql;

-- Create trigger function to auto-generate invoice number
CREATE OR REPLACE FUNCTION set_invoice_number_trigger()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.invoice_number IS NULL THEN
    NEW.invoice_number := generate_invoice_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS set_invoice_number ON invoices;
CREATE TRIGGER set_invoice_number
  BEFORE INSERT ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION set_invoice_number_trigger();

-- Create updated_at trigger
DROP TRIGGER IF EXISTS update_invoices_updated_at ON invoices;
CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_invoices_case_id ON invoices(case_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
