import { randomUUID } from "crypto";
import { getDb } from "./db";
import { sendCampaignEmail } from "./mailer";

const SITE = "https://gadgets.bevanssons.store";

type OrderItem = { id: string; name: string; price: string; qty: number; imageUrl?: string };

function alreadySent(
  db: ReturnType<typeof getDb>,
  email: string,
  type: string,
  ref?: string
): boolean {
  if (ref) {
    return !!db.prepare(
      "SELECT id FROM email_sends WHERE LOWER(email) = ? AND type = ? AND ref = ?"
    ).get(email.toLowerCase(), type, ref);
  }
  const cutoff = new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString();
  return !!db.prepare(
    "SELECT id FROM email_sends WHERE LOWER(email) = ? AND type = ? AND createdAt > ?"
  ).get(email.toLowerCase(), type, cutoff);
}

function recordSend(
  db: ReturnType<typeof getDb>,
  opts: { id: string; email: string; type: string; ref?: string; subject: string }
) {
  db.prepare(`
    INSERT OR IGNORE INTO email_sends (id, email, type, ref, subject, createdAt)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(opts.id, opts.email.toLowerCase(), opts.type, opts.ref ?? null, opts.subject, new Date().toISOString());
}

export async function runFollowUps(): Promise<{ sent: number; skipped: number }> {
  const db = getDb();
  let sent = 0;
  let skipped = 0;

  // ── 1. Cart abandonment (24 – 72 h after adding to cart, no order placed) ──
  const abandoned = db.prepare(`
    WITH cart_summary AS (
      SELECT v.email, v.name, MAX(ce.createdAt) AS lastAdded
      FROM cart_events ce
      JOIN visitors v ON v.id = ce.visitorId
      WHERE v.email IS NOT NULL
        AND TRIM(v.email) != ''
        AND ce.createdAt < datetime('now', '-24 hours')
        AND ce.createdAt > datetime('now', '-72 hours')
      GROUP BY LOWER(v.email)
    )
    SELECT email, name, lastAdded
    FROM cart_summary cs
    WHERE NOT EXISTS (
      SELECT 1 FROM orders o
      WHERE LOWER(o.email) = LOWER(cs.email)
        AND o.createdAt > cs.lastAdded
    )
  `).all() as { email: string; name: string; lastAdded: string }[];

  for (const row of abandoned) {
    const ref = row.lastAdded.slice(0, 10); // date as dedup key
    if (alreadySent(db, row.email, "cart_abandon_1d", ref)) { skipped++; continue; }

    const items = db.prepare(`
      SELECT DISTINCT ce.productId AS id, ce.productName AS name, ce.price, 1 AS qty
      FROM cart_events ce
      JOIN visitors v ON v.id = ce.visitorId
      WHERE LOWER(v.email) = ?
      ORDER BY ce.createdAt DESC
      LIMIT 6
    `).all(row.email.toLowerCase()) as OrderItem[];

    const sendId = randomUUID();
    const firstName = (row.name ?? "there").split(" ")[0];
    const subject = `${firstName}, you left something behind — Bevanssons`;
    const encoded = Buffer.from(JSON.stringify(items)).toString("base64");
    const restoreUrl = `${SITE}/restore-cart?items=${encoded}`;

    try {
      await sendCampaignEmail({
        to: row.email,
        name: row.name ?? "there",
        subject,
        heading: "Your cart is waiting for you",
        body: `Hi ${firstName},\n\nYou browsed some great products but didn't complete your order. Your items are still available — grab them before they sell out!`,
        ctaText: "Complete Your Order",
        ctaUrl: restoreUrl,
        orderItems: items,
        restoreCartUrl: restoreUrl,
        trackingId: sendId,
      });
      recordSend(db, { id: sendId, email: row.email, type: "cart_abandon_1d", ref, subject });
      sent++;
    } catch (e) {
      console.error("[followups] cart_abandon_1d error:", e);
    }
  }

  // ── 2. Post-delivery review request (3 – 14 days after delivery) ──────────
  const delivered = db.prepare(`
    SELECT id, ref, email, name FROM orders
    WHERE status = 'delivered'
      AND updatedAt < datetime('now', '-3 days')
      AND updatedAt > datetime('now', '-14 days')
  `).all() as { id: string; ref: string; email: string; name: string }[];

  for (const order of delivered) {
    if (alreadySent(db, order.email, "delivery_followup", order.ref)) { skipped++; continue; }

    const sendId = randomUUID();
    const firstName = order.name.split(" ")[0];
    const subject = `How was your order, ${firstName}? — Bevanssons`;

    try {
      await sendCampaignEmail({
        to: order.email,
        name: order.name,
        subject,
        heading: "How was your experience?",
        body: `Hi ${firstName},\n\nYour order ${order.ref} was delivered recently and we hope you're loving it! 🎉\n\nWe'd love to hear your feedback — it takes less than a minute and helps us serve you better.`,
        ctaText: "Leave a Review",
        ctaUrl: `${SITE}/reviews`,
        trackingId: sendId,
      });
      recordSend(db, { id: sendId, email: order.email, type: "delivery_followup", ref: order.ref, subject });
      sent++;
    } catch (e) {
      console.error("[followups] delivery_followup error:", e);
    }
  }

  // ── 3. Re-engagement (30 – 60 days since last paid order, no recent send) ──
  const inactive = db.prepare(`
    SELECT email, name, MAX(createdAt) AS lastOrder
    FROM orders
    WHERE status IN ('approved', 'shipped', 'delivered')
    GROUP BY LOWER(email)
    HAVING lastOrder < datetime('now', '-30 days')
      AND lastOrder > datetime('now', '-60 days')
  `).all() as { email: string; name: string; lastOrder: string }[];

  for (const customer of inactive) {
    if (alreadySent(db, customer.email, "reengagement_30d")) { skipped++; continue; }

    const sendId = randomUUID();
    const firstName = customer.name.split(" ")[0];
    const subject = `We miss you, ${firstName}! — Bevanssons`;

    try {
      await sendCampaignEmail({
        to: customer.email,
        name: customer.name,
        subject,
        heading: `We miss you, ${firstName}!`,
        body: `Hi ${firstName},\n\nIt's been a while since your last order and we wanted to check in.\n\nWe have amazing new arrivals and deals that we think you'll love. Come back and see what's new!`,
        ctaText: "Shop New Arrivals",
        ctaUrl: `${SITE}/new-arrivals`,
        trackingId: sendId,
      });
      recordSend(db, { id: sendId, email: customer.email, type: "reengagement_30d", subject });
      sent++;
    } catch (e) {
      console.error("[followups] reengagement_30d error:", e);
    }
  }

  console.log(`[followups] sent=${sent} skipped=${skipped}`);
  return { sent, skipped };
}
