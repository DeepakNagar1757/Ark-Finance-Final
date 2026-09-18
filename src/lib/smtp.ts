import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}

export async function sendEmail({ to, subject, html, replyTo }: EmailOptions) {
  const info = await transporter.sendMail({
    from: process.env.SMTP_FROM || "ARK Finance Consultancy <arkfinance211@gmail.com>",
    to,
    subject,
    html,
    replyTo,
  });
  return info;
}

export function leadNotificationHtml(data: {
  name: string;
  email: string;
  phone: string;
  service: string;
  message: string;
}) {
  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #1a365d; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0; font-size: 20px;">New Lead Enquiry</h1>
        <p style="margin: 5px 0 0; opacity: 0.8;">ARK Finance Consultancy</p>
      </div>
      <div style="border: 1px solid #e2e8f0; border-top: none; padding: 20px; border-radius: 0 0 8px 8px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #718096; width: 120px;">Name</td>
            <td style="padding: 8px 0; font-weight: bold;">${data.name}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #718096;">Email</td>
            <td style="padding: 8px 0;"><a href="mailto:${data.email}">${data.email}</a></td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #718096;">Phone</td>
            <td style="padding: 8px 0;"><a href="tel:${data.phone}">${data.phone}</a></td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #718096;">Service</td>
            <td style="padding: 8px 0;">${data.service}</td>
          </tr>
          ${data.message ? `
          <tr>
            <td style="padding: 8px 0; color: #718096;">Message</td>
            <td style="padding: 8px 0;">${data.message}</td>
          </tr>` : ""}
        </table>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
        <p style="color: #718096; font-size: 12px; margin: 0;">
          Submitted via ARK Finance website contact form.
        </p>
      </div>
    </body>
    </html>
  `;
}

export function welcomeEmailHtml(name: string) {
  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #1a365d; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0; font-size: 20px;">Welcome to ARK Finance</h1>
        <p style="margin: 5px 0 0; opacity: 0.8;">Solution to every financial problem</p>
      </div>
      <div style="border: 1px solid #e2e8f0; border-top: none; padding: 20px; border-radius: 0 0 8px 8px;">
        <p>Dear ${name},</p>
        <p>Thank you for reaching out to <strong>ARK Finance Consultancy</strong>. We have received your enquiry and our team will get in touch with you within one working day.</p>
        <p>If your matter is urgent, feel free to call us directly at <a href="tel:+916351377101">+91 63513 77101</a> between 10 AM and 7 PM, Monday to Saturday.</p>
        <p>We look forward to assisting you.</p>
        <p style="margin-top: 20px;">Warm regards,<br><strong>Karan Joshi</strong><br>Founder &amp; Principal Consultant<br>ARK Finance Consultancy</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
        <p style="color: #718096; font-size: 12px; margin: 0;">
          This is an automated acknowledgement. Please do not reply directly to this email.
        </p>
      </div>
    </body>
    </html>
  `;
}

export function newsletterWelcomeHtml(email: string) {
  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #1a365d; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0; font-size: 20px;">You're Subscribed!</h1>
        <p style="margin: 5px 0 0; opacity: 0.8;">ARK Finance Consultancy</p>
      </div>
      <div style="border: 1px solid #e2e8f0; border-top: none; padding: 20px; border-radius: 0 0 8px 8px;">
        <p>Hello,</p>
        <p>Thank you for subscribing to the <strong>ARK Finance</strong> newsletter. You'll receive occasional updates on financial insights, service announcements, and market trends.</p>
        <p>If you have any questions, feel free to reach out at <a href="mailto:arkfinance211@gmail.com">arkfinance211@gmail.com</a>.</p>
        <p style="margin-top: 20px;">Warm regards,<br><strong>ARK Finance Consultancy</strong></p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
        <p style="color: #718096; font-size: 12px; margin: 0;">
          You received this because you subscribed at arkhq.lovable.app.
        </p>
      </div>
    </body>
    </html>
  `;
}
