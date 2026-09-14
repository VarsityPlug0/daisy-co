import { NextRequest, NextResponse } from "next/server";
import { createLeadOutboxEvent } from "@/lib/outbox";
import { getDb } from "@/lib/db";
import { randomBytes } from "crypto";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, phone, email, type, message } = body;

  if (!name || !phone || !message) {
    return NextResponse.json({ error: "Name, phone and message are required" }, { status: 400 });
  }

  const db = getDb();
  const id = randomBytes(8).toString("hex");
  const now = new Date().toISOString();

  const lead = {
    id,
    name: String(name).slice(0, 200),
    email: String(email ?? "").slice(0, 200),
    phone: String(phone).slice(0, 50),
    message: String(message).slice(0, 2000),
    productInterest: String(type ?? "General Enquiry").slice(0, 100),
    createdAt: now,
  };

  // Lead insert + outbox event insert happen in one transaction: either
  // both are committed or neither is — see lib/outbox.ts.
  db.transaction(() => {
    db.prepare(`
      INSERT INTO leads (id, name, email, phone, message, productInterest, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(lead.id, lead.name, lead.email, lead.phone, lead.message, lead.productInterest, lead.createdAt);

    createLeadOutboxEvent(db, lead);
  })();

  return NextResponse.json({ ok: true });
}
