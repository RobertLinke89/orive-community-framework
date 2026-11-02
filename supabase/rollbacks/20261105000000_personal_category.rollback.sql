-- fails if rows with category='personal' exist (move/delete them first)
ALTER TABLE public.claimable_profiles DROP CONSTRAINT IF EXISTS claimable_profiles_category_check;
ALTER TABLE public.claimable_profiles ADD CONSTRAINT claimable_profiles_category_check
  CHECK (category IN ('ice','sauna','breath','yoga','meditation','mindfulness','bodywork','sound','spiritual','coaching','kambo'));
