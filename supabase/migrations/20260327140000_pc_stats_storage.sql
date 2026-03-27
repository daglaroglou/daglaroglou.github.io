-- Aggregate local disk capacity (used + total GB) from the stats collector
ALTER TABLE public.pc_stats
  ADD COLUMN IF NOT EXISTS storage_used_gb DECIMAL(12,2),
  ADD COLUMN IF NOT EXISTS storage_total_gb DECIMAL(12,2);
