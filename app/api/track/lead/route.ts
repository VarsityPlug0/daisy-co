import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { createLeadOutboxEvent } from "@/lib/outbox";
import { sendMail, sendWelcomeEmail } from "@/lib/mailer";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { visitorId, name, phone, email } = body;

  if (!visitorId || (!phone && !email)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const db = getDb();
  const now = new Date().toISOString();

  const lead = {
    id: String(visitorId).slice(0, 64),
    name: String(name ?? "").slice(0, 200),
    email: String(email ?? "").slice(0, 200),
    phone: String(phone ?? "").slice(0, 50),
    message: "Lead captured via 20% off popup",
    productInterest: "General",
    createdAt: now,
  };

  // Visitor upsert + conditional lead insert + outbox event, all in one
  // transaction. INSERT OR IGNORE preserves existing behavior (same
  // visitorId submitting twice is not a new lead) — result.changes tells
  // us whether a row was actually inserted, so we never emit an outbox
  // event for a no-op: "if the event exists, it must correspond to an
  // actual committed local lead."
  db.transaction(() => {
    db.prepare(`
      INSERT INTO visitors (id, name, phone, email, createdAt)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        name  = excluded.name,
        phone = excluded.phone,
        email = excluded.email
    `).run(lead.id, lead.name, lead.phone, lead.email, now);

    const result = db.prepare(`
      INSERT OR IGNORE INTO leads (id, name, email, phone, message, productInterest, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(lead.id, lead.name, lead.email, lead.phone, lead.message, lead.productInterest, lead.createdAt);

    if (result.changes > 0) {
      createLeadOutboxEvent(db, lead);
    }
  })();

  const waNum = String(phone ?? "").replace(/[^0-9]/g, "");

  // Email admin
  sendMail({
    to: "Mkhabeleenterprise@gmail.com",
    subject: `✨ New Lead — ${name || phone || email}`,
    html: `
      <div style="font-family:sans-serif;max-width:500px;margin:0 auto;color:#333">
        <div style="background:#111111;padding:20px 28px;border-radius:8px 8px 0 0">
          <h2 style="color:#C8B993;margin:0;font-size:18px">New Lead Captured</h2>
          <p style="color:#888;margin:4px 0 0;font-size:12px">via 20% off popup</p>
        </div>
        <div style="background:#f9f9f9;padding:28px;border-radius:0 0 8px 8px">
          <table style="width:100%;border-collapse:collapse">
            <tr><td style="padding:7px 0;color:#666;width:100px;font-size:14px">Name</td><td style="padding:7px 0;font-weight:600;font-size:14px">${name || "—"}</td></tr>
            <tr><td style="padding:7px 0;color:#666;font-size:14px">Phone</td><td style="padding:7px 0;font-weight:600;font-size:14px">${phone || "—"}</td></tr>
            <tr><td style="padding:7px 0;color:#666;font-size:14px">Email</td><td style="padding:7px 0;font-size:14px">${email || "—"}</td></tr>
          </table>
          ${waNum ? `<div style="margin-top:20px"><a href="https://wa.me/${waNum}" style="display:inline-block;background:#25D366;color:#fff;font-weight:bold;text-decoration:none;padding:10px 20px;border-radius:8px;font-size:14px">Message on WhatsApp</a></div>` : ""}
        </div>
      </div>
    `,
  });

  // Welcome email to customer (only if they provided email)
  if (email && email.includes("@")) {
    sendWelcomeEmail({ name: name ?? "", email });
  }

  return NextResponse.json({ ok: true });
}
