-- Second GPU metrics (RTX 3060 alongside existing GTX 1660 Super columns)
ALTER TABLE public.pc_stats
  ADD COLUMN IF NOT EXISTS gpu2_usage DECIMAL(5,2),
  ADD COLUMN IF NOT EXISTS gpu2_temp DECIMAL(5,2);
