import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { isAuthenticated } from "@/lib/auth";

// GET /api/admin/outbox/pending — read-only, admin-gated. Polled by the
// delivery relay (runs on the Bevans VPS, not this app) to find events
// this app has committed locally but not yet successfully delivered.
export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();
  const rows = db.prepare(`
    SELECT event_id, event_type, event_version, occurred_at, source_platform, source_entity_id, payload, attempts
    FROM outbox_events
    WHERE status = 'pending'
    ORDER BY createdAt ASC
    LIMIT 50
  `).all() as Array<{
    event_id: string; event_type: string; event_version: number; occurred_at: string;
    source_platform: string; source_entity_id: string; payload: string; attempts: number;
  }>;

  const events = rows.map(r => ({
    event_id: r.event_id,
    event_type: r.event_type,
    event_version: r.event_version,
    occurred_at: r.occurred_at,
    source_platform: r.source_platform,
    source_entity_id: r.source_entity_id,
    payload: JSON.parse(r.payload),
    attempts: r.attempts,
  }));

  return NextResponse.json({ events });
}
