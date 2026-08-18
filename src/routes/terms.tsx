import { createFileRoute } from "@tanstack/react-router";
import { PageHero, SiteLayout } from "@/components/site/SiteLayout";
import { SITE } from "@/lib/site";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service | ARK Finance Consultancy" },
      {
        name: "description",
        content:
          "Terms governing the use of the ARK Finance Consultancy website and the advisory services we provide to clients in Ahmedabad and Gujarat.",
      },
      { property: "og:title", content: "Terms of Service | ARK Finance Consultancy" },
      {
        property: "og:description",
        content: "Draft terms of service for ARK Finance Consultancy, Ahmedabad.",
      },
      { name: "robots", content: "noindex, follow" },
    ],
  }),
  component: Terms,
});

function Terms() {
  return (
    <SiteLayout>
      <PageHero
        eyebrow="Legal"
        title="Terms of Service"
        intro="The basis on which we provide advisory services and on which this website may be used."
      />
      <section className="container-page py-16 sm:py-20">
        <div className="mb-10 rounded-md border border-accent/40 bg-accent/10 p-5 text-sm text-foreground">
          <strong className="font-semibold">Draft for client review.</strong> This is placeholder
          wording prepared for {SITE.name}. Please have it reviewed and approved by your legal
          adviser before the site goes live.
        </div>

        <div className="max-w-3xl space-y-8 text-sm leading-relaxed text-muted-foreground">
          <Block title="1. Scope of services">
            {SITE.name} provides loan advisory, insurance advisory, tax consultancy and financial
            management services. The exact scope of any engagement is confirmed in writing before
            work begins. Nothing on this website constitutes an offer or a guarantee of sanction,
            approval or return.
          </Block>
          <Block title="2. No assured outcomes">
            Loan sanctions, insurance underwriting decisions and statutory assessments rest with the
            respective institution or authority. We commit to diligent preparation and
            representation, not to a specific outcome. Investment values are subject to market risk.
          </Block>
          <Block title="3. Client responsibilities">
            You agree to provide accurate, complete and timely information and documents. We are not
            responsible for consequences arising from information that is incorrect, incomplete or
            withheld.
          </Block>
          <Block title="4. Fees">
            Fees are quoted case by case after a requirement analysis and confirmed before work
            begins. No fee is charged for an initial consultation. Third-party charges levied by
            lenders, insurers or departments are separate.
          </Block>
          <Block title="5. Website content">
            Articles and guides on this website are general information, not personalised advice.
            Please consult us about your specific circumstances before acting on anything you read
            here.
          </Block>
          <Block title="6. Governing law">
            These terms are governed by the laws of India, and the courts at Ahmedabad, Gujarat have
            exclusive jurisdiction over any dispute arising from them.
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
