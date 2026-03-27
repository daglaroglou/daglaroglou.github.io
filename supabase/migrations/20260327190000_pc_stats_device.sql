-- Split desktop vs laptop streams (same table, filtered by device)
ALTER TABLE public.pc_stats
  ADD COLUMN IF NOT EXISTS device TEXT NOT NULL DEFAULT 'pc';

COMMENT ON COLUMN public.pc_stats.device IS
  'Source machine: pc (desktop default), laptop, etc.';

CREATE INDEX IF NOT EXISTS idx_pc_stats_device_timestamp
  ON public.pc_stats (device, timestamp DESC);

-- Retain last 100 rows per device (not 100 rows total across machines)
CREATE OR REPLACE FUNCTION cleanup_old_pc_stats()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM public.pc_stats
  WHERE id IN (
    SELECT id
    FROM (
      SELECT
        id,
        ROW_NUMBER() OVER (
          PARTITION BY device
          ORDER BY timestamp DESC
        ) AS rn
      FROM public.pc_stats
    ) ranked
    WHERE ranked.rn > 100
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
