import { getDb } from "./db";
import { createHash, randomBytes } from "crypto";

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

// Admin status change by id OR ref. getApplication() accepts either, but reviewApplication()
// updates by id only — passing a ref used to change nothing while the route still answered
// {ok:true} and emailed the customer. Returns before/after, or null when nothing was written.
export function adminSetApplicationStatus(
  idOrRef: string,
  status: InstallmentStatus,
  reviewer: string,
  note?: string | null
): { before: InstallmentApplication; after: InstallmentApplication } | null {
  const before = getApplication(idOrRef);
  if (!before) return null;
  if (!reviewApplication(before.id, status, reviewer, note)) return null;
  const after = getApplication(before.id);
  return after && after.status === status ? { before, after } : null;
}

// ─── Integration API: owner-commanded status changes (Bevans) ──────────────────

export const INSTALLMENT_STATUSES = Object.keys(INSTALLMENT_STATUS_LABELS) as InstallmentStatus[];
export const INSTALLMENT_REF_RE = /^IA-[0-9A-F]{6}$/;

// The only status changes the integration write API will make. Anything else is refused.
export const INTEGRATION_STATUS_TRANSITIONS: Partial<Record<InstallmentStatus, InstallmentStatus[]>> = {
  reviewing: ["approved", "declined"],
  awaiting_payment: ["approved", "active"],
  approved: ["active"],
};

export function isIntegrationTransitionAllowed(from: string, to: string): boolean {
  return (INTEGRATION_STATUS_TRANSITIONS[from as InstallmentStatus] ?? []).includes(to as InstallmentStatus);
}

function last9Digits(raw: string): string {
  return String(raw ?? "").replace(/\D/g, "").slice(-9);
}

// What the integration API may expose about an application: never the ID number, address,
// email, full name, full phone, upload token or free-text admin notes.
export interface PublicApplication {
  ref: string;
  product_name: string;
  product_price: number;
  quantity: number;
  term_months: number;
  monthly_payment: number;
  deposit: number;
  total_repayable: number;
  status: InstallmentStatus;
  documents_status: string;
  first_name: string;
  phone_masked: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  createdAt: string;
  updatedAt: string;
}

export function toPublicApplication(app: InstallmentApplication): PublicApplication {
  const digits = String(app.phone ?? "").replace(/\D/g, "");
  return {
    ref: app.ref,
    product_name: app.product_name,
    product_price: app.product_price,
    quantity: app.quantity ?? 1,
    term_months: app.term_months,
    monthly_payment: app.monthly_payment,
    deposit: app.deposit,
    total_repayable: app.total_repayable,
    status: app.status,
    documents_status: app.documents_status ?? "none",
    first_name: String(app.name ?? "").trim().split(/\s+/)[0] || "",
    phone_masked: digits ? `…${digits.slice(-3)}` : "",
    reviewed_by: app.reviewed_by ?? null,
    reviewed_at: app.reviewed_at ?? null,
    createdAt: app.createdAt,
    updatedAt: app.updatedAt,
  };
}

export interface IntegrationApplicationView {
  application: PublicApplication;
  history: ReturnType<typeof listStatusHistory>;
  siblings: Array<{ ref: string; product_name: string; status: string; createdAt: string }>;
  relatedOrders: Array<{
    ref: string; status: string; total: number; tracking_number: string | null;
    has_proof: boolean; has_eft_reference: boolean; createdAt: string; match: "phone" | "notes";
  }>;
  signals: { dispatched: boolean; paymentRecorded: boolean; notesMentionDepositPaid: boolean };
}

// One application by ref plus what an owner must see before changing it: other applications on
// the same phone, orders that may belong to it (same phone, or a tracking number/ref named in the
// admin notes — Gadgets has no structured link), and payment/dispatch signals. Gadgets has no
// deposit-received record, so paymentRecorded only reflects proof/EFT reference on those orders.
export function getIntegrationApplicationView(ref: string): IntegrationApplicationView | null {
  const db = getDb();
  const app = db.prepare("SELECT * FROM installment_applications WHERE ref = ?").get(ref) as InstallmentApplication | undefined;
  if (!app) return null;
  const key = last9Digits(app.phone);
  const notes = String(app.admin_notes ?? "");

  const others = db
    .prepare("SELECT ref, product_name, status, createdAt, phone FROM installment_applications WHERE ref != ? ORDER BY createdAt")
    .all(ref) as Array<{ ref: string; product_name: string; status: string; createdAt: string; phone: string }>;
  const siblings = key.length === 9
    ? others.filter((o) => last9Digits(o.phone) === key).map((o) => ({ ref: o.ref, product_name: o.product_name, status: o.status, createdAt: o.createdAt }))
    : [];

  const orders = db
    .prepare("SELECT ref, status, total, tracking_number, proof_url, eft_reference, createdAt, phone FROM orders ORDER BY createdAt")
    .all() as Array<{
      ref: string; status: string; total: number; tracking_number: string | null;
      proof_url: string | null; eft_reference: string | null; createdAt: string; phone: string;
    }>;
  const relatedOrders = orders.flatMap((o) => {
    const byNotes = Boolean(o.tracking_number && notes.includes(o.tracking_number)) || notes.includes(o.ref);
    const byPhone = key.length === 9 && last9Digits(o.phone) === key;
    if (!byNotes && !byPhone) return [];
    return [{
      ref: o.ref, status: o.status, total: o.total, tracking_number: o.tracking_number,
      has_proof: Boolean(o.proof_url), has_eft_reference: Boolean(o.eft_reference), createdAt: o.createdAt,
      match: byNotes ? ("notes" as const) : ("phone" as const),
    }];
  });

  return {
    application: toPublicApplication(app),
    history: listStatusHistory(ref),
    siblings,
    relatedOrders,
    signals: {
      dispatched: app.status === "dispatched" || relatedOrders.some((o) => ["shipped", "delivered"].includes(o.status)),
      paymentRecorded: relatedOrders.some((o) => o.has_proof || o.has_eft_reference),
      notesMentionDepositPaid: /deposit\s+(paid|received)/i.test(notes),
    },
  };
}

type IntegrationStatusChangeSuccess = {
  ok: true; replayed: boolean; historyId: string;
  fromStatus: InstallmentStatus; toStatus: InstallmentStatus; application: PublicApplication;
};
export type IntegrationStatusChangeResult =
  | IntegrationStatusChangeSuccess
  | {
      ok: false; httpStatus: 404 | 409 | 422;
      code: "NOT_FOUND" | "STALE_STATUS" | "TRANSITION_NOT_ALLOWED" | "IDEMPOTENCY_KEY_REUSED";
      error: string; currentStatus?: string;
    };

// One owner-commanded status change, atomically: allowed transition, compare-and-set on the
// expected status, exactly one row changed, status-history entry, idempotency record. A repeated
// idempotency key returns the stored result and writes nothing. Never notifies the customer.
export function changeStatusViaIntegration(input: {
  ref: string;
  expectedStatus: InstallmentStatus;
  toStatus: InstallmentStatus;
  reason: string;
  actor: string;
  idempotencyKey: string;
}): IntegrationStatusChangeResult {
  const db = getDb();
  const requestHash = createHash("sha256")
    .update(JSON.stringify([input.ref, input.expectedStatus, input.toStatus, input.reason, input.actor]))
    .digest("hex");

  const run = db.transaction((): IntegrationStatusChangeResult => {
    const prior = db.prepare("SELECT request_hash, response_json FROM integration_write_requests WHERE idempotency_key = ?")
      .get(input.idempotencyKey) as { request_hash: string; response_json: string } | undefined;
    if (prior) {
      if (prior.request_hash !== requestHash) {
        return { ok: false, httpStatus: 409, code: "IDEMPOTENCY_KEY_REUSED", error: "idempotency key already used for a different request" };
      }
      return { ...(JSON.parse(prior.response_json) as IntegrationStatusChangeSuccess), replayed: true };
    }

    const app = db.prepare("SELECT * FROM installment_applications WHERE ref = ?").get(input.ref) as InstallmentApplication | undefined;
    if (!app) return { ok: false, httpStatus: 404, code: "NOT_FOUND", error: "application not found" };
    if (!isIntegrationTransitionAllowed(input.expectedStatus, input.toStatus)) {
      return {
        ok: false, httpStatus: 422, code: "TRANSITION_NOT_ALLOWED",
        error: `${input.expectedStatus} -> ${input.toStatus} is not an allowed transition`, currentStatus: app.status,
      };
    }
    if (app.status !== input.expectedStatus) {
      return { ok: false, httpStatus: 409, code: "STALE_STATUS", error: `status is ${app.status}, expected ${input.expectedStatus}`, currentStatus: app.status };
    }

    const now = new Date().toISOString();
    const changed = db.prepare(
      "UPDATE installment_applications SET status = ?, reviewed_by = ?, reviewed_at = ?, updatedAt = ? WHERE ref = ? AND status = ?"
    ).run(input.toStatus, input.actor, now, now, input.ref, input.expectedStatus);
    if (changed.changes !== 1) {
      const current = db.prepare("SELECT status FROM installment_applications WHERE ref = ?").get(input.ref) as { status: string } | undefined;
      return { ok: false, httpStatus: 409, code: "STALE_STATUS", error: "application changed during the update", currentStatus: current?.status };
    }

    const historyId = randomBytes(10).toString("hex");
    db.prepare(`
      INSERT INTO application_status_history (id, ref, from_status, to_status, changed_by, note, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(historyId, input.ref, input.expectedStatus, input.toStatus, input.actor, `${input.reason} [idempotency:${input.idempotencyKey}]`, now);

    const updated = db.prepare("SELECT * FROM installment_applications WHERE ref = ?").get(input.ref) as InstallmentApplication;
    const result: IntegrationStatusChangeSuccess = {
      ok: true, replayed: false, historyId, fromStatus: input.expectedStatus, toStatus: input.toStatus,
      application: toPublicApplication(updated),
    };
    db.prepare("INSERT INTO integration_write_requests (idempotency_key, ref, request_hash, response_json, createdAt) VALUES (?, ?, ?, ?, ?)")
      .run(input.idempotencyKey, input.ref, requestHash, JSON.stringify(result), now);
    return result;
  });

  return run();
}
