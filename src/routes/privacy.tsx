import { createFileRoute } from "@tanstack/react-router";
import { PageHero, SiteLayout } from "@/components/site/SiteLayout";
import { SITE } from "@/lib/site";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy | ARK Finance Consultancy" },
      {
        name: "description",
        content:
          "How ARK Finance Consultancy collects, uses and protects the personal and financial information shared by clients and website visitors.",
      },
      { property: "og:title", content: "Privacy Policy | ARK Finance Consultancy" },
      {
        property: "og:description",
        content: "Draft privacy policy for ARK Finance Consultancy, Ahmedabad.",
      },
      { name: "robots", content: "noindex, follow" },
    ],
  }),
  component: Privacy,
});

function Privacy() {
  return (
    <SiteLayout>
      <PageHero
        eyebrow="Legal"
        title="Privacy Policy"
        intro="How we handle the information you share with us."
      />
      <section className="container-page py-16 sm:py-20">
        <div className="mb-10 rounded-md border border-accent/40 bg-accent/10 p-5 text-sm text-foreground">
          <strong className="font-semibold">Draft for client review.</strong> This is placeholder
          wording prepared for {SITE.name}. Please have it reviewed and approved by your legal
          adviser before the site goes live.
        </div>

        <div className="max-w-3xl space-y-8 text-sm leading-relaxed text-muted-foreground">
          <Block title="1. Information we collect">
            When you submit an enquiry, subscribe to our newsletter or engage us for a service, we
            collect the details you provide — typically your name, email address, phone number, the
            service you are interested in and any message you send. For active engagements we also
            collect the financial and identity documents required for that specific service.
          </Block>
          <Block title="2. How we use your information">
            Your information is used to respond to your enquiry, prepare and submit applications or
            filings on your instruction, and keep you informed about your ongoing matter. With your
            consent we may also send occasional financial updates, which you can stop at any time.
          </Block>
          <Block title="3. Sharing with third parties">
            We share documents with banks, NBFCs, insurers and statutory departments only to the
            extent required to complete the service you have engaged us for. We do not sell or rent
            your personal information to anyone.
          </Block>
          <Block title="4. Data security and retention">
            Client records are stored with access limited to the team members working on your
            matter. Records are retained for the period required under applicable Indian law and
            professional standards, and securely disposed of thereafter.
          </Block>
          <Block title="5. Your choices">
            You may request a copy of the information we hold about you, ask us to correct it, or
            withdraw consent for marketing communication by writing to {SITE.email}.
          </Block>
          <Block title="6. Contact">
            Questions about this policy can be sent to {SITE.email} or raised at our office:{" "}
            {SITE.address.line1}, {SITE.address.line2}, {SITE.address.area}, {SITE.address.region}.
          </Block>
        </div>
      </section>
    </SiteLayout>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-primary">{title}</h2>
      <p className="mt-3">{children}</p>
    </div>
  );
}
