import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { isIntegrationAuthenticated } from "@/lib/integrationAuth";

// GET /api/integration/v1/orders/:id — read-only, matches Gadgets' own id
// OR its real order ref (e.g. "DC-52386C"), same lookup rule as lib/orders.ts
// getOrder(). Ref returned verbatim, never renamed/normalized.
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isIntegrationAuthenticated(req)) {
    console.log("[integration-api] GET /orders/:id status=401");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const row = getDb()
    .prepare(`
      SELECT id, ref, name, email, phone, address, items, total, status,
             payment_method, proof_url, eft_reference, tracking_number,
             createdAt, updatedAt
      FROM orders WHERE id = ? OR ref = ?
    `)
    .get(id, id) as Record<string, unknown> | undefined;

  if (!row) {
    console.log("[integration-api] GET /orders/:id status=404");
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  console.log("[integration-api] GET /orders/:id status=200");
  return NextResponse.json({
    sourceSystem: "GADGETS",
    data: { ...row, items: JSON.parse(row.items as string) },
  });
}
