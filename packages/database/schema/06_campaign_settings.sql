CREATE TABLE IF NOT EXISTS public.campaign_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  enabled boolean NOT NULL DEFAULT true,
  template text NOT NULL DEFAULT 'cinematic',
  kind text NOT NULL DEFAULT 'community',
  eyebrow text NOT NULL,
  title text NOT NULL,
  body text NOT NULL,
  action_label text,
  href text,
  accent text,
  image_src text,
  updated_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
  updated_at timestamp NOT NULL DEFAULT now()
);

INSERT INTO public.campaign_settings (
  key, enabled, template, kind, eyebrow, title, body, action_label, href, accent, image_src
) VALUES (
  'forum_top',
  true,
  'cinematic',
  'community',
  'COMMUNITY PROGRAM / 2026',
  'MAKE ROOM FOR THE NEXT IDEA.',
  'A reserved top-of-forum space for student projects, campus initiatives, and future sponsor messages.',
  'EXPLORE PROGRAM',
  '/search',
  '#812D37',
  '/images/campaign-independent-cinema.jpg'
)
ON CONFLICT (key) DO NOTHING;
