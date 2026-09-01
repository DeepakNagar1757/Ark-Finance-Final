import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, CheckCircle2, Clock, MapPin, Phone } from "lucide-react";
import { SiteLayout, SectionHeading } from "@/components/site/SiteLayout";
import { ServiceCard, TestimonialCard } from "@/components/site/Cards";
import { SITE, whatsappLink } from "@/lib/site";
import { servicesQuery, testimonialsQuery } from "@/lib/queries";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ARK Finance Consultancy | Loans, Tax & Insurance Advisory in Ahmedabad" },
      {
        name: "description",
        content:
          "Ahmedabad-based financial consultancy for home loans, loan against property, LIC & GIC insurance, ITR and GST filing, and investment planning. 1,500+ clients served.",
      },
      { property: "og:title", content: "ARK Finance Consultancy | Ahmedabad, Gujarat" },
      {
        property: "og:description",
        content:
          "Solution to every financial problem — loans, insurance, taxation and investment advisory for families and businesses across Gujarat.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const services = useQuery(servicesQuery);
  const testimonials = useQuery(testimonialsQuery);

  return (
    <SiteLayout>
      <section
        className="relative overflow-hidden bg-primary bg-cover bg-center bg-no-repeat text-primary-foreground"
        style={{ backgroundImage: "url('/Hero-image.png')" }}
      >
        <div className="container-page relative py-20 sm:py-24 lg:py-28">
          <div className="max-w-full md:max-w-[45%]">
            <p className="eyebrow text-accent">Ahmedabad · Gujarat · Est. {SITE.founded}</p>
            <h1 className="mt-5 text-4xl font-semibold leading-[1.08] sm:text-5xl lg:text-6xl">
              Solutions for every <br />
              <span className="text-accent">financial decision.</span>
            </h1>
            <p className="mt-6 max-w-[500px] text-base leading-relaxed text-primary-foreground/80 sm:text-lg">
              ARK Finance Consultancy advises families and businesses on loans, insurance, taxation
              and investments — with a founder-led review on every single file we submit.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-md bg-accent px-6 py-3.5 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90"
              >
                Book Free Consultation
                <ArrowRight className="size-4" aria-hidden />
              </Link>
              <a
                href={whatsappLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-md border border-primary-foreground/30 px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-colors hover:border-accent hover:text-accent"
              >
                WhatsApp us
              </a>
            </div>
            <dl className="mt-12 grid max-w-lg grid-cols-2 gap-6 border-t border-primary-foreground/15 pt-8 sm:grid-cols-4">
              {SITE.stats.map((stat) => (
                <div key={stat.label}>
                  <dt className="sr-only">{stat.label}</dt>
                  <dd className="font-[family-name:var(--font-display)] text-2xl font-semibold text-accent">
                    {stat.value}
                  </dd>
                  <p className="mt-1 text-xs text-primary-foreground/65">{stat.label}</p>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <section className="container-page py-20 sm:py-24">
        <SectionHeading
          eyebrow="WE BUILD YOU NEXT FINANCIAL MOVE"
          title="Four practice areas, one accountable team"
          intro="Whether you need a loan sanction, a return filing, an insurance policy or a growth plan, the work is handled with precision and objectivity, and reviewed thoroughly by experts."
        />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {services.data?.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              titleOverride={service.slug === "tax-consultancy" ? "Qualified CA" : undefined}
            />
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-surface py-20 sm:py-24">
        <div className="container-page">
          <SectionHeading
            eyebrow="How we work"
            title="A three-step process, followed every time"
            align="center"
          />
          <ol className="mt-14 grid gap-8 md:grid-cols-3">
            {SITE.process.map((item) => (
              <li
                key={item.step}
                className="rounded-lg border border-border bg-card p-8 shadow-card"
              >
                <span className="font-[family-name:var(--font-display)] text-4xl font-semibold text-accent">
                  {item.step}
                </span>
                <h3 className="mt-4 text-lg font-semibold text-primary">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="container-page py-20 sm:py-24">
        <div className="max-w-2xl">
          <SectionHeading
            eyebrow="Built on trust"
            title="A young firm with a senior approach"
            intro={`Founded in ${SITE.founded} by ${SITE.founder}, ${SITE.name} has grown to a 12-member team serving more than 1,500 clients across Ahmedabad and Gujarat. We compete on diligence, not on discounts.`}
          />
          <Link
            to="/about"
            className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-primary"
          >
            More about the firm
            <ArrowRight className="size-4 text-accent" aria-hidden />
          </Link>
        </div>
      </section>

      <section className="border-y border-border bg-surface py-20 sm:py-24">
        <div className="container-page">
          <SectionHeading
            eyebrow="Client voices"
            title="What our clients say"
            intro="A few words from business owners, salaried professionals and families we work with."
          />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {testimonials.data?.slice(0, 3).map((item) => (
              <TestimonialCard key={item.id} item={item} />
            ))}
          </div>
          <Link
            to="/testimonials"
            className="mt-10 inline-flex items-center gap-2 text-sm font-semibold text-primary"
          >
            Read all testimonials
            <ArrowRight className="size-4 text-accent" aria-hidden />
          </Link>
        </div>
      </section>

      <section className="container-page py-20 sm:py-24">
        <div className="overflow-hidden rounded-lg bg-primary px-8 py-14 text-primary-foreground sm:px-14">
          <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <p className="eyebrow">Free first consultation</p>
              <h2 className="mt-4 text-2xl font-semibold sm:text-3xl">
                Tell us the problem. We'll tell you the options.
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-primary-foreground/75">
                No pricing pressure and no obligation. Share your requirement and a consultant will
                respond within one working day.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 rounded-md bg-accent px-6 py-3.5 text-sm font-semibold text-accent-foreground"
                >
                Book Free Consultation
                </Link>
                <a
                  href={SITE.phoneHref}
                  className="inline-flex items-center gap-2 py-3.5 text-sm font-semibold text-primary-foreground/80 transition-colors hover:text-accent"
                >
                  <Phone className="size-4 text-accent" aria-hidden />
                  {SITE.phoneDisplay}
                </a>
              </div>
            </div>
            <div className="flex flex-col items-center gap-4">
              <img
                src="/Hero-image.png"
                alt="Financial planning"
                className="w-full max-w-sm opacity-80"
              />
              <ul className="space-y-4 text-sm text-primary-foreground/80">
                <li className="flex gap-3">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
                  <span>
                    {SITE.address.line1}, {SITE.address.area}
                  </span>
                </li>
                <li className="flex gap-3">
                  <Clock className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
                  <span>{SITE.hours}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
