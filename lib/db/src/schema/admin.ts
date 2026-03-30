import { pgTable, serial, text, jsonb, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const adminProfileTable = pgTable("admin_profile", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone").notNull().default(""),
  passwordHash: text("password_hash").notNull(),
  whatsappNumber: text("whatsapp_number").notNull().default(""),
  appName: text("app_name").notNull().default("ApexMoto"),
  heroImage: text("hero_image").default(""),
  socialLinks: jsonb("social_links").$type<{
    instagram?: string | null;
    twitter?: string | null;
    website?: string | null;
    facebook?: string | null;
  }>().default({}),
  emailNotificationsEnabled: boolean("email_notifications_enabled").notNull().default(false),
  smtpHost: text("smtp_host").default(""),
  smtpPort: text("smtp_port").default("587"),
  smtpUser: text("smtp_user").default(""),
  smtpPassword: text("smtp_password").default(""),
  smtpFrom: text("smtp_from").default(""),
  contactInfo: jsonb("contact_info").$type<{
    heading?: string;
    subheading?: string;
    phone?: string;
    email?: string;
    address?: string;
  }>().default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertAdminProfileSchema = createInsertSchema(adminProfileTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertAdminProfile = z.infer<typeof insertAdminProfileSchema>;
export type AdminProfile = typeof adminProfileTable.$inferSelect;
