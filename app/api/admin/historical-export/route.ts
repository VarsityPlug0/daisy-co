import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { isAuthenticated } from "@/lib/auth";

// GET /api/admin/historical-export — read-only export of record types that
// have no other listing API (leads, quotes, visitors, cart_events). Admin
// session required, same as /api/orders. Added 2026-09-14 solely so these
// records — people who enquired or requested a quote but did not
// necessarily purchase — can be independently backed up off-platform.
// SELECT only; nothing here writes to any table.
export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();
  const leads = db.prepare("SELECT * FROM leads ORDER BY createdAt DESC").all();
  const quotes = db.prepare("SELECT * FROM quotes ORDER BY createdAt DESC").all();
  const visitors = db.prepare("SELECT * FROM visitors ORDER BY createdAt DESC").all();
  const cartEvents = db.prepare("SELECT * FROM cart_events ORDER BY createdAt DESC").all();

  return NextResponse.json({ leads, quotes, visitors, cartEvents });
}
