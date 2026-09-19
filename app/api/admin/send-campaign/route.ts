import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { listOrders } from "@/lib/orders";
import { sendCampaignEmail } from "@/lib/mailer";
import { isOptedOut } from "@/lib/optout";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { subject, heading, body: emailBody, ctaText, ctaUrl, recipients, customEmail, featuredProducts, includeOrderItems, cartItems } = body;

  if (!subject || !heading || !emailBody) {
    return NextResponse.json({ error: "subject, heading and body are required" }, { status: 400 });
  }

  // Build recipient list
  type Target = { email: string; name: string };
  let targets: Target[] = [];

  const db = getDb();

  if (recipients === "custom") {
    if (!customEmail || !customEmail.includes("@")) {
      return NextResponse.json({ error: "Valid email required for custom recipient" }, { status: 400 });
    }
    // Look up name from orders if we have it
    const existing = db.prepare("SELECT name FROM orders WHERE email = ? ORDER BY createdAt DESC LIMIT 1")
      .get(customEmail.toLowerCase()) as { name: string } | undefined;
    targets = [{ email: customEmail, name: existing?.name ?? "there" }];
  } else {
    const orders = listOrders();
    const seen = new Set<string>();
    for (const o of orders) {
      const key = o.email.toLowerCase();
      if (seen.has(key)) continue;
      if (recipients === "pending" && o.status !== "pending" && o.status !== "proof_submitted") continue;
      seen.add(key);
      targets.push({ email: o.email, name: o.name });
    }
  }

  // Honour unsubscribes: never send campaign email to an address that opted out.
  const totalBeforeOptOut = targets.length;
  targets = targets.filter((t) => !isOptedOut(t.email));
  const skippedUnsubscribed = totalBeforeOptOut - targets.length;

  if (targets.length === 0) {
    return NextResponse.json({ error: skippedUnsubscribed ? "No recipients found (all have unsubscribed)" : "No recipients found" }, { status: 400 });
  }

  // Prepare last-order lookup if includeOrderItems is on
  type OrderItem = { id: string; name: string; price: string; qty: number; imageUrl?: string };
  const lastOrderStmt = db.prepare(
    "SELECT items, ref, createdAt FROM orders WHERE email = ? ORDER BY createdAt DESC LIMIT 1"
  );

  // Send emails
  let sent = 0;
  for (const t of targets) {
    try {
      let orderItems: OrderItem[] | undefined;
      let orderRef: string | undefined;

      let restoreCartUrl: string | undefined;

      if (cartItems?.length) {
        orderItems = cartItems as OrderItem[];
        const encoded = Buffer.from(JSON.stringify(orderItems)).toString("base64");
        restoreCartUrl = `https://gadgets.bevanssons.store/restore-cart?items=${encoded}`;
      } else if (includeOrderItems) {
        const row = lastOrderStmt.get(t.email.toLowerCase()) as
          { items: string; ref: string; createdAt: string } | undefined;
        if (row) {
          orderItems = JSON.parse(row.items) as OrderItem[];
          orderRef = row.ref;
          const encoded = Buffer.from(JSON.stringify(orderItems)).toString("base64");
          restoreCartUrl = `https://gadgets.bevanssons.store/restore-cart?items=${encoded}`;
        }
      }

      await sendCampaignEmail({
        to: t.email,
        name: t.name,
        subject,
        heading,
        body: emailBody,
        ctaText: ctaText || undefined,
        ctaUrl: ctaUrl || undefined,
        featuredProducts: !includeOrderItems && featuredProducts?.length ? featuredProducts : undefined,
        orderItems,
        orderRef,
        restoreCartUrl,
      });
      sent++;
    } catch {
      // continue sending to others if one fails
    }
  }

  // Log the campaign
  db.prepare(`
    INSERT INTO email_campaigns (id, subject, heading, body, cta_text, cta_url, recipients, sent_to, status, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'sent', ?)
  `).run(
    randomUUID(), subject, heading, emailBody,
    ctaText || null, ctaUrl || null,
    recipients, sent,
    new Date().toISOString()
  );

  return NextResponse.json({ ok: true, sent, total: targets.length, skippedUnsubscribed });
}
