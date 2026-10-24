import { NextResponse } from "next/server";
import { journeyBySlug } from "@/data/journeys";
import { getDb } from "@/db/client";
import * as schema from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(_req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const file = journeyBySlug[slug];
  if (!file) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const db = getDb();
  if (db) {
    try {
      const row = await db.select().from(schema.journeys).where(eq(schema.journeys.slug, slug)).limit(1);
      if (row[0]) {
        return NextResponse.json({
          source: "database",
          journey: { ...file, ...row[0].payload, slug, title: row[0].title, tagline: row[0].tagline },
        });
      }
    } catch {
      /* fall through */
    }
  }

  return NextResponse.json({ source: "files", journey: file });
}
