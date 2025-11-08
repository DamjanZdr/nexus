-- Migration 16: Add default down payment to existing cases
-- Description: Creates a default down payment installment for cases that don't have one

-- Add down payment to cases that don't have any installments
INSERT INTO installments (case_id, amount, position, is_down_payment, automatic_invoice)
SELECT 
    c.id as case_id,
    0 as amount,
    1 as position,
    true as is_down_payment,
    false as automatic_invoice
FROM cases c
WHERE NOT EXISTS (
    SELECT 1 FROM installments i 
    WHERE i.case_id = c.id AND i.is_down_payment = true
)
ON CONFLICT DO NOTHING;

-- Ensure all down payments have position 1
UPDATE installments
SET position = 1
WHERE is_down_payment = true AND position != 1;

-- Reorder other installments to start from position 2
WITH reordered AS (
    SELECT 
        id,
        case_id,
        ROW_NUMBER() OVER (PARTITION BY case_id ORDER BY position, created_at) + 1 as new_position
    FROM installments
    WHERE is_down_payment = false
)
UPDATE installments
SET position = reordered.new_position
FROM reordered
WHERE installments.id = reordered.id;
