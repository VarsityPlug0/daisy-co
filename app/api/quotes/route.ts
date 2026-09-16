import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { createQuote } from "@/lib/quotes";

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
  const {
    name, phone, email, province,
    propertyType, monthlyBill, mainGoal, appliances, budget,
    recommendedPackage, estimatedPrice, message,
    source = "wizard",
  } = body;

  if (!name || !phone) {
    return NextResponse.json({ error: "Name and phone are required" }, { status: 400 });
  }

  const quote = createQuote({
    name, phone, email: email ?? "", province: province ?? "",
    propertyType: propertyType ?? "", monthlyBill: monthlyBill ?? "",
    mainGoal: mainGoal ?? "", appliances: JSON.stringify(appliances ?? []),
    budget: budget ?? "", recommendedPackage: recommendedPackage ?? "",
    estimatedPrice: estimatedPrice ?? "", message: message ?? "",
    status: "new", source,
  });

  // Send email notification (non-blocking — quote already saved)
  if (transporter) {
    try {
      const waNum = String(phone).replace(/[^0-9]/g, "");
      const applianceList = Array.isArray(appliances)
        ? appliances.map((a: { label: string; qty: number }) => `${esc(a.label)} ×${a.qty}`).join(", ")
        : "—";

      await transporter.sendMail({
        from: "Bevanssons <noreply@bevanssons.store>",
        to: "Mkhabeleenterprise@gmail.com",
        subject: `New Quote #${quote.ref} — ${esc(recommendedPackage) || "Solar Enquiry"} — ${esc(name)}`,
        html: `
          <div style="font-family:sans-serif;max-width:620px;margin:0 auto;color:#333">
            <div style="background:#111111;padding:24px 32px;border-radius:8px 8px 0 0">
              <h2 style="color:#C8B993;margin:0;font-size:22px">New Quote Request</h2>
              <p style="color:#888;margin:4px 0 0;font-size:13px">Reference: <strong style="color:#C8B993">${quote.ref}</strong></p>
            </div>
            <div style="background:#f9f9f9;padding:32px;border-radius:0 0 8px 8px">
              <h3 style="margin:0 0 16px;font-size:16px;color:#111">Customer</h3>
              <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
                <tr><td style="padding:6px 0;color:#666;width:160px;font-size:14px">Name</td><td style="padding:6px 0;font-weight:600;font-size:14px">${esc(name)}</td></tr>
                <tr><td style="padding:6px 0;color:#666;font-size:14px">Phone</td><td style="padding:6px 0;font-size:14px"><a href="https://wa.me/${waNum}" style="color:#22c55e">${esc(phone)}</a></td></tr>
                <tr><td style="padding:6px 0;color:#666;font-size:14px">Email</td><td style="padding:6px 0;font-size:14px">${esc(email) || "—"}</td></tr>
                <tr><td style="padding:6px 0;color:#666;font-size:14px">Province</td><td style="padding:6px 0;font-size:14px">${esc(province) || "—"}</td></tr>
              </table>

              <h3 style="margin:0 0 16px;font-size:16px;color:#111">Requirements</h3>
              <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
                <tr><td style="padding:6px 0;color:#666;width:160px;font-size:14px">Property Type</td><td style="padding:6px 0;font-size:14px">${esc(propertyType) || "—"}</td></tr>
                <tr><td style="padding:6px 0;color:#666;font-size:14px">Monthly Bill</td><td style="padding:6px 0;font-size:14px">${esc(monthlyBill) || "—"}</td></tr>
                <tr><td style="padding:6px 0;color:#666;font-size:14px">Main Goal</td><td style="padding:6px 0;font-size:14px">${esc(mainGoal) || "—"}</td></tr>
                <tr><td style="padding:6px 0;color:#666;font-size:14px">Appliances</td><td style="padding:6px 0;font-size:14px">${applianceList || "—"}</td></tr>
                <tr><td style="padding:6px 0;color:#666;font-size:14px">Budget</td><td style="padding:6px 0;font-size:14px">${esc(budget) || "—"}</td></tr>
              </table>

              <h3 style="margin:0 0 16px;font-size:16px;color:#111">Recommendation</h3>
              <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
                <tr><td style="padding:6px 0;color:#666;width:160px;font-size:14px">Package</td><td style="padding:6px 0;font-weight:600;color:#C8B993;font-size:14px">${esc(recommendedPackage) || "—"}</td></tr>
                <tr><td style="padding:6px 0;color:#666;font-size:14px">Est. Price</td><td style="padding:6px 0;font-weight:600;font-size:14px">${esc(estimatedPrice) || "—"}</td></tr>
              </table>

              ${message ? `<h3 style="margin:0 0 8px;font-size:16px;color:#111">Message</h3><p style="font-size:14px;color:#555;margin:0">${esc(message)}</p>` : ""}
            </div>
          </div>
        `,
      });
    } catch (e) {
      console.error("Quote email error:", e);
    }
  }

  return NextResponse.json({ ok: true, ref: quote.ref });
}
