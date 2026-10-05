-- ARK Finance Consultancy — Admin panel + CMS core schema.
-- 1) Admin auth (custom sessions: bcrypt-hashed passwords in DB, opaque session tokens).
-- 2) CMS content tables (site_settings singleton, page_sections, stats, process_steps, media).
-- 3) Column extensions to existing content tables (services, team_members, testimonials,
--    blog_posts, leads, newsletter_subscribers).
-- 4) seo_meta, legal_pages, audit_log.
-- RLS: admin-only tables are service_role-only (all admin writes flow through server
-- functions using the service role key, gated by our own session auth). Public content
-- tables keep anon SELECT for published rows.

-- ============================================================
-- Admin auth
-- ============================================================

CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT 'editor' CHECK (role IN ('admin', 'editor')),
  password_hash TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.admin_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.admin_users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_used_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admin_sessions_user ON public.admin_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires ON public.admin_sessions(expires_at);

-- ============================================================
-- CMS content
-- ============================================================

CREATE TABLE IF NOT EXISTS public.site_settings (
  id BOOLEAN PRIMARY KEY DEFAULT true CHECK (id = true),
  firm_name TEXT NOT NULL DEFAULT 'ARK Finance Consultancy',
  short_name TEXT NOT NULL DEFAULT 'ARK Finance',
  tagline TEXT NOT NULL DEFAULT 'Solution to every financial problem',
  logo_url TEXT,
  phone TEXT NOT NULL DEFAULT '',
  phone_href TEXT NOT NULL DEFAULT '',
  whatsapp_number TEXT NOT NULL DEFAULT '',
  whatsapp_message TEXT NOT NULL DEFAULT 'Hello ARK Finance, I would like a consultation.',
  public_email TEXT NOT NULL DEFAULT '',
  address_line1 TEXT NOT NULL DEFAULT '',
  address_line2 TEXT NOT NULL DEFAULT '',
  address_area TEXT NOT NULL DEFAULT '',
  address_region TEXT NOT NULL DEFAULT '',
  maps_link TEXT NOT NULL DEFAULT '',
  office_hours TEXT NOT NULL DEFAULT '',
  established_year INT,
  footer_blurb TEXT NOT NULL DEFAULT '',
  footer_copyright TEXT NOT NULL DEFAULT 'All rights reserved.',
  founder_name TEXT NOT NULL DEFAULT '',
  founder_title TEXT NOT NULL DEFAULT '',
  social_links JSONB NOT NULL DEFAULT '{}',
  seo_defaults JSONB NOT NULL DEFAULT '{}',
  content_version BIGINT NOT NULL DEFAULT 1,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.page_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page TEXT NOT NULL,
  section_key TEXT NOT NULL,
  eyebrow TEXT NOT NULL DEFAULT '',
  heading TEXT NOT NULL DEFAULT '',
  intro TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL DEFAULT '',
  cta_label TEXT NOT NULL DEFAULT '',
  cta_target TEXT NOT NULL DEFAULT '',
  media_url TEXT,
  align TEXT NOT NULL DEFAULT 'left',
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (page, section_key)
);

CREATE TABLE IF NOT EXISTS public.stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  value TEXT NOT NULL,
  label TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.process_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  step TEXT NOT NULL DEFAULT '',
  title TEXT NOT NULL,
  body TEXT NOT NULL DEFAULT '',
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename TEXT NOT NULL,
  path TEXT NOT NULL,
  bucket TEXT NOT NULL DEFAULT 'site-media',
  url TEXT NOT NULL,
  mime_type TEXT NOT NULL DEFAULT 'image/webp',
  size_bytes BIGINT NOT NULL DEFAULT 0,
  alt_text TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- Extend existing content tables
-- ============================================================

ALTER TABLE public.services ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS image_alt TEXT NOT NULL DEFAULT '';

ALTER TABLE public.team_members ADD COLUMN IF NOT EXISTS credential TEXT NOT NULL DEFAULT '';
ALTER TABLE public.team_members ADD COLUMN IF NOT EXISTS specialization TEXT NOT NULL DEFAULT '';
ALTER TABLE public.team_members ADD COLUMN IF NOT EXISTS is_founder BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE public.testimonials ADD COLUMN IF NOT EXISTS service_tag TEXT NOT NULL DEFAULT '';
ALTER TABLE public.testimonials ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.testimonials ADD COLUMN IF NOT EXISTS photo_url TEXT;

ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'Finance';
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS tags TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'published'
  CHECK (status IN ('draft', 'scheduled', 'published'));
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS seo_title TEXT NOT NULL DEFAULT '';
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS seo_description TEXT NOT NULL DEFAULT '';
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS og_image TEXT;

ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS source_page TEXT NOT NULL DEFAULT '';
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS internal_notes TEXT NOT NULL DEFAULT '';
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES public.admin_users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_leads_created ON public.leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);

ALTER TABLE public.newsletter_subscribers ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active'
  CHECK (status IN ('active', 'unsubscribed'));
ALTER TABLE public.newsletter_subscribers ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'footer';

-- ============================================================
-- SEO + legal + audit
-- ============================================================

CREATE TABLE IF NOT EXISTS public.seo_meta (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  og_image TEXT,
  robots TEXT NOT NULL DEFAULT 'index, follow',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.legal_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL DEFAULT '',
  intro TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.admin_users(id) ON DELETE SET NULL,
  user_role TEXT NOT NULL DEFAULT '',
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id TEXT,
  meta JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_created ON public.audit_log(created_at DESC);

-- ============================================================
-- RLS + Grants
-- ============================================================

-- Admin-only tables (deny anon + authenticated entirely)
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

GRANT ALL ON public.admin_users TO service_role;
GRANT ALL ON public.admin_sessions TO service_role;
GRANT ALL ON public.media TO service_role;
GRANT ALL ON public.audit_log TO service_role;

-- Public content tables (anon may read published content; writes only via service_role)
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.process_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_meta ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legal_pages ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON public.site_settings, public.page_sections, public.stats,
  public.process_steps, public.seo_meta, public.legal_pages TO anon, authenticated;
GRANT ALL ON public.site_settings, public.page_sections, public.stats,
  public.process_steps, public.seo_meta, public.legal_pages TO service_role;

-- Mirrored grants for the new columns on existing tables
GRANT ALL ON public.services, public.team_members, public.testimonials,
  public.blog_posts, public.leads, public.newsletter_subscribers TO service_role;

-- Updated-at triggers for new tables
CREATE TRIGGER t_site_settings BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER t_page_sections BEFORE UPDATE ON public.page_sections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER t_stats BEFORE UPDATE ON public.stats
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER t_process_steps BEFORE UPDATE ON public.process_steps
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER t_media BEFORE UPDATE ON public.media
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER t_seo_meta BEFORE UPDATE ON public.seo_meta
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER t_legal_pages BEFORE UPDATE ON public.legal_pages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER t_admin_users BEFORE UPDATE ON public.admin_users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();