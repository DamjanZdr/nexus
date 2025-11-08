-- Cases Table
CREATE TABLE IF NOT EXISTS cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    status_id UUID REFERENCES status(id),
    assigned_to UUID REFERENCES users(id),
    services UUID REFERENCES case_services(id),
    installments UUID REFERENCES installments(id),
    comments UUID REFERENCES comments(id),
    attachments TEXT -- Reference to Case Attachments bucket
);

CREATE INDEX IF NOT EXISTS idx_cases_client_id ON cases(client_id);
CREATE INDEX IF NOT EXISTS idx_cases_status ON cases(status_id);
CREATE INDEX IF NOT EXISTS idx_cases_assigned_to ON cases(assigned_to);
