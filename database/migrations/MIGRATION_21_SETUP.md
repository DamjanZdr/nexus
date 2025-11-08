# Board System Migration Setup

## Overview
Migration 21 creates a comprehensive board system with:
- System board (Cases) that displays cases with their statuses
- Custom user boards with independent statuses and cards
- Board sharing and access control
- Card management and assignments

## Fixed Issues
1. **Foreign Key Constraints**: Removed FK constraints to `users` table because Supabase uses `auth.users` in a separate schema
2. **RLS Policy Recursion**: Simplified `board_access` SELECT policy to avoid infinite recursion
3. **Trigger Already Exists**: Added DROP TRIGGER IF EXISTS before creating triggers

## Important: Choose the Right Migration

### Option 1: Fresh Install (RECOMMENDED if tables don't exist)
Use `migration_21_create_boards_system.sql`
- Creates tables with IF NOT EXISTS
- Safe if tables don't exist yet
- Will fail if old tables have FK constraints

### Option 2: Clean Install (Use if you have errors)
Use `migration_21_CLEAN_create_boards_system.sql`
- **WARNING: Drops all existing board tables and data**
- Use this if you're getting FK constraint errors
- Completely removes old tables and recreates them fresh

## Steps to Run

### 1. Run Main Migration

**If you're getting FK constraint errors, use the CLEAN version:**
Copy the entire contents of `migration_21_CLEAN_create_boards_system.sql` and run it in Supabase SQL Editor.
⚠️ **WARNING**: This will delete all existing board data!

**Otherwise, use the regular version:**
Copy the entire contents of `migration_21_create_boards_system.sql` and run it in Supabase SQL Editor.

This will create:
- \oards\ table
- \oard_access\ table (sharing & permissions)
- \oard_statuses\ table (custom board statuses)
- \cards\ table (custom board cards)
- \card_assignees\ table
- All necessary indexes
- RLS policies
- System 'Cases' board

### 2. Run Policy Fix
Copy the entire contents of \migration_21_fix_board_access_policy.sql\ and run it in Supabase SQL Editor.

This fixes the infinite recursion issue in the board_access RLS policy.

### 3. Verify Tables Created
Run this query to verify all tables exist:

\\\sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('boards', 'board_access', 'board_statuses', 'cards', 'card_assignees')
ORDER BY table_name;
\\\

You should see all 5 tables listed.

### 4. Verify Cases Board Exists
\\\sql
SELECT id, name, is_system, owner_id 
FROM boards 
WHERE is_system = true;
\\\

Should return 1 row with name 'Cases'.

### 5. Test Board Creation
Try creating a board through the UI:
1. Navigate to /board
2. Click on Private tab
3. Click "+ Create Board"
4. Enter a name and description
5. Click "Create Board"

If successful, you should see the new board in the Private tab.

## Database Schema

### boards
- id (UUID, PK)
- name (TEXT)
- description (TEXT, nullable)
- is_system (BOOLEAN) - true for Cases board
- owner_id (UUID) - references auth.users(id)
- created_at, updated_at (TIMESTAMPTZ)

### board_access
- id (UUID, PK)
- board_id (UUID, FK to boards)
- user_id (UUID) - references auth.users(id)
- access_level (TEXT) - 'owner', 'editor', or 'viewer'
- granted_by (UUID) - references auth.users(id)
- granted_at (TIMESTAMPTZ)
- UNIQUE(board_id, user_id)

### board_statuses
- id (UUID, PK)
- board_id (UUID, FK to boards)
- name (TEXT)
- position (INTEGER)
- color (TEXT) - hex color code
- created_at, updated_at (TIMESTAMPTZ)

### cards
- id (UUID, PK)
- board_id (UUID, FK to boards)
- status_id (UUID, FK to board_statuses)
- title (TEXT)
- description (TEXT, nullable)
- position (INTEGER) - position within status column
- due_date (DATE, nullable)
- created_by (UUID) - references auth.users(id)
- created_at, updated_at (TIMESTAMPTZ)

### card_assignees
- id (UUID, PK)
- card_id (UUID, FK to cards)
- user_id (UUID) - references auth.users(id)
- assigned_at (TIMESTAMPTZ)
- UNIQUE(card_id, user_id)

## Troubleshooting

### Error: "insert or update on table 'boards' violates foreign key constraint"
This means the migration still has FK constraints. Make sure you're running the updated version that has comments like:
\-- References auth.users(id) - no FK constraint\

### Error: "infinite recursion detected in policy"
Run the \migration_21_fix_board_access_policy.sql\ migration to fix the RLS policy.

### Board creation returns no error but board doesn't appear
Check the browser console for errors. The most common issue is RLS policies blocking the insert. Verify:
1. User is authenticated (\uth.uid()\ is not null)
2. RLS policies allow INSERT for authenticated users
