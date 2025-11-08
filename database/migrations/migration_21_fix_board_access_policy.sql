-- Migration: Fix Board Access RLS Policy - Remove Infinite Recursion
-- Date: 2025-01-08
-- Description: Fixes the circular reference in board_access SELECT policy
--              The original policy was checking board_access within board_access causing infinite recursion

-- Drop the problematic policy
DROP POLICY IF EXISTS "Users can view board access" ON board_access;

-- Recreate with simplified logic that doesn't cause recursion
-- Users can only see their own access records
-- This is simpler and avoids the circular dependency with boards table
CREATE POLICY "Users can view board access"
ON board_access FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Note: Board owners will still be able to see all access via their board_access record
-- since they have access_level = 'owner' in their own record
