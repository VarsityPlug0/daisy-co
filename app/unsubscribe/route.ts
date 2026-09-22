import { NextRequest } from "next/server";
import { recordOptOut, verifyUnsubscribeToken } from "@/lib/optout";

// Public unsubscribe endpoint for marketing / follow-up emails.
//   GET  /unsubscribe?e=<email>&t=<token>  — the link in the email footer
//   POST /unsubscribe?e=<email>&t=<token>  — RFC 8058 one-click (List-Unsubscribe-Post)
// The token is an HMAC of the email, so only the recipient of an email can
// unsubscribe that address. Transactional emails about orders/installments are
// not affected.

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string));

function page(title: string, message: string, status = 200) {
  const body = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${esc(title)} — Bevanssons</title></head>
<body style="margin:0;background:#080808;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#e5e7eb">
<div style="max-width:480px;margin:12vh auto;padding:0 20px"><div style="background:#111111;border:1px solid #2A2A2A;border-radius:14px;padding:32px">
<p style="margin:0 0 8px;color:#C8B993;font-weight:700">Bevanssons</p>
<h1 style="margin:0 0 16px;font-size:22px;color:#fff">${esc(title)}</h1>
<p style="margin:0;line-height:1.6;color:#9ca3af">${message}</p></div></div></body></html>`;
  return new Response(body, {
    status,
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store", "X-Robots-Tag": "noindex" },
  });
}

function handle(email: string | null, token: string | null) {
  if (!email || !token || email.length > 200 || !email.includes("@") || !verifyUnsubscribeToken(email, token)) {
    return page(
      "Link not valid",
      "This unsubscribe link is invalid or incomplete. If you keep receiving emails you do not want, contact support@bevanssons.store and we will remove you.",
      400
    );
  }
  recordOptOut(email, "unsubscribe_link");
  return page(
    "You are unsubscribed",
    `<strong style="color:#fff">${esc(email.trim().toLowerCase())}</strong> will no longer receive marketing or follow-up emails from Bevanssons. Emails about orders or installment applications you have placed will still be sent.`
  );
}

export async function GET(req: NextRequest) {
  const u = new URL(req.url);
  return handle(u.searchParams.get("e"), u.searchParams.get("t"));
}

export async function POST(req: NextRequest) {
  const u = new URL(req.url);
  return handle(u.searchParams.get("e"), u.searchParams.get("t"));
}
