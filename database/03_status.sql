-- Status Table
CREATE TABLE IF NOT EXISTS status (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    position INTEGER,
    notifyees TEXT[]
);
