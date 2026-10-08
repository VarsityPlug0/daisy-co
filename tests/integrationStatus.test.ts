// Integration status API + admin status fix. Runs against a throwaway SQLite database in a temp
// DATA_DIR with dummy applications — never a real customer record.
//   npm run test:integration
import { test, before, after, describe } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { createHmac, randomBytes } from "node:crypto";

const dataDir = mkdtempSync(path.join(tmpdir(), "gadgets-integration-test-"));
process.env.DATA_DIR = dataDir;
process.env.GADGETS_INTEGRATION_SECRET = "read-secret-for-tests-".padEnd(48, "r");
process.env.GADGETS_INTEGRATION_WRITE_SECRET = "write-secret-for-tests-".padEnd(64, "w");
const WRITE_SECRET = process.env.GADGETS_INTEGRATION_WRITE_SECRET;

type Lib = typeof import("../lib/installments");
let lib: Lib;
let db: ReturnType<typeof import("../lib/db").getDb>;
let NextRequestCtor: typeof import("next/server").NextRequest;
let statusPOST: typeof import("../app/api/integration/v1/installments/[ref]/status/route").POST;
let readGET: typeof import("../app/api/integration/v1/installments/[ref]/route").GET;

const DUMMY_PHONE = "0820000000"; // placeholder, not a real customer

function seedApplication(status: string, overrides: Partial<{ phone: string; name: string; admin_notes: string }> = {}) {
  const app = lib.createApplication({
    product_id: "test-product", product_name: "Test Phone 128GB", product_price: 10000, term_months: 12,
    monthly_payment: 750, deposit: 1000, total_repayable: 10000, name: overrides.name ?? "Testy McTestface",
    phone: overrides.phone ?? DUMMY_PHONE, email: "test@example.invalid", id_number: "0000000000000", address: "1 Test Street",
  });
  db.prepare("UPDATE installment_applications SET status = ?, admin_notes = ? WHERE ref = ?").run(status, overrides.admin_notes ?? null, app.ref);
  return app.ref;
}

function seedOrder(ref: string, status: string, phone: string, extra: Partial<{ tracking_number: string; proof_url: string; eft_reference: string }> = {}) {
  const now = new Date().toISOString();
  db.prepare(`INSERT INTO orders (id, ref, name, email, phone, address, items, total, status, payment_method, proof_url, eft_reference, tracking_number, createdAt, updatedAt)
              VALUES (?, ?, 'Test', 'test@example.invalid', ?, '', '[]', 5000, ?, 'eft', ?, ?, ?, ?, ?)`)
    .run(randomBytes(8).toString("hex"), ref, phone, status, extra.proof_url ?? null, extra.eft_reference ?? null, extra.tracking_number ?? null, now, now);
}

const historyFor = (ref: string) =>
  db.prepare("SELECT * FROM application_status_history WHERE ref = ? ORDER BY createdAt").all(ref) as Array<Record<string, string>>;
const statusOf = (ref: string) => (db.prepare("SELECT status FROM installment_applications WHERE ref = ?").get(ref) as { status: string }).status;

function writeRequest(ref: string, body: unknown, opts: { secret?: string; timestamp?: number; nonce?: string; rawBody?: string } = {}) {
  const rawBody = opts.rawBody ?? JSON.stringify(body);
  const timestamp = String(opts.timestamp ?? Date.now());
  const nonce = opts.nonce ?? randomBytes(16).toString("hex");
  const signature = createHmac("sha256", opts.secret ?? WRITE_SECRET).update(`${timestamp}.${nonce}.${JSON.stringify(body)}`).digest("hex");
  const req = new NextRequestCtor(`http://localhost/api/integration/v1/installments/${ref}/status`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-integration-timestamp": timestamp, "x-integration-nonce": nonce, "x-integration-signature": signature },
    body: rawBody,
  });
  return statusPOST(req, { params: Promise.resolve({ ref }) });
}

function body(overrides: Record<string, unknown> = {}) {
  return {
    expectedStatus: "reviewing", toStatus: "approved", reason: "Owner approved via WhatsApp (test)",
    actor: "bevans-owner-whatsapp", idempotencyKey: `test-${randomBytes(8).toString("hex")}`, notifyCustomer: false, ...overrides,
  };
}

function readRequest(ref: string, secret = process.env.GADGETS_INTEGRATION_SECRET as string) {
  const req = new NextRequestCtor(`http://localhost/api/integration/v1/installments/${ref}`, { headers: { "x-integration-secret": secret } });
  return readGET(req, { params: Promise.resolve({ ref }) });
}

before(async () => {
  ({ NextRequest: NextRequestCtor } = await import("next/server"));
  lib = await import("../lib/installments");
  db = (await import("../lib/db")).getDb();
  ({ POST: statusPOST } = await import("../app/api/integration/v1/installments/[ref]/status/route"));
  ({ GET: readGET } = await import("../app/api/integration/v1/installments/[ref]/route"));
});

after(() => {
  try { db.close(); } catch { /* already closed */ }
  rmSync(dataDir, { recursive: true, force: true });
});

describe("status model", () => {
  test("allowed transitions use only statuses that exist in the Gadgets enum", () => {
    for (const [from, tos] of Object.entries(lib.INTEGRATION_STATUS_TRANSITIONS)) {
      assert.ok(lib.INSTALLMENT_STATUSES.includes(from as never), from);
      for (const to of tos ?? []) assert.ok(lib.INSTALLMENT_STATUSES.includes(to), to);
    }
    assert.ok(!lib.INSTALLMENT_STATUSES.includes("cancelled" as never), "cancelled is not a Gadgets status");
  });
});

describe("POST /installments/{ref}/status", () => {
  test("allowed transition: updates the status, writes one history entry, returns the safe projection", async () => {
    const ref = seedApplication("reviewing");
    const b = body();
    const res = await writeRequest(ref, b);
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.ok, true);
    assert.equal(json.replayed, false);
    assert.equal(json.fromStatus, "reviewing");
    assert.equal(json.toStatus, "approved");
    assert.equal(json.application.status, "approved");
    for (const k of ["id_number", "address", "email", "phone", "name", "admin_notes", "upload_token"]) assert.ok(!(k in json.application), k);
    assert.equal(statusOf(ref), "approved");
    const h = historyFor(ref);
    assert.equal(h.length, 1);
    assert.equal(h[0].id, json.historyId);
    assert.equal(h[0].from_status, "reviewing");
    assert.equal(h[0].to_status, "approved");
    assert.equal(h[0].changed_by, "bevans-owner-whatsapp");
    assert.ok(h[0].note.includes(`[idempotency:${b.idempotencyKey}]`));
  });

  test("refused transition: 422, nothing changes", async () => {
    const ref = seedApplication("reviewing");
    const res = await writeRequest(ref, body({ toStatus: "active" }));
    assert.equal(res.status, 422);
    assert.equal((await res.json()).code, "TRANSITION_NOT_ALLOWED");
    assert.equal(statusOf(ref), "reviewing");
    assert.equal(historyFor(ref).length, 0);
  });

  test("status that does not exist (cancelled): 400, nothing changes", async () => {
    const ref = seedApplication("awaiting_payment");
    const res = await writeRequest(ref, body({ expectedStatus: "awaiting_payment", toStatus: "cancelled" }));
    assert.equal(res.status, 400);
    assert.equal(statusOf(ref), "awaiting_payment");
  });

  test("stale expectedStatus: 409 with the current status, nothing changes", async () => {
    const ref = seedApplication("approved");
    const res = await writeRequest(ref, body({ expectedStatus: "reviewing", toStatus: "approved" }));
    assert.equal(res.status, 409);
    const json = await res.json();
    assert.equal(json.code, "STALE_STATUS");
    assert.equal(json.currentStatus, "approved");
    assert.equal(historyFor(ref).length, 0);
  });

  test("nonexistent application: 404", async () => {
    const res = await writeRequest("IA-000000", body());
    assert.equal(res.status, 404);
    assert.equal((await res.json()).code, "NOT_FOUND");
  });

  test("repeated idempotency key: original result, no second history entry; key reuse for another request is refused", async () => {
    const ref = seedApplication("awaiting_payment");
    const b = body({ expectedStatus: "awaiting_payment", toStatus: "active" });
    const first = await (await writeRequest(ref, b)).json();
    const again = await writeRequest(ref, b);
    assert.equal(again.status, 200);
    const second = await again.json();
    assert.equal(second.replayed, true);
    assert.equal(second.historyId, first.historyId);
    assert.equal(historyFor(ref).length, 1);
    const reused = await writeRequest(ref, { ...b, toStatus: "approved" });
    assert.equal(reused.status, 409);
    assert.equal((await reused.json()).code, "IDEMPOTENCY_KEY_REUSED");
    assert.equal(statusOf(ref), "active");
  });

  test("notifyCustomer must be false", async () => {
    const ref = seedApplication("reviewing");
    const res = await writeRequest(ref, body({ notifyCustomer: true }));
    assert.equal(res.status, 400);
    assert.equal(statusOf(ref), "reviewing");
  });
});

describe("write authentication (HMAC timestamp + nonce + body)", () => {
  test("expired timestamp (6 minutes old): 401, nothing changes", async () => {
    const ref = seedApplication("reviewing");
    const res = await writeRequest(ref, body(), { timestamp: Date.now() - 6 * 60 * 1000 });
    assert.equal(res.status, 401);
    assert.equal(statusOf(ref), "reviewing");
  });

  test("invalid signature (wrong secret): 401", async () => {
    const ref = seedApplication("reviewing");
    const res = await writeRequest(ref, body(), { secret: "not-the-write-secret".padEnd(64, "x") });
    assert.equal(res.status, 401);
    assert.equal(statusOf(ref), "reviewing");
  });

  test("tampered body (signature over a different body): 401", async () => {
    const ref = seedApplication("reviewing");
    const signed = body();
    const res = await writeRequest(ref, signed, { rawBody: JSON.stringify({ ...signed, toStatus: "declined" }) });
    assert.equal(res.status, 401);
    assert.equal(statusOf(ref), "reviewing");
  });

  test("read secret cannot sign writes", async () => {
    const ref = seedApplication("reviewing");
    const res = await writeRequest(ref, body(), { secret: process.env.GADGETS_INTEGRATION_SECRET });
    assert.equal(res.status, 401);
  });

  test("replayed nonce: 401 the second time", async () => {
    const ref = seedApplication("reviewing");
    const nonce = randomBytes(16).toString("hex");
    const b = body();
    assert.equal((await writeRequest(ref, b, { nonce })).status, 200);
    assert.equal((await writeRequest(ref, b, { nonce })).status, 401);
    assert.equal(historyFor(ref).length, 1);
  });

  test("fails closed when the write secret is unset or equal to the read secret", async () => {
    const ref = seedApplication("reviewing");
    const saved = process.env.GADGETS_INTEGRATION_WRITE_SECRET;
    try {
      delete process.env.GADGETS_INTEGRATION_WRITE_SECRET;
      assert.equal((await writeRequest(ref, body())).status, 401);
      process.env.GADGETS_INTEGRATION_WRITE_SECRET = process.env.GADGETS_INTEGRATION_SECRET;
      assert.equal((await writeRequest(ref, body(), { secret: process.env.GADGETS_INTEGRATION_SECRET })).status, 401);
    } finally {
      process.env.GADGETS_INTEGRATION_WRITE_SECRET = saved;
    }
    assert.equal(statusOf(ref), "reviewing");
  });
});

describe("GET /installments/{ref}", () => {
  test("returns the safe view with siblings, related orders and dispatch/payment signals", async () => {
    const phone = "0820000111";
    const ref = seedApplication("dispatched", { phone, admin_notes: "Deposit paid. Tracking number: DGC-TEST-0001" });
    const sibling = seedApplication("awaiting_payment", { phone: `+27${phone.slice(1)}` });
    seedOrder("DGC-TEST-0001", "shipped", "0000000000", { tracking_number: "DGC-TEST-0001" });
    const res = await readRequest(ref);
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.sourceSystem, "GADGETS");
    assert.equal(json.application.ref, ref);
    assert.equal(json.application.first_name, "Testy");
    assert.equal(json.application.phone_masked, "…111");
    assert.deepEqual(json.siblings.map((s: { ref: string }) => s.ref), [sibling]);
    assert.equal(json.relatedOrders.length, 1);
    assert.equal(json.relatedOrders[0].match, "notes");
    assert.equal(json.signals.dispatched, true);
    assert.equal(json.signals.paymentRecorded, false);
    assert.equal(json.signals.notesMentionDepositPaid, true);
    const text = JSON.stringify(json);
    for (const secret of ["0000000000000", "1 Test Street", "test@example.invalid", "0820000111"]) assert.ok(!text.includes(secret), secret);
  });

  test("wrong secret 401, bad reference 400, unknown reference 404", async () => {
    assert.equal((await readRequest("IA-ABC123", "wrong".padEnd(48, "x"))).status, 401);
    assert.equal((await readRequest("ia-abc123")).status, 400);
    assert.equal((await readRequest("IA-000001")).status, 404);
  });
});

describe("admin status change (PATCH /api/admin/installments/[id]) bug fix", () => {
  test("root cause: reviewApplication() with a ref changes nothing", () => {
    const ref = seedApplication("reviewing");
    assert.equal(lib.reviewApplication(ref, "approved", "admin"), false);
    assert.equal(statusOf(ref), "reviewing");
  });

  test("adminSetApplicationStatus works with a ref or an id, and records history", () => {
    const ref = seedApplication("reviewing");
    const byRef = lib.adminSetApplicationStatus(ref, "approved", "admin", "test");
    assert.ok(byRef);
    assert.equal(byRef.after.status, "approved");
    assert.equal(statusOf(ref), "approved");
    const id = (db.prepare("SELECT id FROM installment_applications WHERE ref = ?").get(ref) as { id: string }).id;
    assert.equal(lib.adminSetApplicationStatus(id, "active", "admin")?.after.status, "active");
    assert.deepEqual(historyFor(ref).map((h) => h.to_status), ["approved", "active"]);
  });

  test("adminSetApplicationStatus returns null for an unknown application", () => {
    assert.equal(lib.adminSetApplicationStatus("IA-FFFFF0", "approved", "admin"), null);
  });
});
