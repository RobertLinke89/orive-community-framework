-- Rollback for crawler 20261105000000_personal_coaching_scoring (CRAWLER apcrvowzrihkpkuwxbhb)
-- 1) restore previous orive_quality_signals: re-run the v1 definition without 'Personal Coaching' in the core array
--    and with 'performance' back in the corporate keyword regex (definition saved in /workspace/orive-db-backup-20261102/crawler_fn_orive_quality_signals_before.sql)
-- 2) restore PC scores from backup table:
UPDATE public.facilitators f SET quality_score = b.quality_score, quality_tier = b.quality_tier,
  quality_signals = b.quality_signals, quality_scored_at = b.quality_scored_at
FROM public._bak_pc_quality_20261102 b WHERE b.id = f.id;
-- 3) when no longer needed: DROP TABLE public._bak_pc_quality_20261102;
