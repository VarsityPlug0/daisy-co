import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { isIntegrationAuthenticated, parsePagination } from "@/lib/integrationAuth";

// GET /api/integration/v1/orders — read-only. Payment info (payment_method,
// proof_url, eft_reference, status) lives on the order row itself in this
// system — there is no separate payments table, so no separate payments
// endpoint was built; this is the payment view.
export async function GET(req: NextRequest) {
  const start = Date.now();
  const log = (status: number) =>
    console.log(`[integration-api] GET /orders status=${status} ${Date.now() - start}ms`);

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
  const total = (db.prepare("SELECT COUNT(*) as n FROM orders").get() as { n: number }).n;
  const rows = db
    .prepare(`
      SELECT id, ref, name, email, phone, address, items, total, status,
             payment_method, proof_url, eft_reference, tracking_number,
             createdAt, updatedAt
      FROM orders ORDER BY createdAt DESC LIMIT ? OFFSET ?
    `)
    .all(limit, offset) as Record<string, unknown>[];

  const data = rows.map((r) => ({ ...r, items: JSON.parse(r.items as string) }));

  log(200);
  return NextResponse.json({
    sourceSystem: "GADGETS",
    data,
    pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
  });
}
