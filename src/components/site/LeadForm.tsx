import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { SERVICE_OPTIONS } from "@/lib/site";

const schema = z.object({
  name: z.string().trim().min(2, "Please enter your full name.").max(100),
  email: z.string().trim().email("Please enter a valid email address.").max(255),
  phone: z
    .string()
    .trim()
    .min(8, "Please enter a valid phone number.")
    .max(20)
    .regex(/^[0-9+\-\s()]+$/, "Phone can only contain digits and + - ( ) characters."),
  service: z.string().trim().min(1, "Please choose a service."),
  message: z.string().trim().max(1000).optional(),
});

const EMPTY = { name: "", email: "", phone: "", service: "", message: "" };

export function LeadForm({ defaultService }: { defaultService?: string }) {
  const [values, setValues] = useState({ ...EMPTY, service: defaultService ?? "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const [formError, setFormError] = useState("");

  function set(key: keyof typeof EMPTY, value: string) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormError("");
    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) next[String(issue.path[0])] = issue.message;
      setErrors(next);
      return;
    }
    setErrors({});
    setState("loading");
    const { error } = await supabase.from("leads").insert({
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      service: parsed.data.service,
      message: parsed.data.message ?? "",
    });
    if (error) {
      setState("idle");
      setFormError("We couldn't submit your enquiry. Please call us instead.");
      return;
    }
    setState("done");
    setValues({ ...EMPTY });
  }

  if (state === "done") {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center shadow-card">
        <CheckCircle2 className="mx-auto size-10 text-teal" aria-hidden />
        <h3 className="mt-4 text-xl font-semibold text-primary">Thank you — enquiry received</h3>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
          A consultant from ARK Finance Consultancy will get in touch within one working day,
          usually much sooner. For anything urgent, call or WhatsApp us directly between 9 AM and 9
          PM.
        </p>
        <button
          type="button"
          onClick={() => setState("idle")}
          className="mt-6 text-sm font-semibold text-primary underline underline-offset-4"
        >
          Submit another enquiry
        </button>
      </div>
    );
  }

  const inputClass =
    "w-full rounded-md border border-input bg-card px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/20";

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="rounded-lg border border-border bg-card p-6 shadow-card sm:p-8"
    >
      <h3 className="text-xl font-semibold text-primary">Request a consultation</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        Tell us what you need. No obligation, no pricing pressure — we quote only after
        understanding your case.
      </p>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <Field label="Full name" error={errors["name"]} htmlFor="lead-name">
          <input
            id="lead-name"
            className={inputClass}
            value={values.name}
            maxLength={100}
            onChange={(e) => set("name", e.target.value)}
            placeholder="Your name"
          />
        </Field>
        <Field label="Phone number" error={errors["phone"]} htmlFor="lead-phone">
          <input
            id="lead-phone"
            className={inputClass}
            value={values.phone}
            maxLength={20}
            inputMode="tel"
            onChange={(e) => set("phone", e.target.value)}
            placeholder="+91 00000 00000"
          />
        </Field>
        <Field label="Email address" error={errors["email"]} htmlFor="lead-email">
          <input
            id="lead-email"
            type="email"
            className={inputClass}
            value={values.email}
            maxLength={255}
            onChange={(e) => set("email", e.target.value)}
            placeholder="you@example.com"
          />
        </Field>
        <Field label="Service interested in" error={errors["service"]} htmlFor="lead-service">
          <select
            id="lead-service"
            className={inputClass}
            value={values.service}
            onChange={(e) => set("service", e.target.value)}
          >
            <option value="">Select a service</option>
            {SERVICE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </Field>
        <div className="sm:col-span-2">
          <Field label="Message (optional)" error={errors["message"]} htmlFor="lead-message">
            <textarea
              id="lead-message"
              rows={4}
              className={inputClass}
              value={values.message}
              maxLength={1000}
              onChange={(e) => set("message", e.target.value)}
              placeholder="Briefly describe your requirement"
            />
          </Field>
        </div>
      </div>

      {formError && (
        <p className="mt-4 text-sm text-destructive" role="alert">
          {formError}
        </p>
      )}

      <button
        type="submit"
        disabled={state === "loading"}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-light disabled:opacity-60 sm:w-auto"
      >
        {state === "loading" && <Loader2 className="size-4 animate-spin" aria-hidden />}
        Submit enquiry
      </button>
    </form>
  );
}

function Field({
  label,
  error,
  htmlFor,
  children,
}: {
  label: string;
  error?: string | undefined;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-xs font-semibold text-primary">
        {label}
      </label>
      {children}
      {error && (
        <p className="mt-1.5 text-xs text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
