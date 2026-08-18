CREATE OR REPLACE FUNCTION public.update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql SET search_path = public;

CREATE TABLE public.admin_emails (
  email TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.admin_emails TO authenticated;
GRANT ALL ON public.admin_emails TO service_role;
ALTER TABLE public.admin_emails ENABLE ROW LEVEL SECURITY;
INSERT INTO public.admin_emails (email) VALUES ('karanvalangar211@gmail.com');

CREATE OR REPLACE FUNCTION public.is_admin() RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_emails
    WHERE lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

CREATE POLICY "admins read admin emails" ON public.admin_emails FOR SELECT TO authenticated USING (public.is_admin());

CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  summary TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  icon TEXT NOT NULL DEFAULT 'Landmark',
  features TEXT[] NOT NULL DEFAULT '{}',
  sort_order INT NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  designation TEXT NOT NULL DEFAULT '',
  company TEXT NOT NULL DEFAULT '',
  quote TEXT NOT NULL,
  rating INT NOT NULL DEFAULT 5,
  sort_order INT NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  designation TEXT NOT NULL DEFAULT '',
  bio TEXT NOT NULL DEFAULT '',
  photo_url TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  cover_url TEXT,
  author TEXT NOT NULL DEFAULT 'ARK Finance Consultancy',
  published_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.site_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL DEFAULT '',
  image_url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  service TEXT NOT NULL DEFAULT '',
  message TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.services, public.testimonials, public.team_members, public.blog_posts, public.site_images TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.services, public.testimonials, public.team_members, public.blog_posts, public.site_images, public.leads, public.newsletter_subscribers TO authenticated;
GRANT INSERT ON public.leads, public.newsletter_subscribers TO anon;
GRANT ALL ON public.services, public.testimonials, public.team_members, public.blog_posts, public.site_images, public.leads, public.newsletter_subscribers TO service_role;

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read services" ON public.services FOR SELECT TO anon, authenticated USING (is_published);
CREATE POLICY "admins manage services" ON public.services FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "public read testimonials" ON public.testimonials FOR SELECT TO anon, authenticated USING (is_published);
CREATE POLICY "admins manage testimonials" ON public.testimonials FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "public read team" ON public.team_members FOR SELECT TO anon, authenticated USING (is_published);
CREATE POLICY "admins manage team" ON public.team_members FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "public read posts" ON public.blog_posts FOR SELECT TO anon, authenticated USING (is_published);
CREATE POLICY "admins manage posts" ON public.blog_posts FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "public read images" ON public.site_images FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admins manage images" ON public.site_images FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "anyone can submit lead" ON public.leads FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "admins manage leads" ON public.leads FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "anyone can subscribe" ON public.newsletter_subscribers FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "admins manage subscribers" ON public.newsletter_subscribers FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE TRIGGER t_services BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER t_testimonials BEFORE UPDATE ON public.testimonials FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER t_team BEFORE UPDATE ON public.team_members FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER t_posts BEFORE UPDATE ON public.blog_posts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER t_images BEFORE UPDATE ON public.site_images FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER t_leads BEFORE UPDATE ON public.leads FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.services (title, slug, summary, description, icon, features, sort_order) VALUES
('Loan Financing', 'loan-financing', 'Home loans, loan against property, project loans and vehicle loans arranged with the right lender at the right terms.', 'We help individuals and businesses across Ahmedabad and Gujarat secure the funding they need. Our team compares offers across banks and NBFCs, prepares your file so it clears underwriting the first time, and negotiates on rate, tenure and processing charges on your behalf.', 'Landmark', ARRAY['Home loans & balance transfer','Loan against property','Project & business loans','New and used vehicle loans'], 1),
('Insurance Services', 'insurance-services', 'Life and general insurance advisory (LIC & GIC) built around your family and business risk profile.', 'Insurance should be sized to your liabilities and goals, not sold off a brochure. We assess your cover gap, recommend LIC and GIC products that genuinely fit, and stay with you for renewals, endorsements and claim support.', 'ShieldCheck', ARRAY['Life insurance planning (LIC)','General insurance (GIC)','Health & family floater cover','Claim assistance and renewals'], 2),
('Tax Consultancy', 'tax-consultancy', 'ITR filing, GST returns and year-round tax planning handled by qualified professionals.', 'From income tax returns to GST compliance for growing businesses, we keep your filings accurate and on time. Founder-led review on every file means fewer notices, cleaner books and tax planning that is done before the year ends, not after.', 'FileText', ARRAY['Income tax return filing','GST registration & returns','Advance & year-end tax planning','Notice and assessment support','Audit services'], 3),
('Financial Management', 'financial-management', 'Investment planning and cash-flow structuring that turns income into long-term wealth.', 'We map your goals, timelines and risk appetite, then build a practical allocation across instruments. Reviews are periodic and unemotional, so decisions stay tied to your plan rather than to market noise.', 'TrendingUp', ARRAY['Goal-based investment planning','Portfolio review & rebalancing','Retirement and education funding','Business cash-flow advisory'], 4);

INSERT INTO public.testimonials (name, designation, company, quote, sort_order) VALUES
('Rakesh Patel', 'Proprietor', 'Patel Trading Co.', 'ARK arranged our project loan in under three weeks after two banks had already turned us down. Karan personally reworked the file. Genuinely professional team.', 1),
('Nisha Shah', 'Senior Engineer', 'Infotech Solutions', 'My home loan paperwork was handled end to end and I got a rate almost half a percent lower than what my own bank offered. Zero follow-up stress.', 2),
('Mehul Desai', 'Director', 'Desai Textiles Pvt. Ltd.', 'GST returns and annual filings have been faultless for the last two years. Their tax planning advice alone saved us more than their fee.', 3),
('Priya Trivedi', 'Homemaker', 'Vastral, Ahmedabad', 'They explained every insurance option in plain Gujarati and English until I was comfortable. Never once pushed a product I did not need.', 4),
('Jignesh Barot', 'Owner', 'Barot Automobiles', 'Vehicle loan for our fleet expansion was sanctioned quickly and the documentation support was excellent. Highly recommend for any business in Ahmedabad.', 5);

INSERT INTO public.team_members (name, designation, bio, sort_order) VALUES
('Karan Joshi', 'Founder & Principal Consultant (CAFC Qualified)', 'Karan founded ARK Finance Consultancy in 2026 with a simple conviction: every financial problem has a solution when it is handled by someone who understands both the numbers and the person behind them. Qualified with deep experience in taxation, investment advisory and so on, he personally reviews client files and leads the firm''s 12-member team.', 1),
('Arun Joshi', 'Head Consultant', 'Arun oversees client operations and ensures every file meets ARK''s quality standards before it leaves the office.', 2);

INSERT INTO public.blog_posts (title, slug, excerpt, content, published_at) VALUES
('Home Loan Checklist for First-Time Buyers in Ahmedabad', 'home-loan-checklist-ahmedabad', 'The documents, credit-score benchmarks and hidden charges to review before you sign a home loan sanction letter in Gujarat.', E'Buying your first home in Ahmedabad is as much a paperwork exercise as it is a financial one. Getting the file right the first time is what separates a two-week sanction from a two-month one.\n\n## Start with your credit profile\nMost lenders price their best rates for scores above 750. Pull your report early, settle any small overdue balances, and avoid opening new credit lines in the three months before you apply.\n\n## Documents to keep ready\nIdentity and address proof, last three years of ITRs or six months of salary slips, six months of bank statements, and the complete chain of property documents including the sale deed and approved plan.\n\n## Look past the headline rate\nProcessing fees, legal and technical charges, insurance bundling and prepayment terms often matter more over a twenty-year tenure than a 0.1% difference in interest. Ask for the full cost sheet in writing.\n\n## Get the file reviewed before submission\nA single mismatched income figure can trigger a rejection that stays on your record. Have a consultant review the file end to end before it reaches the lender.', now() - interval '4 days'),
('GST Return Filing: Deadlines Every Gujarat Business Should Track', 'gst-return-deadlines-gujarat', 'A practical calendar of GSTR-1, GSTR-3B and annual return dates, plus the late-fee arithmetic that catches small businesses out.', E'GST compliance is not complicated, but it is unforgiving about dates. Late fees and interest accumulate quietly and surface as a large number at year end.\n\n## The monthly rhythm\nGSTR-1 for outward supplies, followed by GSTR-3B for summary and payment. Businesses under the QRMP scheme file quarterly but still pay monthly, which is where most confusion arises.\n\n## Reconciliation is the real work\nMatching your purchase register against the auto-populated input credit statement each month prevents credit from lapsing. Doing this annually instead of monthly is how businesses lose genuine input tax credit.\n\n## Annual return and audit\nGSTR-9 consolidates the year. Turnover above the prescribed threshold additionally requires a reconciliation statement, which needs your books closed well before the deadline.\n\n## Build a buffer\nTreat the statutory date as a hard stop and aim to file three days earlier. Portal downtime on the last day is common and is not a valid excuse for a waiver.', now() - interval '11 days'),
('How Much Life Insurance Cover Does Your Family Actually Need?', 'how-much-life-insurance-cover', 'A straightforward method to size your life cover using liabilities, income replacement and future goals instead of guesswork.', E'Most families are either badly under-insured or paying for cover that has no relationship to their actual obligations. A simple calculation fixes both.\n\n## Add up what must be paid off\nOutstanding home loan, vehicle loans, business borrowings and any personal debt. This is the floor of your cover requirement.\n\n## Replace the income\nA common benchmark is ten to fifteen times annual income, adjusted for how many years your dependants would need support and for inflation over that period.\n\n## Fund the fixed goals\nChildren''s higher education and marriage costs, and a corpus that keeps your spouse independent. Estimate these at future values, not today''s prices.\n\n## Subtract existing assets\nDeduct current savings, investments and any employer-provided cover. What remains is the cover you should actually buy, and term insurance is usually the most efficient way to buy it.\n\n## Review it every few years\nA new loan, a new child or a significant income change all move the number. Cover set once and never revisited is rarely still correct.', now() - interval '20 days');