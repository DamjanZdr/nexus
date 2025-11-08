# Database Migrations - Execute in Order

## Overview
Run these migrations in your Supabase SQL Editor in the order listed below.

## Migration Files to Execute

### 1. Migration 12: Add Position Column to Installments
**File:** `migration_12_add_installment_position.sql`
**Purpose:** Fixes the "position does not exist" error
**What it does:**
- Adds `position` column to installments table
- Auto-populates existing records with sequential positions
- Enables proper ordering of payment installments

### 2. Migration 14: Update Services Table Structure
**File:** `migration_14_update_services_structure.sql`
**Purpose:** Prepares services table for category-based pricing
**What it does:**
- Removes old `case_id` column (moved to case_services junction table)
- Renames `price` to `gross_price`
- Adds `category` column for grouping services
- Adds `created_at` timestamp
- Adds unique constraint on service names

### 3. Migration 13: Populate Services with Prices
**File:** `migration_13_populate_services.sql`
**Purpose:** Adds all your services with categories and prices
**What it does:**
- Inserts Immigration services (17 services)
- Inserts Driving services (5 services)
- Inserts Language services (3 services)
- Inserts Business services (5 services)
- Services marked "Individual" have price = 0

## Services Added

### Immigration (17 services)
- TRC Basic: 249 PLN
- TRC Premium: 2599 PLN
- TRC Plus: 1999 PLN
- Visa Arrangement: 1699 PLN
- PESEL: 599 PLN
- TRC Expedite: 1599 PLN
- Work Permit: 1349 PLN
- Permanent Residence Card (PRC): Individual (0)
- EU Blue Card: Individual (0)
- Proof of Accommodation (1 year): 1599 PLN
- Proof of Accommodation (2 years): 2599 PLN
- TRC Appeal: 1599 PLN
- Visa Appeal: 1699 PLN
- Invitation Letter: 499 PLN
- Nostrification: Individual (0)
- Document Legalization: Individual (0)
- General Consultation: 249 PLN

### Driving (5 services)
- Driving License Conversion (Non-EU): 549 PLN
- Driving License Conversion (EU): 399 PLN
- New Driving License: Individual (0)
- Car Registration: 849 PLN
- Parking Permit: 749 PLN

### Language (3 services)
- Sworn Translation: Individual (0)
- Remote Assistance: Individual (0)
- Court Interpretation: Individual (0)

### Business (5 services)
- Register a Business: Individual (0)
- Simplified Accounting: Individual (0)
- Full Accounting: Individual (0)
- Payroll and Human Resources: Individual (0)
- Additional Services: Individual (0)

## Frontend Changes Made

### 1. Phone Number Delete - No More Browser Popup 
- Removed `confirm()` dialog when deleting phone numbers
- Delete now happens immediately without confirmation

### 2. Contact Info Edit Mode - Deferred Updates 
**How it works now:**
- Click "Edit" to enter edit mode
- Make all your changes (name, email, phone numbers, WhatsApp status)
- Changes are tracked locally but NOT saved yet
- Click "Done" to save ALL changes at once
- Only then does the client data reload

**Benefits:**
- No more reload after every single change
- Edit multiple fields without interruption
- Single save operation when you're done

## How to Run Migrations

1. Open Supabase Dashboard
2. Go to SQL Editor
3. Copy contents of `migration_12_add_installment_position.sql`
4. Run it
5. Copy contents of `migration_14_update_services_structure.sql`
6. Run it
7. Copy contents of `migration_13_populate_services.sql`
8. Run it

## Verification

After running all migrations, verify:
- Installments can be created/updated without errors
- Services table shows all 30 services with categories
- Contact info editing works smoothly with deferred updates
- Phone deletion works without popup
