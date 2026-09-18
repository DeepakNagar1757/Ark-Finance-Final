import { createServerFn } from "@tanstack/react-start";
import {
  sendEmail,
  leadNotificationHtml,
  welcomeEmailHtml,
  newsletterWelcomeHtml,
} from "@/lib/smtp";

export const sendLeadEmails = createServerFn({ method: "POST" })
  .validator((data: {
    name: string;
    email: string;
    phone: string;
    service: string;
    message: string;
  }) => data)
  .handler(async ({ data }) => {
    const adminEmail = process.env.ADMIN_EMAIL || "karanvalangar211@gmail.com";

    // Send notification to admin
    await sendEmail({
      to: adminEmail,
      subject: `New Lead: ${data.name} — ${data.service}`,
      html: leadNotificationHtml(data),
      replyTo: data.email,
    });

    // Send welcome email to the lead
    await sendEmail({
      to: data.email,
      subject: "Thank you for contacting ARK Finance Consultancy",
      html: welcomeEmailHtml(data.name),
    });

    return { success: true };
  });

export const sendNewsletterWelcome = createServerFn({ method: "POST" })
  .validator((data: { email: string }) => data)
  .handler(async ({ data }) => {
    await sendEmail({
      to: data.email,
      subject: "Welcome to ARK Finance Newsletter",
      html: newsletterWelcomeHtml(data.email),
    });

    return { success: true };
  });
