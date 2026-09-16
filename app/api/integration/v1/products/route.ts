import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { isIntegrationAuthenticated, parsePagination } from "@/lib/integrationAuth";

// GET /api/integration/v1/products — read-only. Strictly SELECT, no writes.
// Part of the Gadgets read API (Phase B0) built for Bevans Admin to consume
// later (Phase B) — this endpoint is not yet called by anything in
// production.
export async function GET(req: NextRequest) {
  const start = Date.now();
  const log = (status: number) =>
    console.log(`[integration-api] GET /products status=${status} ${Date.now() - start}ms`);

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
  const total = (db.prepare("SELECT COUNT(*) as n FROM products").get() as { n: number }).n;
  const rows = db
    .prepare("SELECT id, name, price, originalPrice, category, description, imageUrl, inStock, featured, createdAt, updatedAt FROM products ORDER BY createdAt DESC LIMIT ? OFFSET ?")
    .all(limit, offset) as Record<string, unknown>[];

  const data = rows.map((r) => ({ ...r, inStock: r.inStock === 1, featured: r.featured === 1 }));

  log(200);
  return NextResponse.json({
    sourceSystem: "GADGETS",
    data,
    pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
  });
}
