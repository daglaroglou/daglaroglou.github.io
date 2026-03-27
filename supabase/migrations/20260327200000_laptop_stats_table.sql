-- Laptop metrics in a separate table so desktop pc_stats is never mixed in.
CREATE TABLE IF NOT EXISTS public.laptop_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cpu_usage DECIMAL(5,2) NOT NULL,
  ram_usage DECIMAL(5,2) NOT NULL,
  gpu_usage DECIMAL(5,2),
  gpu_temp DECIMAL(5,2),
  gpu2_usage DECIMAL(5,2),
  gpu2_temp DECIMAL(5,2),
  storage_used_gb DECIMAL(12,2),
  storage_total_gb DECIMAL(12,2),
  stats_meta JSONB,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.laptop_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to laptop stats"
  ON public.laptop_stats
  FOR SELECT
  USING (true);

CREATE POLICY "Allow service role to insert laptop stats"
  ON public.laptop_stats
  FOR INSERT
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_laptop_stats_timestamp ON public.laptop_stats (timestamp DESC);

CREATE OR REPLACE FUNCTION cleanup_old_laptop_stats()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM public.laptop_stats
  WHERE id NOT IN (
    SELECT id FROM public.laptop_stats
    ORDER BY timestamp DESC
    LIMIT 100
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trigger_cleanup_laptop_stats ON public.laptop_stats;
CREATE TRIGGER trigger_cleanup_laptop_stats
  AFTER INSERT ON public.laptop_stats
  FOR EACH STATEMENT
  EXECUTE FUNCTION cleanup_old_laptop_stats();

-- Enable Realtime for laptop_stats in Dashboard → Database → Publications, if needed.
