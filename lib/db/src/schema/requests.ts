import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const requestsTable = pgTable("requests", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  location: text("location").notNull(),
  bikeId: integer("bike_id"),
  bikeName: text("bike_name"),
  message: text("message"),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertRequestSchema = createInsertSchema(requestsTable).omit({ id: true, createdAt: true });
export type InsertRequest = z.infer<typeof insertRequestSchema>;
export type BikeRequest = typeof requestsTable.$inferSelect;
