import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { randomBytes } from "crypto";
import nodemailer from "nodemailer";

const transporter = process.env.RESEND_API_KEY
  ? nodemailer.createTransport({
      host: "smtp.resend.com",
      port: 587,
      secure: false,
      auth: { user: "resend", pass: process.env.RESEND_API_KEY },
    })
  : null;

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { visitorId, productId, productName, price, category, visitorName, visitorPhone, visitorEmail } = body;

  if (!productId || !productName) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const db = getDb();
  const id = randomBytes(8).toString("hex");
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO cart_events (id, visitorId, productId, productName, price, category, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(id, visitorId ?? null, String(productId).slice(0, 100), String(productName).slice(0, 300), String(price).slice(0, 50), String(category).slice(0, 100), now);

  // Send email notification
  if (transporter) {
    const contactLine =
      visitorName || visitorPhone || visitorEmail
        ? `\nCustomer: ${visitorName ?? "Unknown"}\nPhone: ${visitorPhone ?? "—"}\nEmail: ${visitorEmail ?? "—"}`
        : "\nCustomer: Anonymous visitor";

    transporter.sendMail({
      from: "Bevanssons <noreply@bevanssons.store>",
      to: "support@bevanssons.store, moneybman0@gmail.com",
      subject: `🛒 Cart — ${productName} added`,
      text: `Someone added a product to their enquiry cart.\n\nProduct: ${productName}\nCategory: ${category}\nPrice: ${price}${contactLine}\n\nTime: ${new Date(now).toLocaleString("en-ZA", { timeZone: "Africa/Johannesburg" })}`,
    }).catch(console.error);
  }

  return NextResponse.json({ ok: true });
}
