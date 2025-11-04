-- Fix function search path security issue
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;