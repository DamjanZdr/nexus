-- Debug Query: Check if boards were created
-- Run this in Supabase SQL Editor to see all boards

SELECT 
  b.id,
  b.name,
  b.description,
  b.is_system,
  b.owner_id,
  b.created_at,
  (SELECT COUNT(*) FROM board_access ba WHERE ba.board_id = b.id) as access_count
FROM boards b
ORDER BY b.created_at DESC;
