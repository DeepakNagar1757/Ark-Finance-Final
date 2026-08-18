import { createFileRoute } from "@tanstack/react-router";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { PageHero, SiteLayout } from "@/components/site/SiteLayout";
import { LeadForm } from "@/components/site/LeadForm";
import { SITE, whatsappLink } from "@/lib/site";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact ARK Finance Consultancy | Vastral, Ahmedabad" },
      {
        name: "description",
        content:
          "Visit our office at 302, RM Arcade, near Karnavati Cross Road, Vastral, Ahmedabad. Call +91 63513 77101 or WhatsApp us, 9 AM to 9 PM, seven days a week.",
      },
      { property: "og:title", content: "Contact ARK Finance Consultancy, Ahmedabad" },
      {
        property: "og:description",
        content: "Enquiry form, phone, WhatsApp and office address for ARK Finance Consultancy.",
      },
    ],
  }),
  component: Contact,
});

function Contact() {
  const mapQuery = encodeURIComponent(
    `${SITE.address.line1}, ${SITE.address.line2}, ${SITE.address.area}, ${SITE.address.region}`,
  );

  return (
    <SiteLayout>
      <PageHero
        eyebrow="Contact"
        title="Let's talk about your requirement"
        intro="Call, WhatsApp, or send the form below. A consultant replies within one working day — usually the same day."
      />

      <section className="container-page py-20 sm:py-24">
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <div className="space-y-8">
            <div className="rounded-lg border border-border bg-card p-7 shadow-card">
              <h2 className="text-lg font-semibold text-primary">Office</h2>
              <address className="mt-5 space-y-4 text-sm not-italic text-muted-foreground">
                <p className="flex gap-3">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
                  <span>
                    {SITE.address.line1}
                    <br />
                    {SITE.address.line2}
                    <br />
                    {SITE.address.area}
                    <br />
                    {SITE.address.region}
                  </span>
                </p>
                <p className="flex gap-3">
                  <Phone className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
                  <a href={SITE.phoneHref} className="font-semibold text-primary">
                    {SITE.phoneDisplay}
                  </a>
                </p>
                <p className="flex gap-3">
                  <MessageCircle className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
                  <a
                    href={whatsappLink()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-primary"
                  >
                    Chat on WhatsApp
                  </a>
                </p>
                <p className="flex gap-3">
                  <Mail className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
                  <a href={`mailto:${SITE.email}`} className="font-semibold text-primary">
                    {SITE.email}
                  </a>
                </p>
                <p className="flex gap-3">
                  <Clock className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
                  <span>{SITE.hours}</span>
                </p>
              </address>
            </div>

            <div className="overflow-hidden rounded-lg border border-border shadow-card">
              <iframe
                title="ARK Finance Consultancy office location"
                src={`https://www.google.com/maps?q=${mapQuery}&output=embed`}
                className="h-72 w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

          <div id="enquiry">
            <LeadForm />
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
