import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageHero, SiteLayout } from "@/components/site/SiteLayout";
import { TeamCard } from "@/components/site/Cards";
import { teamQuery } from "@/lib/queries";

export const Route = createFileRoute("/team")({
  head: () => ({
    meta: [
      { title: "Our Team | ARK Finance Consultancy, Ahmedabad" },
      {
        name: "description",
        content:
          "Meet the 12-member ARK Finance Consultancy team — lending, taxation, insurance and client servicing specialists based in Vastral, Ahmedabad.",
      },
      { property: "og:title", content: "Our Team | ARK Finance Consultancy" },
      {
        property: "og:description",
        content: "The specialists behind every loan file, tax return and policy we handle.",
      },
    ],
  }),
  component: Team,
});

function Team() {
  const team = useQuery(teamQuery);

  return (
    <SiteLayout>
      <PageHero
        eyebrow="Our team"
        title="Twelve people, one standard of work"
        intro="Each file is owned by a named specialist and reviewed by the founder before it leaves our office."
      />
      <section className="container-page py-20 sm:py-24">
        {team.isLoading && <p className="text-sm text-muted-foreground">Loading team…</p>}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {team.data
            ?.filter((m) => ["Karan Joshi", "Arun Joshi"].includes(m.name))
            .map((member) => (
              <TeamCard key={member.id} member={member} />
            ))}
        </div>
      </section>
    </SiteLayout>
  );
}
