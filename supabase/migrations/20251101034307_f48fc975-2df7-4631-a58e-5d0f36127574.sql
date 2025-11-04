-- Create table for storing live PC stats
CREATE TABLE IF NOT EXISTS public.pc_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cpu_usage DECIMAL(5,2) NOT NULL,
  ram_usage DECIMAL(5,2) NOT NULL,
  gpu_usage DECIMAL(5,2),
  gpu_temp DECIMAL(5,2),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.pc_stats ENABLE ROW LEVEL SECURITY;

-- Allow public read access to PC stats
CREATE POLICY "Allow public read access to PC stats"
  ON public.pc_stats
  FOR SELECT
  USING (true);

-- Allow insert from authenticated requests (the edge function will use service role)
CREATE POLICY "Allow service role to insert PC stats"
  ON public.pc_stats
  FOR INSERT
  WITH CHECK (true);

-- Create index for faster queries on timestamp
CREATE INDEX IF NOT EXISTS idx_pc_stats_timestamp ON public.pc_stats(timestamp DESC);

-- Function to clean up old stats (keep only last 100 records)
CREATE OR REPLACE FUNCTION cleanup_old_pc_stats()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM public.pc_stats
  WHERE id NOT IN (
    SELECT id FROM public.pc_stats
    ORDER BY timestamp DESC
    LIMIT 100
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically cleanup after insert
CREATE TRIGGER trigger_cleanup_pc_stats
  AFTER INSERT ON public.pc_stats
  FOR EACH STATEMENT
  EXECUTE FUNCTION cleanup_old_pc_stats();