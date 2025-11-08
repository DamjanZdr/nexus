-- Installments Table
CREATE TABLE IF NOT EXISTS installments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
    amount DECIMAL(10,2),
    due_date DATE,
    position INTEGER DEFAULT 1,
    is_down_payment BOOLEAN DEFAULT false,
    automatic_invoice BOOLEAN DEFAULT false,
    paid BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
