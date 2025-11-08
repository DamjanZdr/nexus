-- Migration: Create Boards System
-- Date: 2025-01-08
-- Description: Creates comprehensive board system with support for:
--   - System board (Cases) that displays cases with case statuses
--   - Custom boards with independent statuses and cards
--   - Board sharing and access control
--   - Card assignments and management
--
-- IMPORTANT: This migration removes foreign key constraints to auth.users
--            because Supabase uses auth.users which is in a separate schema
--            from public tables. User IDs are stored as UUIDs without FK constraints.

-- ============================================
-- BOARDS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS boards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  is_system BOOLEAN DEFAULT false,
  owner_id UUID, -- References auth.users(id) - no FK constraint
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- BOARD ACCESS (Sharing & Permissions)
-- ============================================
CREATE TABLE IF NOT EXISTS board_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  user_id UUID NOT NULL, -- References auth.users(id) - no FK constraint
  access_level TEXT NOT NULL CHECK (access_level IN ('owner', 'editor', 'viewer')),
  granted_by UUID, -- References auth.users(id) - no FK constraint
  granted_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(board_id, user_id)
);

-- ============================================
-- BOARD STATUSES (For Custom Boards)
-- ============================================
CREATE TABLE IF NOT EXISTS board_statuses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  position INTEGER DEFAULT 0,
  color TEXT, -- hex color code like #3B82F6
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- CARDS (For Custom Boards)
-- ============================================
CREATE TABLE IF NOT EXISTS cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  status_id UUID NOT NULL REFERENCES board_statuses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  position INTEGER DEFAULT 0, -- position within the status column
  due_date DATE,
  created_by UUID, -- References auth.users(id) - no FK constraint
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- CARD ASSIGNEES
-- ============================================
CREATE TABLE IF NOT EXISTS card_assignees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  user_id UUID NOT NULL, -- References auth.users(id) - no FK constraint
  assigned_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(card_id, user_id)
);

-- ============================================
-- INDEXES for Performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_boards_owner ON boards(owner_id);
CREATE INDEX IF NOT EXISTS idx_boards_is_system ON boards(is_system);

CREATE INDEX IF NOT EXISTS idx_board_access_board ON board_access(board_id);
CREATE INDEX IF NOT EXISTS idx_board_access_user ON board_access(user_id);

CREATE INDEX IF NOT EXISTS idx_board_statuses_board ON board_statuses(board_id);
CREATE INDEX IF NOT EXISTS idx_board_statuses_position ON board_statuses(board_id, position);

CREATE INDEX IF NOT EXISTS idx_cards_board ON cards(board_id);
CREATE INDEX IF NOT EXISTS idx_cards_status ON cards(status_id);
CREATE INDEX IF NOT EXISTS idx_cards_position ON cards(status_id, position);
CREATE INDEX IF NOT EXISTS idx_cards_created_by ON cards(created_by);

CREATE INDEX IF NOT EXISTS idx_card_assignees_card ON card_assignees(card_id);
CREATE INDEX IF NOT EXISTS idx_card_assignees_user ON card_assignees(user_id);

-- ============================================
-- TRIGGER: Update updated_at timestamp
-- ============================================
-- Create function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop triggers if they exist before recreating
DROP TRIGGER IF EXISTS update_boards_updated_at ON boards;
DROP TRIGGER IF EXISTS update_board_statuses_updated_at ON board_statuses;
DROP TRIGGER IF EXISTS update_cards_updated_at ON cards;

-- Create triggers
CREATE TRIGGER update_boards_updated_at BEFORE UPDATE ON boards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_board_statuses_updated_at BEFORE UPDATE ON board_statuses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cards_updated_at BEFORE UPDATE ON cards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- INSERT: System "Cases" Board
-- ============================================
-- Insert the system Cases board (no owner, accessible to all)
INSERT INTO boards (id, name, description, is_system, owner_id)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Cases',
  'System board displaying all cases with their current status',
  true,
  NULL
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS
ALTER TABLE boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE board_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE board_statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_assignees ENABLE ROW LEVEL SECURITY;

-- ============================================
-- BOARDS POLICIES
-- ============================================

-- Users can view boards they own or have access to, plus system boards
CREATE POLICY "Users can view accessible boards"
ON boards FOR SELECT
TO authenticated
USING (
  is_system = true OR
  owner_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM board_access
    WHERE board_access.board_id = boards.id
    AND board_access.user_id = auth.uid()
  )
);

-- Users can create their own boards
CREATE POLICY "Users can create boards"
ON boards FOR INSERT
TO authenticated
WITH CHECK (owner_id = auth.uid() AND is_system = false);

-- Users can update boards they own (not system boards)
CREATE POLICY "Owners can update their boards"
ON boards FOR UPDATE
TO authenticated
USING (owner_id = auth.uid() AND is_system = false)
WITH CHECK (owner_id = auth.uid() AND is_system = false);

-- Users can delete boards they own (not system boards)
CREATE POLICY "Owners can delete their boards"
ON boards FOR DELETE
TO authenticated
USING (owner_id = auth.uid() AND is_system = false);

-- ============================================
-- BOARD ACCESS POLICIES
-- ============================================

-- Users can view their own access records
-- This avoids circular dependency with boards table
CREATE POLICY "Users can view board access"
ON board_access FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Board owners can grant access
CREATE POLICY "Board owners can grant access"
ON board_access FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM boards
    WHERE boards.id = board_access.board_id
    AND boards.owner_id = auth.uid()
  )
);

-- Board owners can revoke access
CREATE POLICY "Board owners can revoke access"
ON board_access FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM boards
    WHERE boards.id = board_access.board_id
    AND boards.owner_id = auth.uid()
  )
);

-- ============================================
-- BOARD STATUSES POLICIES
-- ============================================

-- Users can view statuses for boards they have access to
CREATE POLICY "Users can view board statuses"
ON board_statuses FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM boards
    WHERE boards.id = board_statuses.board_id
    AND (
      boards.owner_id = auth.uid() OR
      EXISTS (
        SELECT 1 FROM board_access
        WHERE board_access.board_id = boards.id
        AND board_access.user_id = auth.uid()
      )
    )
  )
);

-- Owners and editors can create statuses
CREATE POLICY "Owners and editors can create statuses"
ON board_statuses FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM boards
    WHERE boards.id = board_statuses.board_id
    AND (
      boards.owner_id = auth.uid() OR
      EXISTS (
        SELECT 1 FROM board_access
        WHERE board_access.board_id = boards.id
        AND board_access.user_id = auth.uid()
        AND board_access.access_level IN ('owner', 'editor')
      )
    )
  )
);

-- Owners and editors can update statuses
CREATE POLICY "Owners and editors can update statuses"
ON board_statuses FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM boards
    WHERE boards.id = board_statuses.board_id
    AND (
      boards.owner_id = auth.uid() OR
      EXISTS (
        SELECT 1 FROM board_access
        WHERE board_access.board_id = boards.id
        AND board_access.user_id = auth.uid()
        AND board_access.access_level IN ('owner', 'editor')
      )
    )
  )
);

-- Owners and editors can delete statuses
CREATE POLICY "Owners and editors can delete statuses"
ON board_statuses FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM boards
    WHERE boards.id = board_statuses.board_id
    AND (
      boards.owner_id = auth.uid() OR
      EXISTS (
        SELECT 1 FROM board_access
        WHERE board_access.board_id = boards.id
        AND board_access.user_id = auth.uid()
        AND board_access.access_level IN ('owner', 'editor')
      )
    )
  )
);

-- ============================================
-- CARDS POLICIES
-- ============================================

-- Users can view cards for boards they have access to
CREATE POLICY "Users can view cards"
ON cards FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM boards
    WHERE boards.id = cards.board_id
    AND (
      boards.owner_id = auth.uid() OR
      EXISTS (
        SELECT 1 FROM board_access
        WHERE board_access.board_id = boards.id
        AND board_access.user_id = auth.uid()
      )
    )
  )
);

-- Owners and editors can create cards
CREATE POLICY "Owners and editors can create cards"
ON cards FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM boards
    WHERE boards.id = cards.board_id
    AND (
      boards.owner_id = auth.uid() OR
      EXISTS (
        SELECT 1 FROM board_access
        WHERE board_access.board_id = boards.id
        AND board_access.user_id = auth.uid()
        AND board_access.access_level IN ('owner', 'editor')
      )
    )
  )
);

-- Owners and editors can update cards
CREATE POLICY "Owners and editors can update cards"
ON cards FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM boards
    WHERE boards.id = cards.board_id
    AND (
      boards.owner_id = auth.uid() OR
      EXISTS (
        SELECT 1 FROM board_access
        WHERE board_access.board_id = boards.id
        AND board_access.user_id = auth.uid()
        AND board_access.access_level IN ('owner', 'editor')
      )
    )
  )
);

-- Owners and editors can delete cards
CREATE POLICY "Owners and editors can delete cards"
ON cards FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM boards
    WHERE boards.id = cards.board_id
    AND (
      boards.owner_id = auth.uid() OR
      EXISTS (
        SELECT 1 FROM board_access
        WHERE board_access.board_id = boards.id
        AND board_access.user_id = auth.uid()
        AND board_access.access_level IN ('owner', 'editor')
      )
    )
  )
);

-- ============================================
-- CARD ASSIGNEES POLICIES
-- ============================================

-- Users can view assignees for cards they can see
CREATE POLICY "Users can view card assignees"
ON card_assignees FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM cards
    JOIN boards ON boards.id = cards.board_id
    WHERE cards.id = card_assignees.card_id
    AND (
      boards.owner_id = auth.uid() OR
      EXISTS (
        SELECT 1 FROM board_access
        WHERE board_access.board_id = boards.id
        AND board_access.user_id = auth.uid()
      )
    )
  )
);

-- Owners and editors can assign users to cards
CREATE POLICY "Owners and editors can assign cards"
ON card_assignees FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM cards
    JOIN boards ON boards.id = cards.board_id
    WHERE cards.id = card_assignees.card_id
    AND (
      boards.owner_id = auth.uid() OR
      EXISTS (
        SELECT 1 FROM board_access
        WHERE board_access.board_id = boards.id
        AND board_access.user_id = auth.uid()
        AND board_access.access_level IN ('owner', 'editor')
      )
    )
  )
);

-- Owners and editors can remove assignees
CREATE POLICY "Owners and editors can remove assignees"
ON card_assignees FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM cards
    JOIN boards ON boards.id = cards.board_id
    WHERE cards.id = card_assignees.card_id
    AND (
      boards.owner_id = auth.uid() OR
      EXISTS (
        SELECT 1 FROM board_access
        WHERE board_access.board_id = boards.id
        AND board_access.user_id = auth.uid()
        AND board_access.access_level IN ('owner', 'editor')
      )
    )
  )
);

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON TABLE boards IS 'Boards containing statuses and cards. System board for Cases, custom boards for user tasks';
COMMENT ON TABLE board_access IS 'User access and permissions for boards';
COMMENT ON TABLE board_statuses IS 'Statuses/columns for custom boards (Cases uses status table)';
COMMENT ON TABLE cards IS 'Cards/tasks for custom boards (Cases uses cases table)';
COMMENT ON TABLE card_assignees IS 'User assignments for cards';

COMMENT ON COLUMN boards.is_system IS 'System boards (like Cases) cannot be deleted and use different data sources';
COMMENT ON COLUMN board_access.access_level IS 'owner: full control, editor: can modify, viewer: read-only';
COMMENT ON COLUMN board_statuses.position IS 'Display order of status columns';
COMMENT ON COLUMN cards.position IS 'Display order of cards within a status column';
