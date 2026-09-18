import { Link } from "@tanstack/react-router";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { SITE } from "@/lib/site";
import { NewsletterForm } from "./NewsletterForm";

export function Footer() {
  return (
    <footer className="mt-24 bg-primary text-primary-foreground">
      <div className="container-page grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="inline-flex rounded-md bg-background p-3">
            <img src="/ark-logo.png" alt="ARK Finance Consultancy logo" className="h-14 w-auto" />
          </div>
          <p className="mt-5 text-sm leading-relaxed text-primary-foreground/75">
            {SITE.tagline}. Loan financing, insurance, taxation and investment advisory for families
            and businesses across Ahmedabad and Gujarat.
          </p>
          <p className="mt-4 text-xs uppercase tracking-widest text-accent">
            Established {SITE.founded}
          </p>
        </div>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-widest text-accent">Explore</h2>
          <ul className="mt-5 space-y-3 text-sm text-primary-foreground/75">
            {[
              { to: "/about", label: "About us" },
              { to: "/services", label: "Services" },
              { to: "/testimonials", label: "Testimonials" },
              { to: "/blog", label: "Insights" },
              { to: "/contact", label: "Contact" },
            ].map((item) => (
              <li key={item.to}>
                <Link to={item.to} className="transition-colors hover:text-accent">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-widest text-accent">
            Reach the office
          </h2>
          <address className="mt-5 space-y-4 text-sm not-italic text-primary-foreground/75">
            <p className="flex gap-3">
              <MapPin className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
              <span>
                {SITE.address.line1}, {SITE.address.line2}, {SITE.address.area},{" "}
                {SITE.address.region}
              </span>
            </p>
            <p className="flex gap-3">
              <Phone className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
              <a href={SITE.phoneHref} className="hover:text-accent">
                {SITE.phoneDisplay}
              </a>
            </p>
            <p className="flex gap-3">
              <Mail className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
              <a href={`mailto:${SITE.email}`} className="hover:text-accent">
                {SITE.email}
              </a>
            </p>
            <p className="flex gap-3">
              <Clock className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
              <span>{SITE.hours}</span>
            </p>
          </address>
        </div>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-widest text-accent">
            Financial insights
          </h2>
          <p className="mt-5 text-sm text-primary-foreground/75">
            Practical notes on loans, tax deadlines and investing in Gujarat. No spam.
          </p>
          <NewsletterForm className="mt-5" />
        </div>
      </div>

      <div className="border-t border-primary-foreground/15">
        <div className="container-page flex flex-col gap-3 py-6 text-xs text-primary-foreground/60 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {SITE.name}. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link to="/privacy" className="hover:text-accent">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-accent">
              Terms of Service
            </Link>
            <Link to="/admin" className="hover:text-accent">
              Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
