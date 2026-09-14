import { getDb } from "./db";
import { randomBytes } from "crypto";

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

  db.prepare(`
    INSERT INTO orders (id, ref, name, email, phone, address, items, total, status, payment_method, eft_reference, bank_id, createdAt, updatedAt)
    VALUES (@id, @ref, @name, @email, @phone, @address, @items, @total, 'pending', 'eft', @eft_reference, @bank_id, @now, @now)
  `).run({
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
  });

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

  db.prepare(`UPDATE orders SET ${sets.join(", ")} WHERE id = @id`).run(params);
  return getOrder(id);
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
