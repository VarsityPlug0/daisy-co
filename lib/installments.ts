import { getDb } from "./db";
import { randomBytes } from "crypto";

// ── Types ────────────────────────────────────────────────────────────────────

export interface InstallmentSettings {
  id: string;
  product_id: string;
  min_deposit_pct: number;
  eligible_terms: number[];   // parsed from JSON
  monthly_rate: number;       // e.g. 0 = interest-free, 0.03 = 3%/month
  admin_fee: number;          // flat rand amount added to total
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InstallmentApplication {
  id: string;
  ref: string;
  product_id: string;
  product_name: string;
  product_price: number;
  product_imageUrl: string | null;
  quantity: number;
  term_months: number;
  monthly_payment: number;
  deposit: number;
  total_repayable: number;
  name: string;
  phone: string;
  email: string;
  id_number: string;
  address: string;
  status: "new" | "reviewing" | "approved" | "awaiting_payment" | "active" | "completed" | "declined";
  whatsapp_clicked: number;
  admin_notes: string | null;
  createdAt: string;
  updatedAt: string;
}

// ── Calculation ───────────────────────────────────────────────────────────────

export function calcMonthly(
  price: number,
  deposit: number,
  termMonths: number,
  monthlyRate: number,
  adminFee: number
): { monthly: number; total: number; interest: number } {
  const financed = price - deposit + adminFee;
  if (monthlyRate === 0) {
    const monthly = Math.ceil((financed / termMonths) * 100) / 100;
    return { monthly, total: deposit + monthly * termMonths, interest: 0 };
  }
  const r = monthlyRate;
  const n = termMonths;
  const monthly =
    Math.ceil(((financed * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)) * 100) / 100;
  const totalFinanced = monthly * n;
  const interest = Math.round((totalFinanced - financed) * 100) / 100;
  return { monthly, total: deposit + totalFinanced, interest };
}

// ── Settings ──────────────────────────────────────────────────────────────────

function parseSettings(row: Record<string, unknown>): InstallmentSettings {
  return {
    ...row,
    eligible_terms: JSON.parse(row.eligible_terms as string),
    active: row.active === 1,
  } as InstallmentSettings;
}

export function getSettings(productId: string): InstallmentSettings | null {
  const db = getDb();
  const row = db
    .prepare("SELECT * FROM installment_settings WHERE product_id = ? AND active = 1")
    .get(productId) as Record<string, unknown> | undefined;
  return row ? parseSettings(row) : null;
}

export function upsertSettings(data: {
  product_id: string;
  min_deposit_pct: number;
  eligible_terms: number[];
  monthly_rate: number;
  admin_fee: number;
  active: boolean;
}): InstallmentSettings {
  const db = getDb();
  const now = new Date().toISOString();
  const existing = db
    .prepare("SELECT id FROM installment_settings WHERE product_id = ?")
    .get(data.product_id) as { id: string } | undefined;

  if (existing) {
    db.prepare(`
      UPDATE installment_settings
      SET min_deposit_pct = ?, eligible_terms = ?, monthly_rate = ?, admin_fee = ?, active = ?, updatedAt = ?
      WHERE product_id = ?
    `).run(
      data.min_deposit_pct,
      JSON.stringify(data.eligible_terms),
      data.monthly_rate,
      data.admin_fee,
      data.active ? 1 : 0,
      now,
      data.product_id
    );
  } else {
    const id = randomBytes(8).toString("hex");
    db.prepare(`
      INSERT INTO installment_settings
        (id, product_id, min_deposit_pct, eligible_terms, monthly_rate, admin_fee, active, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, data.product_id, data.min_deposit_pct,
      JSON.stringify(data.eligible_terms), data.monthly_rate,
      data.admin_fee, data.active ? 1 : 0, now, now
    );
  }

  return getSettings(data.product_id)!;
}

export function listAllSettings(): InstallmentSettings[] {
  const db = getDb();
  const rows = db
    .prepare("SELECT * FROM installment_settings ORDER BY createdAt DESC")
    .all() as Record<string, unknown>[];
  return rows.map(parseSettings);
}

// ── Applications ──────────────────────────────────────────────────────────────

export function createApplication(data: {
  product_id: string;
  product_name: string;
  product_price: number;
  product_imageUrl?: string | null;
  quantity?: number;
  term_months: number;
  monthly_payment: number;
  deposit: number;
  total_repayable: number;
  name: string;
  phone: string;
  email: string;
  id_number: string;
  address: string;
}): InstallmentApplication {
  const db = getDb();
  const now = new Date().toISOString();
  const id = randomBytes(8).toString("hex");
  const ref = "IA-" + randomBytes(3).toString("hex").toUpperCase();

  db.prepare(`
    INSERT INTO installment_applications
      (id, ref, product_id, product_name, product_price, product_imageUrl, quantity, term_months, monthly_payment,
       deposit, total_repayable, name, phone, email, id_number, address,
       status, whatsapp_clicked, createdAt, updatedAt)
    VALUES
      (@id, @ref, @product_id, @product_name, @product_price, @product_imageUrl, @quantity, @term_months, @monthly_payment,
       @deposit, @total_repayable, @name, @phone, @email, @id_number, @address,
       'new', 0, @now, @now)
  `).run({ id, ref, ...data, product_imageUrl: data.product_imageUrl ?? null, quantity: data.quantity ?? 1, now });

  return getApplication(id)!;
}

export function getApplication(id: string): InstallmentApplication | null {
  const db = getDb();
  const row = db
    .prepare("SELECT * FROM installment_applications WHERE id = ? OR ref = ?")
    .get(id, id) as Record<string, unknown> | undefined;
  return row ? (row as unknown as InstallmentApplication) : null;
}

export function listApplications(): InstallmentApplication[] {
  const db = getDb();
  return db
    .prepare("SELECT * FROM installment_applications ORDER BY createdAt DESC")
    .all() as InstallmentApplication[];
}

export function updateApplicationStatus(
  id: string,
  status: InstallmentApplication["status"],
  adminNotes?: string
): void {
  const db = getDb();
  const now = new Date().toISOString();
  db.prepare(
    "UPDATE installment_applications SET status = ?, admin_notes = COALESCE(?, admin_notes), updatedAt = ? WHERE id = ?"
  ).run(status, adminNotes ?? null, now, id);
}

export function markWhatsappClicked(id: string): void {
  const db = getDb();
  db.prepare(
    "UPDATE installment_applications SET whatsapp_clicked = 1, updatedAt = ? WHERE id = ?"
  ).run(new Date().toISOString(), id);
}

// ── Event Tracking ────────────────────────────────────────────────────────────

export type InstallmentEvent =
  | "eligibility_clicked"
  | "step1_complete"
  | "step2_complete"
  | "application_submitted"
  | "whatsapp_clicked"
  | "term_changed"
  | "abandoned";

export function trackEvent(data: {
  event: InstallmentEvent;
  product_id?: string;
  ref?: string;
  term_months?: number;
  metadata?: Record<string, unknown>;
}): void {
  const db = getDb();
  const id = randomBytes(8).toString("hex");
  db.prepare(`
    INSERT INTO installment_events (id, event, product_id, ref, term_months, metadata, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    id, data.event, data.product_id ?? null,
    data.ref ?? null, data.term_months ?? null,
    data.metadata ? JSON.stringify(data.metadata) : null,
    new Date().toISOString()
  );
}

export function getEventStats(): Record<string, number> {
  const db = getDb();
  const rows = db
    .prepare("SELECT event, COUNT(*) as count FROM installment_events GROUP BY event")
    .all() as { event: string; count: number }[];
  return Object.fromEntries(rows.map(r => [r.event, r.count]));
}
