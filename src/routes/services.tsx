import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Check, FileText, Landmark, ShieldCheck, TrendingUp } from "lucide-react";
import { PageHero, SectionHeading, SiteLayout } from "@/components/site/SiteLayout";
import { LeadForm } from "@/components/site/LeadForm";
import { SITE } from "@/lib/site";
import { servicesQuery } from "@/lib/queries";

const ICONS = { Landmark, ShieldCheck, FileText, TrendingUp } as const;

const SERVICE_IMAGES: Record<string, { src: string; alt: string }> = {
  "loan-financing": {
    src: "/services/loan-financing.webp",
    alt: "Indian professional reviewing financial documents in an office",
  },
  "insurance-services": {
    src: "/services/insurance-services.webp",
    alt: "Indian consultants discussing documents at an office desk",
  },
  "tax-consultancy": {
    src: "/services/tax-consultancy.webp",
    alt: "Indian professional analyzing financial charts and reports",
  },
  "financial-management": {
    src: "/services/financial-management.webp",
    alt: "Indian business team collaborating in an office meeting",
  },
};

const EXTRA_FEATURES: Record<string, string[]> = {
  "tax-consultancy": ["Audit services"],
};

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services | Loans, Insurance, Tax & Investment Advisory in Ahmedabad" },
      {
        name: "description",
        content:
          "Home loans, loan against property, project and vehicle loans, LIC & GIC insurance, ITR and GST filing, and investment planning from ARK Finance Consultancy, Ahmedabad.",
      },
      { property: "og:title", content: "Our Services | ARK Finance Consultancy" },
      {
        property: "og:description",
        content:
          "Four practice areas covering lending, insurance, taxation and investment planning for clients across Gujarat.",
      },
    ],
  }),
  component: Services,
});

function Services() {
  const services = useQuery(servicesQuery);

  return (
    <SiteLayout>
      <PageHero
        eyebrow="Services"
        title="Financial services, handled end to end"
        intro="Every engagement follows the same three steps — requirement analysis, document gathering, deal close."
      />

      <nav aria-label="Service sections" className="border-b border-border bg-surface">
        <div className="container-page flex flex-wrap gap-x-6 gap-y-2 py-4 text-sm">
          {services.data?.map((service) => (
            <a
              key={service.id}
              href={`#${service.slug}`}
              className="font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              {service.title}
            </a>
          ))}
        </div>
      </nav>

      <div className="container-page py-20 sm:py-24">
        <div className="space-y-20">
          {services.data?.map((service, index) => {
            const Icon = ICONS[service.icon as keyof typeof ICONS] ?? Landmark;
            return (
              <section
                key={service.id}
                id={service.slug}
                className="scroll-mt-28 grid gap-10 lg:grid-cols-[0.9fr_1.1fr]"
              >
                <div>
                  {SERVICE_IMAGES[service.slug] ? (
                    <div className="relative overflow-hidden rounded-lg">
                      <img
                        src={SERVICE_IMAGES[service.slug].src}
                        alt={SERVICE_IMAGES[service.slug].alt}
                        className="w-full min-h-[300px] max-h-[420px] object-cover object-bottom"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent" />
                      <span className="absolute left-3 top-3 inline-flex size-10 items-center justify-center rounded-md bg-background/90 text-primary shadow-sm backdrop-blur-sm">
                        <Icon className="size-5" aria-hidden />
                      </span>
                    </div>
                  ) : (
                    <span className="inline-flex size-14 items-center justify-center rounded-md bg-primary text-primary-foreground">
                      <Icon className="size-7" aria-hidden />
                    </span>
                  )}
                  <p className="eyebrow mt-6">0{index + 1} — Practice area</p>
                  <h2 className="mt-3 text-2xl font-semibold text-primary sm:text-3xl">
                    {service.title}
                  </h2>
                  <span className="gold-rule mt-5" />
                  <p className="mt-5 text-base leading-relaxed text-muted-foreground">
                    {service.summary}
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-card p-8 shadow-card">
                  <p className="text-base leading-relaxed text-foreground">{service.description}</p>
                  {service.features.length > 0 && (
                    <ul className="mt-7 grid gap-3 sm:grid-cols-2">
                      {[...service.features, ...(EXTRA_FEATURES[service.slug] ?? [])].map((feature) => (
                        <li key={feature} className="flex gap-2.5 text-sm text-muted-foreground">
                          <Check className="mt-0.5 size-4 shrink-0 text-teal" aria-hidden />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  <a
                    href="#enquiry"
                    className="mt-8 inline-flex rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-light"
                  >
                    Book Free Consultation
                  </a>
                </div>
              </section>
            );
          })}
        </div>
      </div>

      <section
        id="enquiry"
        className="scroll-mt-24 border-t border-border bg-surface py-20 sm:py-24"
      >
        <div className="container-page grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <SectionHeading
            eyebrow="Get a quote"
            title="Which service do you need?"
            intro={`Send us the details and a consultant will respond within one working day. Office hours: ${SITE.hours}.`}
          />
          <LeadForm />
        </div>
      </section>
    </SiteLayout>
  );
}
