import { pgTable, serial, text, numeric, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const productsTable = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  brand: text("brand").notNull(),
  price: numeric("price", { precision: 12, scale: 2 }).notNull(),
  category: text("category").notNull(),
  description: text("description").notNull(),
  engineCapacity: text("engine_capacity"),
  topSpeed: text("top_speed"),
  images: jsonb("images").$type<string[]>().notNull().default([]),
  model3dUrl: text("model_3d_url"),
  featured: boolean("featured").notNull().default(false),
  specs: jsonb("specs").$type<{
    engine?: string;
    horsepower?: string;
    torque?: string;
    weight?: string;
    fuelCapacity?: string;
    seatHeight?: string;
    transmission?: string;
    brakes?: string;
    suspension?: string;
    yearModel?: string;
  }>().default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertProductSchema = createInsertSchema(productsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof productsTable.$inferSelect;
