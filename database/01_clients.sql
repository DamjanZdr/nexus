-- Clients Table
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    contact_number TEXT,
    contact_email TEXT,
    country_of_origin UUID REFERENCES countries(id),
    city_in_poland UUID REFERENCES cities(id)
);

CREATE INDEX IF NOT EXISTS idx_clients_first_name ON clients(first_name);
CREATE INDEX IF NOT EXISTS idx_clients_last_name ON clients(last_name);
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(contact_email);
