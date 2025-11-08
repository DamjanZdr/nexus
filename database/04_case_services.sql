-- Case Services Table
CREATE TABLE IF NOT EXISTS case_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
    service_id UUID REFERENCES services(id)
);
