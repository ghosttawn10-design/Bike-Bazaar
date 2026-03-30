import nodemailer from "nodemailer";
import { db, adminProfileTable } from "@workspace/db";

export async function sendAdminNotificationEmail(subject: string, html: string): Promise<void> {
  const [admin] = await db.select().from(adminProfileTable).limit(1);
  if (!admin) return;
  if (!admin.emailNotificationsEnabled) return;

  const host = admin.smtpHost?.trim();
  const user = admin.smtpUser?.trim();
  const pass = admin.smtpPassword?.trim();
  const from = admin.smtpFrom?.trim() || user;
  const port = parseInt(admin.smtpPort?.trim() || "587", 10);

  if (!host || !user || !pass) return;

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  await transporter.sendMail({
    from: `"${admin.appName ?? "ApexMoto"}" <${from}>`,
    to: admin.email,
    subject,
    html,
  });
}
