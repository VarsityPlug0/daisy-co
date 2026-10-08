import { createHmac, timingSafeEqual } from "crypto";
import type { NextRequest } from "next/server";
import { getDb } from "./db";

// Auth for the read-only Gadgets -> Bevans OS integration API
// (app/api/integration/v1/**). Separate, narrower-scoped secret from
// GADGETS_EVENTS_SECRET (which signs the outbound outbox push in the other
// direction) and from ADMIN_SECRET/ADMIN_PASSWORD (interactive admin
// sessions) — this one exists only so a server-to-server reader (Bevans
// Admin, later) can authenticate without logging in as an admin user.
const SECRET = process.env.GADGETS_INTEGRATION_SECRET;

export function isIntegrationAuthenticated(req: NextRequest): boolean {
  if (!SECRET) return false; // unset in this environment -> fail closed, not open

  const header = req.headers.get("x-integration-secret") ?? "";
  const a = Buffer.from(header);
  const b = Buffer.from(SECRET);
  if (a.length !== b.length) return false;

  try {
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

// Auth for SIGNED integration writes (app/api/integration/v1/installments/[ref]/status).
// A separate, write-only secret: the read secret above can never change data.
// Signature = hex HMAC-SHA256(secret, `${timestamp}.${nonce}.${rawBody}`), sent as
// x-integration-timestamp (ms), x-integration-nonce, x-integration-signature.
// Rejected when: the secret is unset or equal to the read secret (fail closed), the
// timestamp is more than 5 minutes off, the signature is wrong, or the nonce was seen.
export const WRITE_MAX_SKEW_MS = 5 * 60 * 1000;
const NONCE_RE = /^[A-Za-z0-9_-]{16,128}$/;

export type WriteAuthResult = { ok: true } | { ok: false; error: string };

function writeSecret(): string | null {
  const s = process.env.GADGETS_INTEGRATION_WRITE_SECRET;
  if (!s || s.length < 32) return null;
  if (s === process.env.GADGETS_INTEGRATION_SECRET) return null;
  return s;
}

export function signIntegrationWrite(secret: string, timestamp: string, nonce: string, rawBody: string): string {
  return createHmac("sha256", secret).update(`${timestamp}.${nonce}.${rawBody}`).digest("hex");
}

export function verifyIntegrationWrite(headers: Headers, rawBody: string, now: number = Date.now()): WriteAuthResult {
  const secret = writeSecret();
  if (!secret) return { ok: false, error: "write API not configured" };

  const timestamp = headers.get("x-integration-timestamp") ?? "";
  const nonce = headers.get("x-integration-nonce") ?? "";
  const signature = headers.get("x-integration-signature") ?? "";
  const ts = Number(timestamp);
  if (!/^\d{13}$/.test(timestamp) || Math.abs(now - ts) > WRITE_MAX_SKEW_MS) return { ok: false, error: "stale or missing timestamp" };
  if (!NONCE_RE.test(nonce)) return { ok: false, error: "missing or malformed nonce" };

  const expected = Buffer.from(signIntegrationWrite(secret, timestamp, nonce, rawBody));
  const given = Buffer.from(signature);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return { ok: false, error: "invalid signature" };

  // Only a correctly signed request reaches the nonce table, so junk cannot fill it.
  const db = getDb();
  db.prepare("DELETE FROM integration_nonces WHERE createdAt < ?").run(new Date(now - 2 * WRITE_MAX_SKEW_MS).toISOString());
  const claimed = db.prepare("INSERT OR IGNORE INTO integration_nonces (nonce, createdAt) VALUES (?, ?)").run(nonce, new Date(now).toISOString());
  if (claimed.changes !== 1) return { ok: false, error: "replayed nonce" };
  return { ok: true };
}

export interface Pagination {
  page: number;
  limit: number;
}

const MAX_LIMIT = 100;
const DEFAULT_LIMIT = 25;

// Returns null if the params are present but invalid (caller should 400).
export function parsePagination(req: NextRequest): Pagination | null {
  const { searchParams } = new URL(req.url);
  const pageRaw = searchParams.get("page");
  const limitRaw = searchParams.get("limit");

  let page = 1;
  if (pageRaw !== null) {
    page = Number(pageRaw);
    if (!Number.isInteger(page) || page < 1) return null;
  }

  let limit = DEFAULT_LIMIT;
  if (limitRaw !== null) {
    limit = Number(limitRaw);
    if (!Number.isInteger(limit) || limit < 1 || limit > MAX_LIMIT) return null;
  }

  return { page, limit };
}
