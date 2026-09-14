import type Database from "better-sqlite3";
import { randomBytes, randomUUID } from "crypto";

export const EVENT_VERSION = 1;

export interface LeadForEvent {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  productInterest: string;
  createdAt: string;
}

/**
 * Writes one outbox_events row for a LEAD_CREATED event. Must always be
 * called from inside the same db.transaction() as the leads INSERT it
 * describes — never on its own. See the two call sites in
 * app/api/contact/route.ts and app/api/track/lead/route.ts.
 */
export function createLeadOutboxEvent(db: Database.Database, lead: LeadForEvent): void {
  const payload = {
    id: lead.id,
    name: lead.name,
    email: lead.email,
    phone: lead.phone,
    message: lead.message,
    productInterest: lead.productInterest,
    createdAt: lead.createdAt,
  };

  db.prepare(`
    INSERT INTO outbox_events
      (id, event_id, event_type, event_version, occurred_at, source_platform, source_entity_id, payload, status, attempts, createdAt)
    VALUES (?, ?, 'LEAD_CREATED', ?, ?, 'gadgets', ?, ?, 'pending', 0, ?)
  `).run(
    randomBytes(8).toString("hex"),
    randomUUID(),
    EVENT_VERSION,
    lead.createdAt,
    lead.id,
    JSON.stringify(payload),
    lead.createdAt,
  );
}
