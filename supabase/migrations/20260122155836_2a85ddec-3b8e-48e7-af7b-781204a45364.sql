-- Create a table for public resources (served via backend function)
CREATE TABLE IF NOT EXISTS public.resources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security (no direct client access; served via backend function)
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_resources_active_category_sort
  ON public.resources (is_active, category, sort_order, created_at);

-- updated_at trigger
DROP TRIGGER IF EXISTS trg_resources_updated_at ON public.resources;
CREATE TRIGGER trg_resources_updated_at
BEFORE UPDATE ON public.resources
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Seed initial resources (idempotent-ish via unique URL+title per category)
-- Add a lightweight unique constraint to prevent duplicates from repeated seeds
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'resources_unique_category_title_url'
  ) THEN
    ALTER TABLE public.resources
      ADD CONSTRAINT resources_unique_category_title_url UNIQUE (category, title, url);
  END IF;
END$$;

INSERT INTO public.resources (category, title, url, description, sort_order)
VALUES
  ('Documentation', 'Company Formation Guide', '/start-business', 'Step-by-step guide to forming your company.', 10),
  ('Documentation', 'WingFinder Tutorial', '/wingfinder', 'Learn how to use WingFinder to clarify direction.', 20),
  ('Documentation', 'DEZK Documentation', '/dezk', 'Explore DEZK features and best practices.', 30),

  ('Video Tutorials', 'Getting Started with ORIVE', '/orive-landing', 'Quick intro to getting set up on the platform.', 10),
  ('Video Tutorials', 'Using the Marketplace', '/marketplace', 'How to browse and book offerings.', 20),
  ('Video Tutorials', 'Setting up Your Wallet', '/orive-wallet', 'Learn how to set up and use your wallet.', 30),

  ('Templates', 'Business Plan Template', '#', 'Starter business plan outline.', 10),
  ('Templates', 'Contract Templates', '#', 'Common agreements and templates.', 20),
  ('Templates', 'Marketing Materials', '#', 'Copy + assets to promote your services.', 30),

  ('Helpful Links', 'Business Registration Portal', '#', 'Official business registration resources.', 10),
  ('Helpful Links', 'Tax Information', '#', 'General tax guidance and links.', 20),
  ('Helpful Links', 'Legal Resources', '#', 'Legal resources and references.', 30)
ON CONFLICT (category, title, url) DO NOTHING;