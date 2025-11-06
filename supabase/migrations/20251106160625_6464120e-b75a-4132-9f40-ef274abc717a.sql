-- Add status 'overdue' to invoices if not exists
-- This is a safe operation that won't fail if the status already exists

-- Update invoice status column to allow 'overdue' status
COMMENT ON COLUMN public.invoices.status IS 'Invoice status: pending, paid, overdue, cancelled';