CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS "services" (
  "slug" varchar(128) PRIMARY KEY NOT NULL,
  "title" text NOT NULL,
  "summary" text NOT NULL,
  "category" varchar(64) NOT NULL,
  "level" varchar(16) NOT NULL,
  "state" varchar(8),
  "url" text NOT NULL,
  "ministry" text NOT NULL,
  "languages" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "popular" boolean DEFAULT false,
  "payload" jsonb NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS "services_category_idx" ON "services" ("category");

CREATE TABLE IF NOT EXISTS "journeys" (
  "slug" varchar(128) PRIMARY KEY NOT NULL,
  "title" text NOT NULL,
  "tagline" text NOT NULL,
  "payload" jsonb NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "journey_steps" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "journey_slug" varchar(128) NOT NULL REFERENCES "journeys"("slug") ON DELETE cascade,
  "step_id" varchar(64) NOT NULL,
  "ord" integer NOT NULL,
  "title" text NOT NULL,
  "agency" text NOT NULL,
  "payload" jsonb NOT NULL
);
CREATE INDEX IF NOT EXISTS "journey_steps_journey_idx" ON "journey_steps" ("journey_slug");

CREATE TABLE IF NOT EXISTS "sources" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "url" text NOT NULL UNIQUE,
  "agency" text,
  "licence" text,
  "last_fetched" timestamptz,
  "content_hash" varchar(64)
);
CREATE INDEX IF NOT EXISTS "sources_url_idx" ON "sources" ("url");

CREATE TABLE IF NOT EXISTS "documents" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "source_id" uuid NOT NULL REFERENCES "sources"("id") ON DELETE cascade,
  "title" text,
  "fetched_at" timestamptz NOT NULL
);

CREATE TABLE IF NOT EXISTS "chunks" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "document_id" uuid NOT NULL REFERENCES "documents"("id") ON DELETE cascade,
  "source_id" uuid NOT NULL REFERENCES "sources"("id") ON DELETE cascade,
  "ord" integer NOT NULL,
  "text" text NOT NULL,
  "content_hash" varchar(64) NOT NULL,
  "embedding" jsonb
);
CREATE INDEX IF NOT EXISTS "chunks_source_idx" ON "chunks" ("source_id");

CREATE TABLE IF NOT EXISTS "link_checks" (
  "url" text PRIMARY KEY NOT NULL,
  "status" varchar(32) NOT NULL,
  "checked_at" timestamptz NOT NULL,
  "meta" jsonb
);

CREATE TABLE IF NOT EXISTS "feedback" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "url" text NOT NULL,
  "page_path" text NOT NULL,
  "details" text NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL
);
