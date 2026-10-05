import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { sendEmail, leadNotificationHtml, welcomeEmailHtml, newsletterWelcomeHtml } from "@/lib/smtp";

const leadSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255),
  phone: z
    .string()
    .trim()
    .min(8)
    .max(20)
    .regex(/^[0-9+\-\s()]+$/),
  service: z.string().trim().min(1).max(120),
  message: z.string().trim().max(1000).optional().default(""),
  sourcePage: z.string().trim().max(150).optional().default(""),
});

function requestOrigin(): string {
  const request = getRequest();
  return request?.headers?.get("referer") ?? request?.headers?.get("origin") ?? "";
}

export const submitLead = createServerFn({ method: "POST" })
  .validator((data: unknown) => leadSchema.safeParse(data))
  .handler(async ({ data }) => {
    if (!data.success) {
      throw new Response(JSON.stringify({ message: "Invalid submission" }), {
        status: 400,
        headers: { "content-type": "application/json" },
      });
    }
    const sourcePage = data.data.sourcePage || requestOrigin();
    const { data: lead, error } = await supabaseAdmin
      .from("leads")
      .insert({
        name: data.data.name,
        email: data.data.email,
        phone: data.data.phone,
        service: data.data.service,
        message: data.data.message,
        source_page: sourcePage,
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);

    // Email notifications fire-and-forget.
    const adminEmail = process.env["ADMIN_EMAIL"] || "karanvalangar211@gmail.com";
    sendEmail({
      to: adminEmail,
      subject: `New Lead: ${data.data.name} — ${data.data.service}`,
      html: leadNotificationHtml(data.data),
      replyTo: data.data.email,
    }).catch((err) => console.error("Failed to email lead notification:", err));
    sendEmail({
      to: data.data.email,
      subject: "Thank you for contacting ARK Finance Consultancy",
      html: welcomeEmailHtml(data.data.name),
    }).catch((err) => console.error("Failed to email welcome:", err));

    return { id: lead.id, created_at: lead.created_at };
  });

const subscribeSchema = z.object({ email: z.string().trim().email().max(255) });

export const subscribeNewsletter = createServerFn({ method: "POST" })
  .validator((data: unknown) => subscribeSchema.safeParse(data))
  .handler(async ({ data }) => {
    if (!data.success) {
      throw new Response(JSON.stringify({ message: "Invalid email" }), {
        status: 400,
        headers: { "content-type": "application/json" },
      });
    }
    const email = data.data.email.toLowerCase();
    const { data: existing } = await supabaseAdmin
      .from("newsletter_subscribers")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (!existing) {
      const { error } = await supabaseAdmin
        .from("newsletter_subscribers")
        .insert({ email, status: "active", source: "footer" });
      if (error) throw new Error(error.message);
    }

    sendEmail({
      to: email,
      subject: "Welcome to ARK Finance Newsletter",
      html: newsletterWelcomeHtml(email),
    }).catch((err) => console.error("Failed to email newsletter welcome:", err));

    return { ok: true };
  });