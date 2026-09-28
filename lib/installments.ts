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

// Full document-verification status flow. Legacy values ("new", "awaiting_payment", "active")
// are retained so existing application rows remain valid.
export type InstallmentStatus =
  | "new"
  | "reviewing"
  | "awaiting_documents"
  | "documents_received"
  | "verification_pending"
  | "approved"
  | "needs_more_info"
  | "declined"
  | "deposit_pending"
  | "awaiting_payment"
  | "deposit_received"
  | "order_confirmed"
  | "dispatched"
  | "active"
  | "active_installment"
  | "completed";

export const INSTALLMENT_STATUS_LABELS: Record<InstallmentStatus, string> = {
  new: "New",
  reviewing: "Reviewing",
  awaiting_documents: "Awaiting Documents",
  documents_received: "Documents Received",
  verification_pending: "Verification Pending",
  approved: "Approved",
  needs_more_info: "Needs More Information",
  declined: "Declined",
  deposit_pending: "Deposit Pending",
  awaiting_payment: "Awaiting Payment",
  deposit_received: "Deposit Received",
  order_confirmed: "Order Confirmed",
  dispatched: "Dispatched",
  active: "Active",
  active_installment: "Active Installment",
  completed: "Completed",
};

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
  status: InstallmentStatus;
  whatsapp_clicked: number;
  admin_notes: string | null;
  upload_token?: string | null;
  documents_status?: "none" | "awaiting" | "received" | "verified";
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InstallmentDocument {
  id: string;
  ref: string;
  doc_type: "id_card_front" | "id_card_back" | "id_book" | "passport" | "proof_of_address" | "payslip";
  provider: string;
  url: string;
  public_id: string | null;
  filename: string | null;
  mime: string | null;
  size_bytes: number | null;
  uploaded_by: string;
  createdAt: string;
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

// ── Document-verification workflow (Phase 1 helpers) ──────────────────────────

// Generate (once) and return a secure per-application upload token for the customer link.
export function ensureUploadToken(ref: string): string | null {
  const db = getDb();
  const row = db
    .prepare("SELECT upload_token FROM installment_applications WHERE ref = ?")
    .get(ref) as { upload_token: string | null } | undefined;
  if (!row) return null;
  if (row.upload_token) return row.upload_token;
  const token = randomBytes(24).toString("base64url");
  db.prepare("UPDATE installment_applications SET upload_token = ?, updatedAt = ? WHERE ref = ?")
    .run(token, new Date().toISOString(), ref);
  return token;
}

export function getApplicationByToken(token: string): InstallmentApplication | null {
  if (!token) return null;
  const db = getDb();
  const row = db
    .prepare("SELECT * FROM installment_applications WHERE upload_token = ?")
    .get(token) as InstallmentApplication | undefined;
  return row ?? null;
}

export function addDocument(doc: {
  ref: string;
  doc_type: InstallmentDocument["doc_type"];
  url: string;
  public_id?: string | null;
  filename?: string | null;
  mime?: string | null;
  size_bytes?: number | null;
  provider?: string;
  uploaded_by?: string;
}): InstallmentDocument {
  const db = getDb();
  const id = randomBytes(10).toString("hex");
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO installment_documents
      (id, ref, doc_type, provider, url, public_id, filename, mime, size_bytes, uploaded_by, createdAt)
    VALUES (@id, @ref, @doc_type, @provider, @url, @public_id, @filename, @mime, @size_bytes, @uploaded_by, @createdAt)
  `).run({
    id, ref: doc.ref, doc_type: doc.doc_type,
    provider: doc.provider ?? "cloudinary", url: doc.url,
    public_id: doc.public_id ?? null, filename: doc.filename ?? null,
    mime: doc.mime ?? null, size_bytes: doc.size_bytes ?? null,
    uploaded_by: doc.uploaded_by ?? "customer", createdAt: now,
  });
  return db.prepare("SELECT * FROM installment_documents WHERE id = ?").get(id) as InstallmentDocument;
}

export function listDocuments(ref: string): InstallmentDocument[] {
  const db = getDb();
  return db
    .prepare("SELECT * FROM installment_documents WHERE ref = ? ORDER BY createdAt ASC")
    .all(ref) as InstallmentDocument[];
}

// Record a status change in the audit trail. Does not itself change the application row.
export function recordStatusChange(entry: {
  ref: string;
  from_status?: string | null;
  to_status: string;
  changed_by: string;
  note?: string | null;
}): void {
  const db = getDb();
  const id = randomBytes(10).toString("hex");
  db.prepare(`
    INSERT INTO application_status_history (id, ref, from_status, to_status, changed_by, note, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(id, entry.ref, entry.from_status ?? null, entry.to_status, entry.changed_by, entry.note ?? null, new Date().toISOString());
}

export function listStatusHistory(ref: string): Array<{
  id: string; ref: string; from_status: string | null; to_status: string;
  changed_by: string; note: string | null; createdAt: string;
}> {
  const db = getDb();
  return db
    .prepare("SELECT * FROM application_status_history WHERE ref = ? ORDER BY createdAt ASC")
    .all(ref) as never;
}

// Move a fresh application into "awaiting documents" (called when the secure upload link is issued).
export function markAwaitingDocuments(ref: string): void {
  const db = getDb();
  const row = db.prepare("SELECT id, status FROM installment_applications WHERE ref = ?").get(ref) as { id: string; status: string } | undefined;
  if (!row) return;
  const now = new Date().toISOString();
  db.prepare("UPDATE installment_applications SET documents_status = 'awaiting', status = ?, updatedAt = ? WHERE ref = ?")
    .run("awaiting_documents", now, ref);
  recordStatusChange({ ref, from_status: row.status, to_status: "awaiting_documents", changed_by: "system", note: "Secure upload link issued" });
}

// Mark documents received (first customer upload). Only advances early-stage statuses; never overrides
// a later human decision (approved/declined/etc.).
export function markDocumentsReceived(ref: string, note?: string | null): void {
  const db = getDb();
  const row = db.prepare("SELECT id, status FROM installment_applications WHERE ref = ?").get(ref) as { id: string; status: string } | undefined;
  if (!row) return;
  const now = new Date().toISOString();
  const early = ["new", "reviewing", "awaiting_documents"].includes(row.status);
  if (early) {
    db.prepare("UPDATE installment_applications SET documents_status = 'received', status = ?, updatedAt = ? WHERE ref = ?")
      .run("documents_received", now, ref);
    recordStatusChange({ ref, from_status: row.status, to_status: "documents_received", changed_by: "customer", note: note ?? null });
  } else {
    db.prepare("UPDATE installment_applications SET documents_status = 'received', updatedAt = ? WHERE ref = ?")
      .run(now, ref);
    recordStatusChange({ ref, from_status: row.status, to_status: row.status, changed_by: "customer", note: (note ? note + " " : "") + "(additional document uploaded)" });
  }
}

// Human review decision (admin only). Updates status + records who/when + audit trail.
export function reviewApplication(
  id: string,
  status: InstallmentStatus,
  reviewer: string,
  note?: string | null
): boolean {
  const db = getDb();
  const row = db.prepare("SELECT ref, status FROM installment_applications WHERE id = ?").get(id) as
    | { ref: string; status: string }
    | undefined;
  if (!row) return false;
  const now = new Date().toISOString();
  db.prepare(
    "UPDATE installment_applications SET status = ?, admin_notes = COALESCE(?, admin_notes), reviewed_by = ?, reviewed_at = ?, updatedAt = ? WHERE id = ?"
  ).run(status, note ?? null, reviewer, now, now, id);
  recordStatusChange({ ref: row.ref, from_status: row.status, to_status: status, changed_by: reviewer, note: note ?? null });
  return true;
}

// Admin view: documents + status history for one application id.
export function getReviewBundle(id: string): { documents: InstallmentDocument[]; history: ReturnType<typeof listStatusHistory> } | null {
  const db = getDb();
  const row = db.prepare("SELECT ref FROM installment_applications WHERE id = ?").get(id) as { ref: string } | undefined;
  if (!row) return null;
  return { documents: listDocuments(row.ref), history: listStatusHistory(row.ref) };
}
