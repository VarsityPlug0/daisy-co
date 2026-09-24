import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { isIntegrationAuthenticated } from "@/lib/integrationAuth";

// GET /api/integration/v1/installments/lookup?phone=... — read-only,
// server-to-server only (Bevans chat agent). Given a phone number in any
// common SA format (27xxxxxxxxx, 0xxxxxxxxx, +27xxxxxxxxx), returns the
// most recent non-declined installment application for that number, if
// any, so the chat agent can decide whether this customer is a real
// installment applicant before it hands out bank details.
function last9Digits(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  return digits.slice(-9);
}

export async function GET(req: NextRequest) {
  const start = Date.now();
  const log = (status: number) =>
    console.log(`[integration-api] GET /installments/lookup status=${status} ${Date.now() - start}ms`);

  if (!isIntegrationAuthenticated(req)) {
    log(401);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const phoneParam = searchParams.get("phone") || "";
  const key = last9Digits(phoneParam);
  if (key.length !== 9) {
    log(400);
    return NextResponse.json({ error: "Invalid phone" }, { status: 400 });
  }

  const db = getDb();
  const rows = db
    .prepare(
      `SELECT ref, product_id, product_name, product_price, quantity, term_months, monthly_payment,
              deposit, total_repayable, name, phone, status, createdAt, updatedAt
       FROM installment_applications
       ORDER BY createdAt DESC`
    )
    .all() as Array<{ phone: string; status: string; [k: string]: unknown }>;

  const match = rows.find((r) => last9Digits(String(r.phone)) === key && r.status !== "declined");

  log(200);
  return NextResponse.json({
    sourceSystem: "GADGETS",
    found: !!match,
    application: match || null,
  });
}
