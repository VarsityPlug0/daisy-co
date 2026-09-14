import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { isAuthenticated } from "@/lib/auth";

// GET /api/admin/outbox/status — minimal operational visibility: "are
// events actually flowing?" Not an analytics dashboard, just counts.
export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();
  const byStatus = db.prepare(`SELECT status, COUNT(*) as n FROM outbox_events GROUP BY status`).all() as { status: string; n: number }[];
  const lastDelivered = db.prepare(`SELECT MAX(delivered_at) as t FROM outbox_events WHERE status = 'delivered'`).get() as { t: string | null };
  const maxAttempts = db.prepare(`SELECT MAX(attempts) as a FROM outbox_events WHERE status = 'pending'`).get() as { a: number | null };

  const counts: Record<string, number> = { pending: 0, delivered: 0, failed: 0 };
  for (const row of byStatus) counts[row.status] = row.n;

  return NextResponse.json({
    pending: counts.pending,
    delivered: counts.delivered,
    dead_letter: counts.failed,
    last_delivered_at: lastDelivered.t,
    max_retry_count_pending: maxAttempts.a ?? 0,
  });
}
