#!/usr/bin/env node
/**
 * ARK Finance Consultancy — idempotent content seed.
 * Seeds/verifies the current live copy into the CMS tables so the public
 * site renders byte-identically once it reads from the CMS.
 *
 * Usage (needs the service-role key — NEVER run with a public key):
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/seed.mjs
 */
import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY first.");
  process.exit(1);
}

const supabase = createClient(url, key);

const CONFLICT_NOTE =
  "Seed flags — do NOT apply without client confirmation: (1) Address was '302, RM Arcade' on an " +
  "earlier build vs '203, RM Arcade' now live; 203 is seeded pending confirmation. " +
  "(2) Hours were 'Monday – Sunday, 9:00 AM – 9:00 PM' vs 'Monday – Saturday, 10:00 AM – 7:00 PM'; " +
  "Mon–Sat 10–7 is seeded pending confirmation.";

const settings = {
  id: true,
  firm_name: "ARK Finance Consultancy",
  short_name: "ARK Finance",
  tagline: "Solution to every financial problem",
  logo_url: "/ark-logo.png",
  phone: "+91 63513 77101",
  phone_href: "tel:+916351377101",
  whatsapp_number: "916351377101",
  whatsapp_message: "Hello ARK Finance, I would like a consultation.",
  public_email: "arkfinance211@gmail.com",
  address_line1: "203, RM Arcade",
  address_line2: "near Karnavati Cross Road, Takshshila School Road",
  address_area: "Vastral, Ahmedabad",
  address_region: "Gujarat, India",
  maps_link: "",
  office_hours: "Monday – Saturday, 10:00 AM – 7:00 PM",
  established_year: 2026,
  footer_blurb:
    "Solution to every financial problem. Loan financing, insurance, taxation and investment " +
    "advisory for families and businesses across Ahmedabad and Gujarat.",
  footer_copyright: "All rights reserved.",
  founder_name: "Karan Joshi",
  founder_title: "Founder & Principal Consultant",
  social_links: {},
  notes: CONFLICT_NOTE,
};

const sections = [
  // Home
  { page: "home", section_key: "hero_eyebrow", eyebrow: "Ahmedabad · Gujarat · Est. 2026" },
  { page: "home", section_key: "hero_heading", heading: "Solutions for every " },
  { page: "home", section_key: "hero_heading_accent", heading: "financial decision." },
  {
    page: "home",
    section_key: "hero_intro",
    intro:
      "ARK Finance Consultancy advises families and businesses on loans, insurance, taxation and investments — with a founder-led review on every single file we submit.",
  },
  { page: "home", section_key: "cta_primary", cta_label: "Book Free Consultation", cta_target: "/contact" },
  { page: "home", section_key: "cta_secondary", cta_label: "WhatsApp us", cta_target: "" },
  {
    page: "home",
    section_key: "services",
    eyebrow: "WE BUILD YOU NEXT FINANCIAL MOVE",
    heading: "Four practice areas, one accountable team",
    intro:
      "Whether you need a loan sanction, a return filing, an insurance policy or a growth plan, the work is handled with precision and objectivity, and reviewed thoroughly by experts.",
    sort_order: 1,
  },
  {
    page: "home",
    section_key: "process",
    eyebrow: "How we work",
    heading: "A three-step process, followed every time",
    body: "",
    sort_order: 2,
  },
  {
    page: "home",
    section_key: "trust",
    eyebrow: "Built on trust",
    heading: "A young firm with a senior approach",
    intro:
      "Founded in 2026 by Karan Joshi, ARK Finance Consultancy has grown to a 12-member team serving more than 1,500 clients across Ahmedabad and Gujarat. We compete on diligence, not on discounts.",
    sort_order: 3,
  },
  {
    page: "home",
    section_key: "testimonials",
    eyebrow: "Client voices",
    heading: "What our clients say",
    intro: "A few words from business owners, salaried professionals and families we work with.",
    sort_order: 4,
  },
  {
    page: "home",
    section_key: "cta_quote",
    eyebrow: "Free first consultation",
    heading: "Tell us the problem. We'll tell you the options.",
    intro:
      "No pricing pressure and no obligation. Share your requirement and a consultant will respond within one working day.",
    sort_order: 5,
  },
  // About
  {
    page: "about",
    section_key: "hero",
    eyebrow: "About us",
    heading: "A consultancy built to remove financial guesswork",
    intro:
      "ARK Finance Consultancy was founded in 2026 in Vastral, Ahmedabad, on the belief that most financial problems are not complicated — they are simply badly explained.",
  },
  {
    page: "about",
    section_key: "story",
    eyebrow: "Our story",
    heading: "From one desk to a 12-member team",
    body:
      "ARK Finance Consultancy began with a handful of clients who needed a loan file cleaned up and a tax return filed properly. Word travelled quickly. Within a short span the practice grew into four connected service lines — taxation, investment advisory, lending and insurance — because clients kept asking for the next step rather than the next vendor.\n\n" +
      "Today a team of twelve works out of our Vastral office, and more than 1,500 clients have trusted us with a sanction, a filing, a policy or a plan. What has not changed is the working method: understand the requirement first, prepare the file properly, then go to market.\n\n" +
      "We are deliberately based in the neighbourhood we serve. Clients walk in, sit down and leave with a clear next step — not a brochure.",
  },
  {
    page: "about",
    section_key: "mission",
    eyebrow: "Our mission",
    heading: "",
    intro:
      "“To be the single, trustworthy point of contact for every financial decision our clients make — and to make sure they understand each one before they sign.”",
  },
  // Services
  {
    page: "services",
    section_key: "hero",
    eyebrow: "Services",
    heading: "Financial services, handled end to end",
    intro:
      "Every engagement follows the same three steps — requirement analysis, document gathering, deal close.",
  },
  {
    page: "services",
    section_key: "quote",
    eyebrow: "Get a quote",
    heading: "Which service do you need?",
    intro:
      "Send us the details and a consultant will respond within one working day. Office hours: {office_hours}.",
  },
  // Testimonials
  {
    page: "testimonials",
    section_key: "hero",
    eyebrow: "Testimonials",
    heading: "Trusted by more than 1,500 clients",
    intro: "Referrals are how this practice grew. Here is what clients say in their own words.",
  },
  {
    page: "testimonials",
    section_key: "cta",
    heading: "Ready to be our next success story?",
    intro: "Share your requirement and we'll come back with clear options — no pricing pressure.",
  },
  // Contact
  {
    page: "contact",
    section_key: "hero",
    eyebrow: "Contact",
    heading: "Let's talk about your requirement",
    intro:
      "Call, WhatsApp, or send the form below. A consultant replies within one working day — usually the same day.",
  },
  { page: "contact", section_key: "office_heading", heading: "Office" },
];

const stats = [
  { value: "12", label: "Team members", sort_order: 1 },
  { value: "1,500+", label: "Clients served", sort_order: 2 },
  { value: "4", label: "Practice areas", sort_order: 3 },
  { value: "100%", label: "Founder-reviewed files", sort_order: 4 },
];

const processSteps = [
  {
    step: "01",
    title: "Requirement Analysis",
    body:
      "We start by understanding your goal, timelines and constraints — not by pitching a product. Every engagement begins with a structured conversation.",
    sort_order: 1,
  },
  {
    step: "02",
    title: "Document Gathering",
    body:
      "Our team prepares a complete, lender-ready or filing-ready file, checks it for inconsistencies and handles the follow-ups on your behalf.",
    sort_order: 2,
  },
  {
    step: "03",
    title: "Finalization and support",
    body:
      "We negotiate terms, close the sanction or filing, and stay available afterwards for renewals, disbursements and compliance.",
    sort_order: 3,
  },
];

const serviceMedia = {
  "loan-financing": {
    image_url: "/services/loan-financing.webp",
    image_alt: "Indian professional reviewing financial documents in an office",
    icon: "Landmark",
  },
  "insurance-services": {
    image_url: "/services/insurance-services.webp",
    image_alt: "Indian consultants discussing documents at an office desk",
    icon: "ShieldCheck",
  },
  "tax-consultancy": {
    image_url: "/services/tax-consultancy.webp",
    image_alt: "Indian professional analyzing financial charts and reports",
    icon: "FileText",
  },
  "financial-management": {
    image_url: "/services/financial-management.webp",
    image_alt: "Indian business team collaborating in an office meeting",
    icon: "TrendingUp",
  },
};

const team = [
  {
    name: "Karan Joshi",
    designation: "Founder & Principal Consultant",
    credential: "Founder & Principal Consultant (CAFC Qualified)",
    specialization: "Lending, taxation and investment advisory",
    is_founder: true,
    photo_url: "/karan-joshi.png",
    bio:
      "Karan Joshi is CAFC Qualified by ICAI. He oversees client operations and ensures every file meets ARK's quality standards, drawing on deep experience in lending, taxation and investment advisory. He personally reviews client files and leads the firm's 12-member team.\n\n" +
      "Karan's approach is unglamorous by design: read the file, check the arithmetic, ask the awkward question before the lender or the department does. It is the reason ARK's submissions clear underwriting and assessment with fewer queries than the market average.",
    sort_order: 1,
  },
  {
    name: "Arun Joshi",
    designation: "Head Consultant",
    credential: "",
    specialization: "Lending and client servicing",
    is_founder: false,
    photo_url: "/arun-joshi.jpeg",
    bio:
      "Arun oversees client operations and ensures every file meets ARK's quality standards before it leaves the office. With a strong background in lending and client servicing, he works closely with borrowers to structure files that clear underwriting on the first submission.\n\n" +
      "His attention to detail and hands-on approach have made him a trusted point of contact for clients across Ahmedabad and Gujarat.",
    sort_order: 2,
  },
];

const testimonials = [
  {
    name: "Rakesh Patel",
    designation: "Proprietor",
    company: "Patel Trading Co.",
    quote:
      "ARK arranged our project loan in under three weeks after two banks had already turned us down. Karan personally reworked the file. Genuinely professional team.",
    rating: 5,
    service_tag: "Loan Financing",
    is_featured: true,
    sort_order: 1,
  },
  {
    name: "Nisha Shah",
    designation: "Senior Engineer",
    company: "Infotech Solutions",
    quote:
      "My home loan paperwork was handled end to end and I got a rate almost half a percent lower than what my own bank offered. Zero follow-up stress.",
    rating: 5,
    service_tag: "Loan Financing",
    is_featured: true,
    sort_order: 2,
  },
  {
    name: "Mehul Desai",
    designation: "Director",
    company: "Desai Textiles Pvt. Ltd.",
    quote:
      "GST returns and annual filings have been faultless for the last two years. Their tax planning advice alone saved us more than their fee.",
    rating: 5,
    service_tag: "Tax Consultancy",
    is_featured: true,
    sort_order: 3,
  },
  {
    name: "Priya Trivedi",
    designation: "Homemaker",
    company: "Vastral, Ahmedabad",
    quote:
      "They explained every insurance option in plain Gujarati and English until I was comfortable. Never once pushed a product I did not need.",
    rating: 5,
    service_tag: "Insurance Services",
    is_featured: false,
    sort_order: 4,
  },
  {
    name: "Jignesh Barot",
    designation: "Owner",
    company: "Barot Automobiles",
    quote:
      "Vehicle loan for our fleet expansion was sanctioned quickly and the documentation support was excellent. Highly recommend for any business in Ahmedabad.",
    rating: 5,
    service_tag: "Loan Financing",
    is_featured: false,
    sort_order: 5,
  },
];

const seoMeta = [
  {
    route: "/",
    title: "ARK Finance Consultancy | Loans, Tax & Insurance Advisory in Ahmedabad",
    description:
      "Ahmedabad-based financial consultancy for home loans, loan against property, LIC & GIC insurance, ITR and GST filing, and investment planning. 1,500+ clients served.",
    robots: "index, follow",
  },
  {
    route: "/about",
    title: "About ARK Finance Consultancy | Financial Advisors in Ahmedabad",
    description:
      "Founded in 2026 by Karan Joshi (CAFC Qualified), ARK Finance Consultancy is a 12-member financial advisory firm in Vastral, Ahmedabad serving 1,500+ clients across Gujarat.",
    robots: "index, follow",
  },
  {
    route: "/services",
    title: "Services | Loans, Insurance, Tax & Investment Advisory in Ahmedabad",
    description:
      "Home loans, loan against property, project and vehicle loans, LIC & GIC insurance, ITR and GST filing, and investment planning from ARK Finance Consultancy, Ahmedabad.",
    robots: "index, follow",
  },
  {
    route: "/testimonials",
    title: "Client Testimonials | ARK Finance Consultancy, Ahmedabad",
    description:
      "Read what business owners, professionals and families in Ahmedabad say about working with ARK Finance Consultancy on loans, tax and insurance.",
    robots: "index, follow",
  },
  {
    route: "/blog",
    title: "Financial Insights & Articles | ARK Finance Consultancy",
    description:
      "Practical articles on home loans, GST and ITR deadlines, insurance cover and investment planning, written for clients in Ahmedabad and Gujarat.",
    robots: "index, follow",
  },
  {
    route: "/contact",
    title: "Contact ARK Finance Consultancy | Vastral, Ahmedabad",
    description:
      "Visit our office at 203, RM Arcade, near Karnavati Cross Road, Takshshila School Road, Vastral, Ahmedabad. Call +91 63513 77101 or WhatsApp us, Monday to Saturday, 10 AM to 7 PM.",
    robots: "index, follow",
  },
  {
    route: "/privacy",
    title: "Privacy Policy | ARK Finance Consultancy",
    description:
      "How ARK Finance Consultancy collects, uses and protects the personal and financial information shared by clients and website visitors.",
    robots: "noindex, follow",
  },
  {
    route: "/terms",
    title: "Terms of Service | ARK Finance Consultancy",
    description:
      "Terms governing the use of the ARK Finance Consultancy website and the advisory services we provide to clients in Ahmedabad and Gujarat.",
    robots: "noindex, follow",
  },
];

const legalPages = [
  {
    slug: "privacy",
    title: "Privacy Policy",
    intro: "How we handle the information you share with us.",
    body:
      "## 1. Information we collect\n" +
      "When you submit an enquiry, subscribe to our newsletter or engage us for a service, we collect the details you provide — typically your name, email address, phone number, the service you are interested in and any message you send. For active engagements we also collect the financial and identity documents required for that specific service.\n" +
      "## 2. How we use your information\n" +
      "Your information is used to respond to your enquiry, prepare and submit applications or filings on your instruction, and keep you informed about your ongoing matter. With your consent we may also send occasional financial updates, which you can stop at any time.\n" +
      "## 3. Sharing with third parties\n" +
      "We share documents with banks, NBFCs, insurers and statutory departments only to the extent required to complete the service you have engaged us for. We do not sell or rent your personal information to anyone.\n" +
      "## 4. Data security and retention\n" +
      "Client records are stored with access limited to the team members working on your matter. Records are retained for the period required under applicable Indian law and professional standards, and securely disposed of thereafter.\n" +
      "## 5. Your choices\n" +
      "You may request a copy of the information we hold about you, ask us to correct it, or withdraw consent for marketing communication by writing to {public_email}.\n" +
      "## 6. Contact\n" +
      "Questions about this policy can be sent to {public_email} or raised at our office: {address_line1}, {address_line2}, {address_area}, {address_region}.",
  },
  {
    slug: "terms",
    title: "Terms of Service",
    intro: "The basis on which we provide advisory services and on which this website may be used.",
    body:
      "## 1. Scope of services\n" +
      "{firm_name} provides loan advisory, insurance advisory, tax consultancy and financial management services. The exact scope of any engagement is confirmed in writing before work begins. Nothing on this website constitutes an offer or a guarantee of sanction, approval or return.\n" +
      "## 2. No assured outcomes\n" +
      "Loan sanctions, insurance underwriting decisions and statutory assessments rest with the respective institution or authority. We commit to diligent preparation and representation, not to a specific outcome. Investment values are subject to market risk.\n" +
      "## 3. Client responsibilities\n" +
      "You agree to provide accurate, complete and timely information and documents. We are not responsible for consequences arising from information that is incorrect, incomplete or withheld.\n" +
      "## 4. Fees\n" +
      "Fees are quoted case by case after a requirement analysis and confirmed before work begins. No fee is charged for an initial consultation. Third-party charges levied by lenders, insurers or departments are separate.\n" +
      "## 5. Website content\n" +
      "Articles and guides on this website are general information, not personalised advice. Please consult us about your specific circumstances before acting on anything you read here.\n" +
      "## 6. Governing law\n" +
      "These terms are governed by the laws of India, and the courts at Ahmedabad, Gujarat have exclusive jurisdiction over any dispute arising from them.",
  },
];

async function upsertByKey(table, rows, keyFn) {
  for (const row of rows) {
    const key = keyFn(row);
    const { data: existing } = await supabase.from(table).select("id").eq(key.field, key.value).maybeSingle();
    if (existing) {
      const { error } = await supabase.from(table).update(row).eq("id", existing.id);
      if (error) throw new Error(`${table} update: ${error.message}`);
      console.log(`updated ${table} ${key.value}`);
    } else {
      const { error } = await supabase.from(table).insert(row);
      if (error) throw new Error(`${table} insert: ${error.message}`);
      console.log(`inserted ${table} ${key.value}`);
    }
  }
}

async function main() {
  // singleton settings
  const { data: existing } = await supabase.from("site_settings").select("id").eq("id", true).maybeSingle();
  if (existing) {
    await supabase.from("site_settings").update(settings).eq("id", true);
  } else {
    await supabase.from("site_settings").insert(settings);
  }
  console.log("site_settings synced");

  // page_sections are unique on (page, section_key) — key on both.
  for (const s of sections) {
    const { data: e } = await supabase
      .from("page_sections")
      .select("id")
      .eq("page", s.page)
      .eq("section_key", s.section_key)
      .maybeSingle();
    if (e) await supabase.from("page_sections").update(s).eq("id", e.id);
    else await supabase.from("page_sections").insert(s);
  }
  console.log("page_sections synced");

  for (const s of stats) {
    const { data: e } = await supabase.from("stats").select("id").eq("label", s.label).maybeSingle();
    if (e) await supabase.from("stats").update(s).eq("id", e.id);
    else await supabase.from("stats").insert(s);
  }
  console.log("stats synced");

  for (const p of processSteps) {
    const { data: e } = await supabase.from("process_steps").select("id").eq("title", p.title).maybeSingle();
    if (e) await supabase.from("process_steps").update(p).eq("id", e.id);
    else await supabase.from("process_steps").insert(p);
  }
  console.log("process_steps synced");

  // services: attach media columns by slug (title/summary/desc already seeded by migration)
  for (const [slug, media] of Object.entries(serviceMedia)) {
    const { data: e } = await supabase.from("services").select("id").eq("slug", slug).maybeSingle();
    if (e) await supabase.from("services").update({ ...media }).eq("id", e.id);
    else console.warn(`Service '${slug}' missing — run the 20260806 migrations first or add manually.`);
  }
  console.log("services media synced");

  for (const t of team) {
    const { data: e } = await supabase.from("team_members").select("id").eq("name", t.name).maybeSingle();
    if (e) await supabase.from("team_members").update(t).eq("id", e.id);
    else await supabase.from("team_members").insert(t);
  }
  console.log("team synced");

  for (const t of testimonials) {
    const { data: e } = await supabase.from("testimonials").select("id").eq("name", t.name).maybeSingle();
    if (e) await supabase.from("testimonials").update(t).eq("id", e.id);
    else await supabase.from("testimonials").insert(t);
  }
  console.log("testimonials synced");

  // blog posts: mark existing as published + set seo fields
  const { data: posts } = await supabase.from("blog_posts").select("id, title, excerpt");
  for (const p of posts ?? []) {
    await supabase
      .from("blog_posts")
      .update({ status: "published", is_published: true, seo_title: p.title, seo_description: p.excerpt })
      .eq("id", p.id);
  }
  console.log("blog_posts synced", posts?.length ?? 0);

  await upsertByKey("seo_meta", seoMeta, (r) => ({ field: "route", value: r.route }));

  for (const l of legalPages) {
    const { data: e } = await supabase.from("legal_pages").select("id").eq("slug", l.slug).maybeSingle();
    if (e) await supabase.from("legal_pages").update(l).eq("id", e.id);
    else await supabase.from("legal_pages").insert(l);
  }
  console.log("legal_pages synced");

  console.log("\nSeed complete. First admin: create via ADMIN_SETUP_TOKEN flow or scripts/create-admin.mjs");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});