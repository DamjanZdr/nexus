-- ============================================
-- NEXUS CRM - Complete Database Setup Script
-- ============================================
-- Copy this entire file and paste into Supabase SQL Editor
-- This will create all tables in the correct order

-- ============================================
-- 1. REFERENCE TABLES (no dependencies)
-- ============================================

-- Cities Table
CREATE TABLE IF NOT EXISTS cities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    city TEXT NOT NULL UNIQUE
);

-- Countries Table
CREATE TABLE IF NOT EXISTS countries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    country TEXT NOT NULL UNIQUE
);

-- Themes Table
CREATE TABLE IF NOT EXISTS themes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    brand_color TEXT
);

-- Roles Table
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE
);

-- Status Table
CREATE TABLE IF NOT EXISTS status (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    position INTEGER,
    notifyees TEXT[]
);

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    template TEXT,
    trigger TEXT,
    description TEXT
);

-- ============================================
-- 2. USER TABLES
-- ============================================

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    contact_number TEXT,
    display_name TEXT,
    theme UUID REFERENCES themes(id),
    role UUID REFERENCES roles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- User Notifications Table
CREATE TABLE IF NOT EXISTS user_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    notification_id UUID REFERENCES notifications(id),
    message TEXT,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    read_at TIMESTAMPTZ
);

-- Notification Preferences Table
CREATE TABLE IF NOT EXISTS notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    notification_id UUID REFERENCES notifications(id),
    is_enabled BOOLEAN DEFAULT true
);

-- ============================================
-- 3. CLIENT TABLES
-- ============================================

-- Contact Numbers Table (created before clients for reference)
CREATE TABLE IF NOT EXISTS contact_numbers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID, -- Will reference clients, but can't add constraint yet
    number TEXT NOT NULL,
    is_on_whatsapp BOOLEAN DEFAULT false
);

-- Clients Table
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    contact_number UUID REFERENCES contact_numbers(id),
    contact_email TEXT,
    country_of_origin UUID REFERENCES countries(id),
    city_in_poland UUID REFERENCES cities(id)
);

CREATE INDEX IF NOT EXISTS idx_clients_first_name ON clients(first_name);
CREATE INDEX IF NOT EXISTS idx_clients_last_name ON clients(last_name);
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(contact_email);

-- Add foreign key constraint to contact_numbers now that clients exists
ALTER TABLE contact_numbers 
ADD CONSTRAINT fk_contact_numbers_client 
FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE;

-- ============================================
-- 4. CASE MANAGEMENT TABLES
-- ============================================

-- Comments Table
CREATE TABLE IF NOT EXISTS comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    text TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Services Table
CREATE TABLE IF NOT EXISTS services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    price DECIMAL(10,2)
);

-- Case Services Table (create before cases so it can be referenced)
CREATE TABLE IF NOT EXISTS case_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID, -- Will add constraint after cases table exists
    service_id UUID REFERENCES services(id)
);

-- Installments Table (create before cases so it can be referenced)
CREATE TABLE IF NOT EXISTS installments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID, -- Will add constraint after cases table exists
    amount DECIMAL(10,2),
    due_date DATE,
    automatically_send_invoice BOOLEAN DEFAULT false
);

-- Cases Table (now we can reference case_services and installments)
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

-- Now add the foreign key constraints back to case_services and installments
ALTER TABLE case_services
ADD CONSTRAINT fk_case_services_case
FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE;

ALTER TABLE installments
ADD CONSTRAINT fk_installments_case
FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE;

-- ============================================
-- STORAGE BUCKETS (create these in Supabase Storage UI)
-- ============================================
-- Bucket name: case_attachments
-- Description: Store case-related file attachments
-- Public: false
-- File size limit: As needed
-- Allowed MIME types: As needed

-- ============================================
-- SETUP COMPLETE
-- ============================================
-- All tables have been created successfully!
-- Next steps:
-- 1. Set up Row Level Security (RLS) policies
-- 2. Create the case_attachments storage bucket
-- 3. Add initial seed data (roles, statuses, etc.)
