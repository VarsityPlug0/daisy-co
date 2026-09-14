import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { randomBytes } from "crypto";
import { sendMail } from "@/lib/mailer";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("sessionId");
  const after = searchParams.get("after");

  if (!sessionId) return NextResponse.json({ messages: [] });

  const db = getDb();
  const messages = after
    ? db.prepare("SELECT * FROM chat_messages WHERE sessionId = ? AND createdAt > ? ORDER BY createdAt ASC").all(sessionId, after)
    : db.prepare("SELECT * FROM chat_messages WHERE sessionId = ? ORDER BY createdAt ASC").all(sessionId);

  return NextResponse.json({ messages });
}

export async function POST(req: NextRequest) {
  const { sessionId, body, visitorId } = await req.json();
  if (!sessionId || !body?.trim()) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const db = getDb();
  const now = new Date().toISOString();
  const id = randomBytes(8).toString("hex");

  const session = db.prepare("SELECT * FROM chat_sessions WHERE id = ?").get(sessionId) as Record<string, unknown> | undefined;
  if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });

  db.prepare("INSERT INTO chat_messages (id, sessionId, sender, body, createdAt) VALUES (?,?,?,?,?)")
    .run(id, sessionId, "customer", body.trim().slice(0, 2000), now);

  db.prepare("UPDATE chat_sessions SET lastMessageAt=?, unreadAdmin=unreadAdmin+1 WHERE id=?")
    .run(now, sessionId);

  // Email admin on first message only
  const msgCount = (db.prepare("SELECT COUNT(*) as c FROM chat_messages WHERE sessionId=? AND sender='customer'").get(sessionId) as { c: number }).c;
  if (msgCount === 1) {
    const name = String(session.name || "Anonymous");
    const phone = String(session.phone || "—");
    sendMail({
      to: "support@bevanssons.store, moneybman0@gmail.com",
      subject: `💬 New Chat — ${name}`,
      html: `
        <div style="font-family:sans-serif;max-width:500px;margin:0 auto;background:#111111;border-radius:10px;padding:28px;color:#e5e7eb">
          <h2 style="color:#C8B993;margin:0 0 16px">New Chat Started</h2>
          <p style="margin:0 0 8px;color:#9ca3af">From: <strong style="color:#fff">${name}</strong></p>
          <p style="margin:0 0 8px;color:#9ca3af">Phone: <strong style="color:#fff">${phone}</strong></p>
          <p style="margin:0 0 20px;color:#9ca3af">Message: <strong style="color:#fff">${body.slice(0, 300)}</strong></p>
          <a href="https://gadgets.bevanssons.store/admin/dashboard/chat" style="display:inline-block;background:#C8B993;color:#000;font-weight:bold;text-decoration:none;padding:12px 24px;border-radius:8px">Reply in Admin</a>
        </div>
      `,
    });
  }

  return NextResponse.json({ ok: true, id });
}
