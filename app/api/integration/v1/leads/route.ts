import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { isIntegrationAuthenticated, parsePagination } from "@/lib/integrationAuth";

// GET /api/integration/v1/leads — read-only. This system has no chat/
// conversation history behind a lead (0 chat_sessions have ever been
// created here) — only the single contact-form/interest message captured
// at creation time. Do not imply conversation history that doesn't exist.
export async function GET(req: NextRequest) {
  const start = Date.now();
  const log = (status: number) =>
    console.log(`[integration-api] GET /leads status=${status} ${Date.now() - start}ms`);

  if (!isIntegrationAuthenticated(req)) {
    log(401);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const pagination = parsePagination(req);
  if (!pagination) {
    log(400);
    return NextResponse.json({ error: "Invalid page/limit" }, { status: 400 });
  }
  const { page, limit } = pagination;
  const offset = (page - 1) * limit;

  const db = getDb();
  const total = (db.prepare("SELECT COUNT(*) as n FROM leads").get() as { n: number }).n;
  const data = db
    .prepare("SELECT id, name, email, phone, message, productInterest, createdAt FROM leads ORDER BY createdAt DESC LIMIT ? OFFSET ?")
    .all(limit, offset);

  log(200);
  return NextResponse.json({
    sourceSystem: "GADGETS",
    data,
    pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
  });
}
