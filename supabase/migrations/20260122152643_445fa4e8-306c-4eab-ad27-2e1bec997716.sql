-- Fix linter: ensure public view uses invoker security (no SECURITY DEFINER)
CREATE OR REPLACE VIEW public.public_profiles
WITH (security_invoker=on) AS
SELECT
  id,
  full_name,
  professional_title,
  expertise,
  bio,
  location,
  avatar_url,
  banner_url,
  onboarding_completed,
  created_at
FROM public.profiles
WHERE onboarding_completed = true
  AND is_visible = true;
