-- Installments Table
CREATE TABLE IF NOT EXISTS installments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
    amount DECIMAL(10,2),
    due_date DATE,
    automatically_send_invoice BOOLEAN DEFAULT false
);
