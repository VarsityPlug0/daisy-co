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

// Phase 2 (2026-09-15): order lifecycle events, same outbox, same relay,
// same receiver — only the payload shape and event_type are new. See
// lib/orders.ts for the two call sites (createOrder, updateOrder) that
// wrap these in the same db.transaction() as the order write they
// describe, never on their own.
export interface OrderItemForEvent {
  id: string;
  name: string;
  price: string;
  qty: number;
}

export interface OrderForEvent {
  id: string;
  ref: string;
  name: string;
  email: string;
  phone: string;
  items: OrderItemForEvent[];
  total: number;
  payment_method: string;
  createdAt: string;
}

/**
 * Writes one outbox_events row for an ORDER_CREATED event. event_id is
 * the order's own id — deterministic, and already unique — so the
 * gadgets_events.event_id UNIQUE constraint on the receiving end is the
 * whole idempotency guarantee, same principle as leads.
 */
export function createOrderCreatedOutboxEvent(db: Database.Database, order: OrderForEvent): void {
  const payload = {
    id: order.id,
    ref: order.ref,
    name: order.name,
    email: order.email,
    phone: order.phone,
    items: order.items.map((i) => ({ id: i.id, name: i.name, price: i.price, qty: i.qty })),
    total: order.total,
    payment_method: order.payment_method,
    createdAt: order.createdAt,
  };

  db.prepare(`
    INSERT INTO outbox_events
      (id, event_id, event_type, event_version, occurred_at, source_platform, source_entity_id, payload, status, attempts, createdAt)
    VALUES (?, ?, 'ORDER_CREATED', ?, ?, 'gadgets', ?, ?, 'pending', 0, ?)
  `).run(
    randomBytes(8).toString("hex"),
    order.id,
    EVENT_VERSION,
    order.createdAt,
    order.id,
    JSON.stringify(payload),
    order.createdAt,
  );
}

/**
 * Writes one outbox_events row for an ORDER_PAID event. event_id is
 * `${order.id}:paid` — deterministic per order, so even a double-fire
 * from a race is caught by the same UNIQUE constraint. Caller (lib/orders.ts
 * updateOrder()) is responsible for only calling this on a genuine
 * previousStatus!=='approved' -> newStatus==='approved' transition, and
 * for doing so inside the same transaction as the status UPDATE.
 */
export function createOrderPaidOutboxEvent(
  db: Database.Database,
  order: OrderForEvent,
  paidVia: "eft_manual" | "payfast",
  occurredAt: string,
): void {
  const payload = {
    id: order.id,
    ref: order.ref,
    total: order.total,
    payment_method: order.payment_method,
    paid_via: paidVia,
    occurred_at: occurredAt,
  };

  db.prepare(`
    INSERT INTO outbox_events
      (id, event_id, event_type, event_version, occurred_at, source_platform, source_entity_id, payload, status, attempts, createdAt)
    VALUES (?, ?, 'ORDER_PAID', ?, ?, 'gadgets', ?, ?, 'pending', 0, ?)
  `).run(
    randomBytes(8).toString("hex"),
    `${order.id}:paid`,
    EVENT_VERSION,
    occurredAt,
    order.id,
    JSON.stringify(payload),
    occurredAt,
  );
}
