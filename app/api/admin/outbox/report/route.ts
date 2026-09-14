import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { isAuthenticated } from "@/lib/auth";

const MAX_ATTEMPTS = 10;

// POST /api/admin/outbox/report — admin-gated. The delivery relay reports
// the outcome of one delivery attempt per event_id. This app is the sole
// writer of outbox_events' delivery state — the relay never touches this
// database directly, only this narrow endpoint. A "failed" report leaves
// the event pending for retry unless MAX_ATTEMPTS is reached, at which
// point it becomes a terminal, still-inspectable dead letter — never
// silently discarded.
export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { event_id, status, error } = await req.json();
  if (!event_id || !["delivered", "failed"].includes(status)) {
    return NextResponse.json({ error: "event_id and status ('delivered'|'failed') required" }, { status: 400 });
  }

  const db = getDb();
  const now = new Date().toISOString();
  const row = db.prepare("SELECT attempts FROM outbox_events WHERE event_id = ?").get(event_id) as { attempts: number } | undefined;
  if (!row) {
    return NextResponse.json({ error: "Unknown event_id" }, { status: 404 });
  }

  const attempts = row.attempts + 1;

  if (status === "delivered") {
    db.prepare(`
      UPDATE outbox_events
      SET status = 'delivered', attempts = ?, last_attempt_at = ?, delivered_at = ?, last_error = NULL
      WHERE event_id = ?
    `).run(attempts, now, now, event_id);
  } else {
    const terminal = attempts >= MAX_ATTEMPTS;
    db.prepare(`
      UPDATE outbox_events
      SET status = ?, attempts = ?, last_attempt_at = ?, last_error = ?
      WHERE event_id = ?
    `).run(terminal ? "failed" : "pending", attempts, now, String(error ?? "").slice(0, 500), event_id);
  }

  return NextResponse.json({ ok: true });
}
