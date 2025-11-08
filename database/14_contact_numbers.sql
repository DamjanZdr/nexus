-- Contact Numbers Table
CREATE TABLE IF NOT EXISTS contact_numbers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    number TEXT NOT NULL,
    is_on_whatsapp BOOLEAN DEFAULT false
);
