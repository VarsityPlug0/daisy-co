import { createHmac, timingSafeEqual } from "crypto";
import { getDb } from "./db";

// Marketing / follow-up email opt-out.
//
// Scope: cart-abandonment, delivery follow-up, re-engagement and admin-sent
// campaign emails. It deliberately does NOT block transactional emails about an
// order or installment the person has placed (confirmations, status updates,
// tracking, installment lifecycle) — those remain necessary service messages.
//
// Unsubscribe links carry an HMAC token so nobody can unsubscribe someone else
// by guessing an email address. ADMIN_SECRET is read lazily (never at import
// time) so a missing secret cannot break the build.

const SITE = "https://gadgets.bevanssons.store";

const norm = (email: string) => email.trim().toLowerCase();

function secret(): string {
  const s = process.env.ADMIN_SECRET;
  if (!s) throw new Error("ADMIN_SECRET is required to sign unsubscribe links");
  return s;
}

export function unsubscribeToken(email: string): string {
  return createHmac("sha256", secret()).update("unsubscribe:" + norm(email)).digest("hex").slice(0, 40);
}

export function verifyUnsubscribeToken(email: string, token: string): boolean {
  try {
    const expected = Buffer.from(unsubscribeToken(email));
    const given = Buffer.from(String(token));
    return expected.length === given.length && timingSafeEqual(expected, given);
  } catch {
    return false;
  }
}

export function unsubscribeUrl(email: string): string {
  return `${SITE}/unsubscribe?e=${encodeURIComponent(norm(email))}&t=${unsubscribeToken(email)}`;
}

export function isOptedOut(email: string | null | undefined): boolean {
  if (!email) return false;
  return !!getDb().prepare("SELECT 1 FROM email_optouts WHERE email = ?").get(norm(email));
}

export function recordOptOut(email: string, source: string): void {
  getDb()
    .prepare("INSERT OR IGNORE INTO email_optouts (email, source, createdAt) VALUES (?, ?, ?)")
    .run(norm(email), source, new Date().toISOString());
}

export function listOptOuts(): { email: string; source: string; createdAt: string }[] {
  return getDb().prepare("SELECT email, source, createdAt FROM email_optouts ORDER BY createdAt DESC").all() as {
    email: string; source: string; createdAt: string;
  }[];
}
