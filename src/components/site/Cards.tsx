import { Link } from "@tanstack/react-router";
import { ArrowRight, FileText, Landmark, ShieldCheck, TrendingUp, Quote, Star } from "lucide-react";
import type { Service, TeamMember, Testimonial } from "@/lib/queries";

const ICONS = { Landmark, ShieldCheck, FileText, TrendingUp } as const;

export function ServiceCard({
  service,
  titleOverride,
}: {
  service: Service;
  titleOverride?: string;
}) {
  const Icon = ICONS[service.icon as keyof typeof ICONS] ?? Landmark;
  return (
    <article className="group flex h-full flex-col rounded-lg border border-border bg-card p-7 shadow-card transition-all hover:-translate-y-1 hover:border-accent/60">
      <span className="inline-flex size-12 items-center justify-center rounded-md bg-secondary text-primary">
        <Icon className="size-6" aria-hidden />
      </span>
      <h3 className="mt-5 text-lg font-semibold text-primary">{titleOverride ?? service.title}</h3>
      <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">{service.summary}</p>
      <Link
        to="/services"
        hash={service.slug}
        className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary"
      >
        Learn more
        <ArrowRight
          className="size-4 text-accent transition-transform group-hover:translate-x-1"
          aria-hidden
        />
      </Link>
    </article>
  );
}

export function TestimonialCard({ item }: { item: Testimonial }) {
  return (
    <figure className="flex h-full flex-col rounded-lg border border-border bg-card p-7 shadow-card">
      <Quote className="size-7 text-accent" aria-hidden />
      <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-foreground">
        “{item.quote}”
      </blockquote>
      <div className="mt-5 flex gap-0.5" aria-label={`${item.rating} out of 5`}>
        {Array.from({ length: item.rating }).map((_, i) => (
          <Star key={i} className="size-4 fill-accent text-accent" aria-hidden />
        ))}
      </div>
      <figcaption className="mt-4 border-t border-border pt-4">
        <p className="text-sm font-semibold text-primary">{item.name}</p>
        <p className="text-xs text-muted-foreground">
          {[item.designation, item.company].filter(Boolean).join(", ")}
        </p>
      </figcaption>
    </figure>
  );
}

export function TeamCard({ member }: { member: TeamMember }) {
  const initials = member.name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("");

  return (
    <article className="flex h-full flex-col rounded-lg border border-border bg-card p-7 shadow-card">
      {member.photo_url ? (
        <img
          src={member.photo_url}
          alt={`${member.name}, ${member.designation}`}
          className="size-20 rounded-full object-cover object-top"
          width={80}
          height={80}
          loading="lazy"
        />
      ) : (
        <span
          aria-hidden
          className="inline-flex size-20 items-center justify-center rounded-full bg-primary text-xl font-semibold text-primary-foreground"
        >
          {initials}
        </span>
      )}
      <h3 className="mt-5 text-lg font-semibold text-primary">{member.name}</h3>
      <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-accent">
        {member.designation}
      </p>
      <p className="mt-4 flex-1 text-sm leading-relaxed text-muted-foreground">{member.bio}</p>
    </article>
  );
}

export function StatBlock({ value, label }: { value: string; label: string }) {
  return (
    <div className="border-l-2 border-accent pl-5">
      <p className="font-[family-name:var(--font-display)] text-3xl font-semibold text-primary sm:text-4xl">
        {value}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
