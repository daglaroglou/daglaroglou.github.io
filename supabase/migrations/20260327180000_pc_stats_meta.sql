-- Optional per-row labels for multi-machine stats (desktop vs laptop, etc.)
ALTER TABLE public.pc_stats
  ADD COLUMN IF NOT EXISTS stats_meta JSONB;

COMMENT ON COLUMN public.pc_stats.stats_meta IS
  'Optional UI labels: { "os", "display", "cpu", "ram", "gpu", "gpu2" } strings';
