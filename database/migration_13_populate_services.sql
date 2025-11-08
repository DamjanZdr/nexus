-- Migration 13: Populate services table with categories and prices
-- Description: Adds all service categories with their respective prices

-- Insert Immigration services
INSERT INTO services (name, category, gross_price) VALUES
('TRC Basic', 'Immigration', 249),
('TRC Premium', 'Immigration', 2599),
('TRC Plus', 'Immigration', 1999),
('Visa Arrangement', 'Immigration', 1699),
('PESEL', 'Immigration', 599),
('TRC Expedite', 'Immigration', 1599),
('Work Permit', 'Immigration', 1349),
('Permanent Residence Card (PRC)', 'Immigration', 0),
('EU Blue Card', 'Immigration', 0),
('Proof of Accommodation (1 year)', 'Immigration', 1599),
('Proof of Accommodation (2 years)', 'Immigration', 2599),
('TRC Appeal', 'Immigration', 1599),
('Visa Appeal', 'Immigration', 1699),
('Invitation Letter', 'Immigration', 499),
('Nostrification', 'Immigration', 0),
('Document Legalization', 'Immigration', 0),
('General Consultation', 'Immigration', 249)
ON CONFLICT (name) DO UPDATE SET 
    category = EXCLUDED.category,
    gross_price = EXCLUDED.gross_price;

-- Insert Driving services
INSERT INTO services (name, category, gross_price) VALUES
('Driving License Conversion (Non-EU)', 'Driving', 549),
('Driving License Conversion (EU)', 'Driving', 399),
('New Driving License', 'Driving', 0),
('Car Registration', 'Driving', 849),
('Parking Permit', 'Driving', 749)
ON CONFLICT (name) DO UPDATE SET 
    category = EXCLUDED.category,
    gross_price = EXCLUDED.gross_price;

-- Insert Language services
INSERT INTO services (name, category, gross_price) VALUES
('Sworn Translation', 'Language', 0),
('Remote Assistance', 'Language', 0),
('Court Interpretation', 'Language', 0)
ON CONFLICT (name) DO UPDATE SET 
    category = EXCLUDED.category,
    gross_price = EXCLUDED.gross_price;

-- Insert Business services
INSERT INTO services (name, category, gross_price) VALUES
('Register a Business', 'Business', 0),
('Simplified Accounting', 'Business', 0),
('Full Accounting', 'Business', 0),
('Payroll and Human Resources', 'Business', 0),
('Additional Services', 'Business', 0)
ON CONFLICT (name) DO UPDATE SET 
    category = EXCLUDED.category,
    gross_price = EXCLUDED.gross_price;
