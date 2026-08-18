import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { PageHero, SectionHeading, SiteLayout } from "@/components/site/SiteLayout";
import { StatBlock, TeamCard } from "@/components/site/Cards";
import { SITE } from "@/lib/site";
import { teamQuery } from "@/lib/queries";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About ARK Finance Consultancy | Financial Advisors in Ahmedabad" },
      {
        name: "description",
        content:
          "Founded in 2026 by Karan Joshi (CAFC Qualified), ARK Finance Consultancy is a 12-member financial advisory firm in Vastral, Ahmedabad serving 1,500+ clients across Gujarat.",
      },
      { property: "og:title", content: "About ARK Finance Consultancy" },
      {
        property: "og:description",
        content:
          "Our story, mission and the founder-led team behind ARK Finance Consultancy in Ahmedabad.",
      },
    ],
  }),
  component: About,
});

function About() {
  const team = useQuery(teamQuery);
  const founder = team.data?.[0];

  return (
    <SiteLayout>
      <PageHero
        eyebrow="About us"
        title="A consultancy built to remove financial guesswork"
        intro={`${SITE.name} was founded in ${SITE.founded} in Vastral, Ahmedabad, on the belief that most financial problems are not complicated — they are simply badly explained.`}
      />

      <section className="container-page py-20 sm:py-24">
        <div className="grid gap-14 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-6 text-base leading-relaxed text-muted-foreground">
            <SectionHeading eyebrow="Our story" title="From one desk to a 12-member team" />
            <p>
              ARK Finance Consultancy began with a handful of clients who needed a loan file cleaned
              up and a tax return filed properly. Word travelled quickly. Within a short span the
              practice grew into four connected service lines — taxation, investment advisory,
              lending and insurance — because clients kept asking for the next step rather than the
              next vendor.
            </p>
            <p>
              Today a team of twelve works out of our Vastral office, and more than 1,500 clients
              have trusted us with a sanction, a filing, a policy or a plan. What has not changed is
              the working method: understand the requirement first, prepare the file properly, then
              go to market.
            </p>
            <p>
              We are deliberately based in the neighbourhood we serve. Clients walk in, sit down and
              leave with a clear next step — not a brochure.
            </p>
          </div>

          <aside className="rounded-lg border border-border bg-surface p-8">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-accent">
              Our mission
            </h2>
            <p className="mt-5 font-[family-name:var(--font-display)] text-xl leading-snug text-primary">
              “To be the single, trustworthy point of contact for every financial decision our
              clients make — and to make sure they understand each one before they sign.”
            </p>
            <div className="mt-8 space-y-6 border-t border-border pt-8">
              {SITE.stats.slice(0, 2).map((stat) => (
                <StatBlock key={stat.label} value={stat.value} label={stat.label} />
              ))}
            </div>
          </aside>
        </div>
      </section>

      <section className="border-y border-border bg-surface py-20 sm:py-24">
        <div className="container-page grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div className="space-y-6">
            <SectionHeading eyebrow="The founder" title={`${SITE.founder}`} />
            <img
              src="/karan-joshi.png"
              alt="Karan Joshi, Founder & Principal Consultant"
              className="w-full max-w-xs rounded-lg object-cover object-top shadow-card"
              width={320}
              height={400}
            />
          </div>
          <div className="space-y-5 text-base leading-relaxed text-muted-foreground">
            <p className="text-xs font-semibold uppercase tracking-wider text-accent">
              {SITE.founderTitle}
            </p>
            <p>{founder?.bio}</p>
            <p>
              Karan's approach is unglamorous by design: read the file, check the arithmetic, ask
              the awkward question before the lender or the department does. It is the reason ARK's
              submissions clear underwriting and assessment with fewer queries than the market
              average.
            </p>
          </div>
        </div>
      </section>

      <section className="container-page py-20 sm:py-24">
        <SectionHeading
          eyebrow="Our people"
          title="The team behind every file"
          intro="Specialists across lending, taxation, insurance and client servicing."
        />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {team.data
            ?.filter((m) => ["Karan Joshi", "Arun Joshi"].includes(m.name))
            .slice(0, 3)
            .map((member) => (
              <TeamCard key={member.id} member={member} />
            ))}
        </div>
        <Link
          to="/team"
          className="mt-10 inline-flex items-center gap-2 text-sm font-semibold text-primary"
        >
          Meet the full team
          <ArrowRight className="size-4 text-accent" aria-hidden />
        </Link>
      </section>
    </SiteLayout>
  );
}
