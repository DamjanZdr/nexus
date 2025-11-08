-- Migration 9: Add default statuses
-- Description: Creates default case statuses (New, In Progress, Completed)

-- Insert default statuses
INSERT INTO status (name, position) VALUES
  ('New', 1),
  ('In Progress', 2),
  ('Completed', 3)
ON CONFLICT DO NOTHING;

-- Comment explaining the purpose
COMMENT ON TABLE status IS 'Case statuses with display order';
