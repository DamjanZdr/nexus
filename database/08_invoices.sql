-- Invoices Table
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