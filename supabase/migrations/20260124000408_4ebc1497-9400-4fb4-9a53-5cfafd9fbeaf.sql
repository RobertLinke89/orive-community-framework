-- Add username-based profile URLs (retry as one atomic migration)

-- 1) Add username column
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS username text;

-- 2) Backfill username for existing rows where missing
WITH base AS (
  SELECT
    id,
    lower(
      trim(both '.' from regexp_replace(
        regexp_replace(coalesce(full_name, ''), '[^a-zA-Z0-9]+', '.', 'g'),
        '\\.+',
        '.',
        'g'
      ))
    ) AS slug
  FROM public.profiles
  WHERE (username IS NULL OR length(trim(username)) = 0)
), normalized AS (
  SELECT
    id,
    CASE
      WHEN slug IS NULL OR length(slug) = 0 THEN 'user.' || substr(id::text, 1, 6)
      WHEN length(slug) > 50 THEN left(slug, 50)
      ELSE slug
    END AS slug
  FROM base
), resolved AS (
  SELECT
    n.id,
    CASE
      WHEN EXISTS (
        SELECT 1
        FROM public.profiles p
        WHERE p.username IS NOT NULL
          AND lower(p.username) = lower(n.slug)
          AND p.id <> n.id
      ) THEN left(n.slug, 43) || '.' || substr(n.id::text, 1, 6)
      ELSE n.slug
    END AS final_username
  FROM normalized n
)
UPDATE public.profiles p
SET username = r.final_username
FROM resolved r
WHERE p.id = r.id;

-- 3) Enforce uniqueness (case-insensitive) when username is set
CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_unique
ON public.profiles (lower(username))
WHERE username IS NOT NULL AND length(trim(username)) > 0;

-- 4) Recreate public_profiles view (drop + create to avoid CREATE OR REPLACE column rename issues)
DROP VIEW IF EXISTS public.public_profiles;

CREATE VIEW public.public_profiles
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
  created_at,
  username
FROM public.profiles
WHERE onboarding_completed = true
  AND is_visible = true;
