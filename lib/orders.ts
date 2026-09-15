import { getDb } from "./db";
import { randomBytes } from "crypto";
import { createOrderCreatedOutboxEvent, createOrderPaidOutboxEvent } from "./outbox";

export interface OrderItem {
  id: string;
  name: string;
  price: string;
  qty: number;
  imageUrl: string;
}

export interface Order {
  id: string;
  ref: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  items: OrderItem[];
  total: number;
  status: "pending" | "proof_submitted" | "approved" | "rejected" | "shipped" | "delivered";
  payment_method: "eft" | "payfast";
  proof_url: string | null;
  eft_reference: string | null;
  notes: string | null;
  bank_id: string | null;
  tracking_number: string | null;
  createdAt: string;
  updatedAt: string;
}

function genRef(): string {
  return "DC-" + randomBytes(3).toString("hex").toUpperCase();
}

export function createOrder(data: {
  name: string;
  email: string;
  phone: string;
  address: string;
  items: OrderItem[];
  total: number;
  eft_reference?: string;
  bank_id?: string;
}): Order {
  const db = getDb();
  const now = new Date().toISOString();
  const id = randomBytes(8).toString("hex");
  const ref = genRef();

  const insertParams = {
    id, ref,
    name: data.name,
    email: data.email,
    phone: data.phone,
    address: data.address,
    items: JSON.stringify(data.items),
    total: data.total,
    eft_reference: data.eft_reference ?? null,
    bank_id: data.bank_id ?? null,
    now,
  };

  // Phase 2B: the order INSERT and the ORDER_CREATED outbox INSERT must be
  // atomic — same requirement, same db.transaction() pattern already
  // proven for leads (see app/api/contact/route.ts). No network call
  // happens here; the outbox row just sits pending until the relay (on
  // the Bevans VPS, not this app) picks it up.
  db.transaction(() => {
    db.prepare(`
      INSERT INTO orders (id, ref, name, email, phone, address, items, total, status, payment_method, eft_reference, bank_id, createdAt, updatedAt)
      VALUES (@id, @ref, @name, @email, @phone, @address, @items, @total, 'pending', 'eft', @eft_reference, @bank_id, @now, @now)
    `).run(insertParams);
    createOrderCreatedOutboxEvent(db, {
      id, ref,
      name: data.name,
      email: data.email,
      phone: data.phone,
      items: data.items,
      total: data.total,
      payment_method: "eft",
      createdAt: now,
    });
  })();

  return getOrder(id)!;
}

export function getOrder(id: string): Order | null {
  const db = getDb();
  const row = db.prepare("SELECT * FROM orders WHERE id = ? OR ref = ?").get(id, id) as Record<string, unknown> | undefined;
  return row ? deserialize(row) : null;
}

export function listOrders(): Order[] {
  const db = getDb();
  const rows = db.prepare("SELECT * FROM orders ORDER BY createdAt DESC").all() as Record<string, unknown>[];
  return rows.map(deserialize);
}

export function updateOrder(id: string, data: Partial<Pick<Order, "status" | "proof_url" | "notes" | "eft_reference" | "tracking_number" | "payment_method">>): Order | null {
  const db = getDb();
  const sets: string[] = [];
  const params: Record<string, unknown> = { id, now: new Date().toISOString() };

  if (data.status !== undefined)       { sets.push("status = @status");             params.status = data.status; }
  if (data.proof_url !== undefined)    { sets.push("proof_url = @proof_url");        params.proof_url = data.proof_url; }
  if (data.notes !== undefined)        { sets.push("notes = @notes");               params.notes = data.notes; }
  if (data.eft_reference !== undefined)   { sets.push("eft_reference = @eft_reference");     params.eft_reference = data.eft_reference; }
  if (data.tracking_number !== undefined) { sets.push("tracking_number = @tracking_number"); params.tracking_number = data.tracking_number; }
  if (data.payment_method !== undefined)  { sets.push("payment_method = @payment_method");   params.payment_method = data.payment_method; }

  if (!sets.length) return getOrder(id);
  sets.push("updatedAt = @now");

  // Phase 2C: this is the ONE place both approval paths (the admin PATCH
  // route and the PayFast ITN handler) go through, so the transition
  // check — and the atomic outbox write once it fires — only has to live
  // here, not duplicated in both routes. willApprove alone doesn't emit
  // anything; only a genuine previousStatus!=='approved' -> 'approved'
  // transition does, checked and written inside the same transaction as
  // the UPDATE itself so a crash between them can't happen. This is the
  // smallest change that makes the two atomic together — nothing about
  // what either caller considers "approved" changes.
  const willApprove = data.status === "approved";
  const run = db.transaction(() => {
    const before = willApprove ? getOrder(id) : null;
    db.prepare(`UPDATE orders SET ${sets.join(", ")} WHERE id = @id`).run(params);
    const after = getOrder(id);
    if (willApprove && after && (!before || before.status !== "approved")) {
      const paidVia: "eft_manual" | "payfast" = after.payment_method === "payfast" ? "payfast" : "eft_manual";
      createOrderPaidOutboxEvent(db, after, paidVia, params.now as string);
    }
    return after;
  });

  return run();
}

export function deleteOrder(id: string): boolean {
  const db = getDb();
  const result = db.prepare("DELETE FROM orders WHERE id = ? OR ref = ?").run(id, id);
  return result.changes > 0;
}

export function generateTrackingNumber(): string {
  const db = getDb();
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const prefix = `DGC-${date}-`;
  const row = db.prepare("SELECT COUNT(*) as n FROM orders WHERE tracking_number LIKE ?").get(`${prefix}%`) as { n: number };
  return `${prefix}${String((row?.n ?? 0) + 1).padStart(4, "0")}`;
}

function deserialize(row: Record<string, unknown>): Order {
  return {
    ...row,
    items: JSON.parse(row.items as string),
  } as Order;
}
