-- Comments Table
CREATE TABLE IF NOT EXISTS comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    text TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
