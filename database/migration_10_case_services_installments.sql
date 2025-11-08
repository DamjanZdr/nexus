-- Migration 10: Case services and payment installments
-- Description: Creates tables for case services and payment installments

-- Create case_services junction table (many-to-many)
CREATE TABLE IF NOT EXISTS case_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(case_id, service_id)
);

-- Create installments table
CREATE TABLE IF NOT EXISTS installments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  due_date DATE,
  automatic_invoice BOOLEAN DEFAULT FALSE,
  is_down_payment BOOLEAN DEFAULT FALSE,
  position INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_case_services_case_id ON case_services(case_id);
CREATE INDEX IF NOT EXISTS idx_case_services_service_id ON case_services(service_id);
CREATE INDEX IF NOT EXISTS idx_installments_case_id ON installments(case_id);
CREATE INDEX IF NOT EXISTS idx_installments_position ON installments(case_id, position);

-- Update trigger for installments
CREATE OR REPLACE FUNCTION update_installments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_installments_updated_at
  BEFORE UPDATE ON installments
  FOR EACH ROW
  EXECUTE FUNCTION update_installments_updated_at();

-- Comments
COMMENT ON TABLE case_services IS 'Junction table linking cases to services';
COMMENT ON TABLE installments IS 'Payment installments for cases';
COMMENT ON COLUMN installments.is_down_payment IS 'If true, this is the down payment (cannot be deleted)';
COMMENT ON COLUMN installments.position IS 'Order of installments (1-based)';
