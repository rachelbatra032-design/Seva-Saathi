import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { vector384 } from "@/db/vector";
export const services = pgTable(
  "services",
  {
    slug: varchar("slug", { length: 128 }).primaryKey(),
    title: text("title").notNull(),
    summary: text("summary").notNull(),
    category: varchar("category", { length: 64 }).notNull(),
    level: varchar("level", { length: 16 }).notNull(),
    state: varchar("state", { length: 8 }),
    url: text("url").notNull(),
    ministry: text("ministry").notNull(),
    languages: jsonb("languages").$type<string[]>().notNull().default([]),
    popular: boolean("popular").default(false),
    payload: jsonb("payload").$type<Record<string, unknown>>().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("services_category_idx").on(t.category)],
);

export const journeys = pgTable("journeys", {
  slug: varchar("slug", { length: 128 }).primaryKey(),
  title: text("title").notNull(),
  tagline: text("tagline").notNull(),
  payload: jsonb("payload").$type<Record<string, unknown>>().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const journeySteps = pgTable(
  "journey_steps",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    journeySlug: varchar("journey_slug", { length: 128 })
      .notNull()
      .references(() => journeys.slug, { onDelete: "cascade" }),
    stepId: varchar("step_id", { length: 64 }).notNull(),
    ord: integer("ord").notNull(),
    title: text("title").notNull(),
    agency: text("agency").notNull(),
    payload: jsonb("payload").$type<Record<string, unknown>>().notNull(),
  },
  (t) => [index("journey_steps_journey_idx").on(t.journeySlug)],
);

export const sources = pgTable(
  "sources",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    url: text("url").notNull().unique(),
    agency: text("agency"),
    licence: text("licence"),
    lastFetched: timestamp("last_fetched", { withTimezone: true }),
    contentHash: varchar("content_hash", { length: 64 }),
  },
  (t) => [index("sources_url_idx").on(t.url)],
);

export const documents = pgTable("documents", {
  id: uuid("id").defaultRandom().primaryKey(),
  sourceId: uuid("source_id")
    .notNull()
    .references(() => sources.id, { onDelete: "cascade" }),
  title: text("title"),
  fetchedAt: timestamp("fetched_at", { withTimezone: true }).notNull(),
});

export const chunks = pgTable(
  "chunks",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    documentId: uuid("document_id")
      .notNull()
      .references(() => documents.id, { onDelete: "cascade" }),
    sourceId: uuid("source_id")
      .notNull()
      .references(() => sources.id, { onDelete: "cascade" }),
    ord: integer("ord").notNull(),
    text: text("text").notNull(),
    contentHash: varchar("content_hash", { length: 64 }).notNull(),
    embedding: vector384("embedding"),
  },
  (t) => [index("chunks_source_idx").on(t.sourceId)],
);

export const linkChecks = pgTable("link_checks", {
  url: text("url").primaryKey(),
  status: varchar("status", { length: 32 }).notNull(),
  checkedAt: timestamp("checked_at", { withTimezone: true }).notNull(),
  meta: jsonb("meta").$type<Record<string, unknown>>(),
});

export const feedback = pgTable("feedback", {
  id: uuid("id").defaultRandom().primaryKey(),
  url: text("url").notNull(),
  pagePath: text("page_path").notNull(),
  details: text("details").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
