-- Migration 11: Case assignees (multiple users per case)
-- Description: Creates junction table for assigning multiple users to cases

-- Create case_assignees junction table
CREATE TABLE IF NOT EXISTS case_assignees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(case_id, user_id)
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_case_assignees_case_id ON case_assignees(case_id);
CREATE INDEX IF NOT EXISTS idx_case_assignees_user_id ON case_assignees(user_id);

-- Comment
COMMENT ON TABLE case_assignees IS 'Junction table for assigning multiple users to cases';
