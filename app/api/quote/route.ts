import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { saveLead } from "@/lib/products";

function esc(s: unknown): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

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
  const { name, phone, email, type, message } = body;

  if (!name || !phone) {
    return NextResponse.json({ error: "Name and phone are required" }, { status: 400 });
  }

  // Always save to DB so leads are never lost
  saveLead({ name, phone, email, message: message || type, productInterest: type });

  if (transporter) {
    try {
      const waNum = String(phone).replace(/[^0-9]/g, "");
      await transporter.sendMail({
        from: "Bevanssons <noreply@bevanssons.store>",
        to: "Mkhabeleenterprise@gmail.com",
        subject: `New Quote Request — ${esc(type)} — ${esc(name)}`,
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
            <h2 style="color:#C8B993;">New Quote Request — Bevanssons</h2>
            <table style="width:100%;border-collapse:collapse;">
              <tr><td style="padding:8px 0;color:#666;width:120px">Name</td><td style="padding:8px 0;font-weight:600">${esc(name)}</td></tr>
              <tr><td style="padding:8px 0;color:#666">Phone</td><td style="padding:8px 0;font-weight:600">${esc(phone)}</td></tr>
              <tr><td style="padding:8px 0;color:#666">Email</td><td style="padding:8px 0">${esc(email) || "Not provided"}</td></tr>
              <tr><td style="padding:8px 0;color:#666">Interested in</td><td style="padding:8px 0;font-weight:600">${esc(type)}</td></tr>
              <tr><td style="padding:8px 0;color:#666;vertical-align:top">Message</td><td style="padding:8px 0">${esc(message) || "No message"}</td></tr>
            </table>
            <hr style="margin:20px 0;border-color:#eee"/>
            <p style="color:#666;font-size:13px">Reply via WhatsApp: <a href="https://wa.me/${waNum}">wa.me/${waNum}</a></p>
          </div>
        `,
      });
    } catch (err) {
      console.error("Mail error:", err);
    }
  }

  return NextResponse.json({ ok: true });
}
