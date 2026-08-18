import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageHero, SiteLayout } from "@/components/site/SiteLayout";
import { TestimonialCard } from "@/components/site/Cards";
import { testimonialsQuery } from "@/lib/queries";

export const Route = createFileRoute("/testimonials")({
  head: () => ({
    meta: [
      { title: "Client Testimonials | ARK Finance Consultancy, Ahmedabad" },
      {
        name: "description",
        content:
          "Read what business owners, professionals and families in Ahmedabad say about working with ARK Finance Consultancy on loans, tax and insurance.",
      },
      { property: "og:title", content: "Client Testimonials | ARK Finance Consultancy" },
      {
        property: "og:description",
        content: "Feedback from clients across Ahmedabad and Gujarat.",
      },
    ],
  }),
  component: Testimonials,
});

function Testimonials() {
  const testimonials = useQuery(testimonialsQuery);

  return (
    <SiteLayout>
      <PageHero
        eyebrow="Testimonials"
        title="Trusted by more than 2,500 clients"
        intro="Referrals are how this practice grew. Here is what clients say in their own words."
      />
      <section className="container-page py-20 sm:py-24">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.data?.map((item) => (
            <TestimonialCard key={item.id} item={item} />
          ))}
        </div>
        <div className="mt-16 rounded-lg bg-primary px-8 py-12 text-center text-primary-foreground">
          <h2 className="text-2xl font-semibold">Ready to be our next success story?</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-primary-foreground/75">
            Share your requirement and we'll come back with clear options — no pricing pressure.
          </p>
          <Link
            to="/contact"
            className="mt-7 inline-flex rounded-md bg-accent px-6 py-3.5 text-sm font-semibold text-accent-foreground"
          >
            Contact for quote
          </Link>
        </div>
      </section>
    </SiteLayout>
  );
}
