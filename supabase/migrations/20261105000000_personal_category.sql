-- APP project. Allow category 'personal' (Personal Coaching, patch 0010) in claimable_profiles. Idempotent.
-- Rollback: supabase/rollbacks/20261105000000_personal_category.rollback.sql
ALTER TABLE public.claimable_profiles DROP CONSTRAINT IF EXISTS claimable_profiles_category_check;
ALTER TABLE public.claimable_profiles ADD CONSTRAINT claimable_profiles_category_check
  CHECK (category IN ('ice','sauna','breath','yoga','meditation','mindfulness','bodywork','sound','spiritual','coaching','kambo','personal'));
