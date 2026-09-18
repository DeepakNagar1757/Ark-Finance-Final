import { useState } from "react";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { sendNewsletterWelcome } from "@/routes/api/-send-email";

const schema = z.object({ email: z.string().trim().email().max(255) });

export function NewsletterForm({ className = "" }: { className?: string }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const parsed = schema.safeParse({ email });
    if (!parsed.success) {
      setState("error");
      setMessage("Please enter a valid email address.");
      return;
    }
    setState("loading");
    const { error } = await supabase
      .from("newsletter_subscribers")
      .insert({ email: parsed.data.email.toLowerCase() });
    if (error && !error.message.includes("duplicate")) {
      setState("error");
      setMessage("Something went wrong. Please try again.");
      return;
    }

    // Send welcome email (fire-and-forget)
    sendNewsletterWelcome({ data: { email: parsed.data.email.toLowerCase() } }).catch((err) =>
      console.error("Failed to send newsletter welcome email:", err),
    );

    setState("done");
    setMessage("You're subscribed. Thank you.");
    setEmail("");
  }

  return (
    <form onSubmit={onSubmit} className={className} noValidate>
      <label htmlFor="newsletter-email" className="sr-only">
        Email address
      </label>
      <div className="flex gap-2">
        <input
          id="newsletter-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          maxLength={255}
          className="min-w-0 flex-1 rounded-md border border-primary-foreground/25 bg-primary-foreground/10 px-3 py-2.5 text-sm text-primary-foreground placeholder:text-primary-foreground/45 focus:border-accent focus:outline-none"
        />
        <button
          type="submit"
          disabled={state === "loading"}
          className="inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {state === "loading" && <Loader2 className="size-4 animate-spin" aria-hidden />}
          Subscribe
        </button>
      </div>
      {message && (
        <p
          className={`mt-2 text-xs ${state === "error" ? "text-destructive" : "text-accent"}`}
          role="status"
        >
          {message}
        </p>
      )}
    </form>
  );
}
