import nodemailer from "nodemailer";
import path from "path";
import { existsSync } from "fs";
import { getBankById, type BankDetails } from "./bankDetails";

const LOGO_PATH = path.join(process.cwd(), "public", "logo.jpg");
const LOGO_CID  = "logo@daisygadgets";

const GOLD        = "#D4AF37";
const GOLD_LIGHT  = "#f5d76e";
const BLACK       = "#0A0A0A";
const DARK        = "#111111";
const DARK2       = "#161616";
const BORDER      = "#1F1F1F";
const MUTED       = "#6b7280";
const SITE        = "https://daisygadgetsco.com";
const SUPPORT_EMAIL = "daisygadgetsco@gmail.com";


function createTransporter() {
  if (process.env.RESEND_API_KEY) {
    return nodemailer.createTransport({
      host: "smtp.resend.com",
      port: 587,
      secure: false,
      auth: { user: "resend", pass: process.env.RESEND_API_KEY },
    });
  }
  if (process.env.MAIL_USER && process.env.MAIL_PASS) {
    return nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS },
    });
  }
  return null;
}

function fromAddress() {
  return process.env.RESEND_API_KEY
    ? `"Daisy Gadgets Co." <noreply@daisygadgetsco.com>`
    : `"Daisy Gadgets Co." <${process.env.MAIL_USER ?? "noreply@daisygadgetsco.com"}>`;
}

type MailAttachment =
  | { filename: string; path: string; cid: string }
  | { filename: string; content: Buffer; cid: string };

export async function sendMail(opts: { to: string; subject: string; html: string; attachments?: MailAttachment[] }) {
  const transporter = createTransporter();
  if (!transporter) { console.error("mailer: env vars missing"); return; }
  try {
    const attachments: MailAttachment[] = opts.attachments ?? [];
    if (existsSync(LOGO_PATH)) {
      attachments.unshift({ filename: "logo.jpg", path: LOGO_PATH, cid: LOGO_CID });
    }
    await transporter.sendMail({
      from: fromAddress(),
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      attachments,
    });
  } catch (err) { console.error("mailer send error:", err); }
}

// Fetch a remote image URL and return a Buffer (for CID inlining)
async function fetchImageBuffer(url: string): Promise<Buffer | null> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return null;
    return Buffer.from(await res.arrayBuffer());
  } catch {
    return null;
  }
}

// Build CID attachment list + HTML thumb src map for a set of items
async function buildProductAttachments(
  items: { name: string; imageUrl?: string }[]
): Promise<{ attachments: MailAttachment[]; cidMap: Map<string, string> }> {
  const attachments: MailAttachment[] = [];
  const cidMap = new Map<string, string>();

  await Promise.all(
    items.map(async (item, i) => {
      if (!item.imageUrl) return;
      const buf = await fetchImageBuffer(
        item.imageUrl.startsWith("http") ? item.imageUrl : SITE + item.imageUrl
      );
      if (!buf) return;
      const cid = `product-${i}@daisy`;
      const ext = item.imageUrl.split(".").pop()?.split("?")[0] ?? "jpg";
      attachments.push({ filename: `product-${i}.${ext}`, content: buf, cid });
      cidMap.set(item.imageUrl, `cid:${cid}`);
    })
  );

  return { attachments, cidMap };
}

// ─── Layout ──────────────────────────────────────────────────────────────────
function layout(content: string, accentBar = ""): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Daisy Gadgets Co.</title>
</head>
<body style="margin:0;padding:0;background:${BLACK};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:${BLACK};padding:28px 16px">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;border-radius:16px;overflow:hidden;border:1px solid ${BORDER}">

        <!-- Gold shimmer top bar -->
        <tr><td style="background:linear-gradient(90deg,${BLACK},${GOLD},${GOLD_LIGHT},${GOLD},${BLACK});height:3px;font-size:0;line-height:0">&nbsp;</td></tr>

        <!-- Header -->
        <tr>
          <td style="background:${BLACK};padding:24px 36px">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <img src="cid:${LOGO_CID}" alt="Daisy Gadgets Co." height="44" style="height:44px;width:auto;display:block;border:0" />
                </td>
                <td align="right">
                  <a href="${SITE}" style="color:${MUTED};font-size:12px;text-decoration:none">daisygadgetsco.com</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        ${accentBar}

        <!-- Body -->
        <tr>
          <td style="background:${DARK};padding:36px 36px 32px;border-top:1px solid ${BORDER}">
            ${content}
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:${BLACK};padding:24px 36px;border-top:1px solid ${BORDER}">
            <p style="margin:0 0 8px;color:${MUTED};font-size:12px;text-align:center">
              Questions? &nbsp;
              <a href="mailto:daisygadgetsco@gmail.com" style="color:${GOLD};text-decoration:none;font-weight:600">daisygadgetsco@gmail.com</a>
              &nbsp;·&nbsp;
              <a href="${SITE}" style="color:${GOLD};text-decoration:none;font-weight:600">daisygadgetsco.com</a>
            </p>
            <p style="margin:0;color:#333;font-size:11px;text-align:center">
              © ${new Date().getFullYear()} Daisy Gadgets Co. · All rights reserved.
            </p>
          </td>
        </tr>

        <!-- Bottom gold bar -->
        <tr><td style="background:linear-gradient(90deg,${BLACK},${GOLD},${GOLD_LIGHT},${GOLD},${BLACK});height:2px;font-size:0;line-height:0">&nbsp;</td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function label(text: string) {
  return `<p style="margin:0 0 3px;color:${MUTED};font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em">${text}</p>`;
}

function divider() {
  return `<div style="height:1px;background:${BORDER};margin:24px 0"></div>`;
}

function btn(text: string, href: string, bg = GOLD, fg = BLACK) {
  return `<a href="${href}" style="display:inline-block;background:${bg};color:${fg};font-weight:800;text-decoration:none;padding:13px 26px;border-radius:10px;font-size:14px;letter-spacing:0.02em">${text}</a>`;
}

function infoRow(key: string, val: string) {
  return `<tr>
    <td style="padding:8px 0;color:${MUTED};font-size:13px;width:150px;vertical-align:top;border-bottom:1px solid ${BORDER}">${key}</td>
    <td style="padding:8px 0;color:#e5e7eb;font-size:13px;font-weight:600;vertical-align:top;border-bottom:1px solid ${BORDER}">${val}</td>
  </tr>`;
}

function statusPill(text: string, color: string) {
  return `<span style="display:inline-block;background:${color}22;color:${color};border:1px solid ${color}55;padding:4px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:0.05em">${text}</span>`;
}

// ─── 1. Order Confirmation ────────────────────────────────────────────────────
export interface OrderEmailData {
  name: string;
  email: string;
  ref: string;
  items: { name: string; price: string; qty: number; imageUrl?: string }[];
  total: number;
  address?: string;
  phone?: string;
}

export async function sendOrderConfirmation(data: OrderEmailData) {
  const { attachments: imgAttachments, cidMap } = await buildProductAttachments(data.items);

  const itemRows = data.items.map(i => {
    const lineTotal = (parseFloat(String(i.price).replace(/[^0-9.]/g, "")) * i.qty).toLocaleString("en-ZA");
    const src = i.imageUrl ? (cidMap.get(i.imageUrl) ?? (i.imageUrl.startsWith("http") ? i.imageUrl : SITE + i.imageUrl)) : null;
    const thumb = src
      ? `<img src="${src}" alt="${i.name}" width="64" height="64" style="width:64px;height:64px;object-fit:cover;border-radius:10px;display:block;border:1px solid ${BORDER}" />`
      : `<div style="width:64px;height:64px;background:${DARK2};border:1px solid ${BORDER};border-radius:10px"></div>`;
    return `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid ${BORDER};width:76px;vertical-align:middle">${thumb}</td>
      <td style="padding:12px 12px;border-bottom:1px solid ${BORDER};vertical-align:middle">
        <p style="margin:0 0 4px;color:#e5e7eb;font-size:14px;font-weight:600">${i.name}</p>
        <p style="margin:0;color:${MUTED};font-size:12px">Qty: ${i.qty}</p>
      </td>
      <td style="padding:12px 0;border-bottom:1px solid ${BORDER};text-align:right;vertical-align:middle">
        <span style="color:${GOLD};font-size:14px;font-weight:700">R ${lineTotal}</span>
      </td>
    </tr>`;
  }).join("");

  const html = layout(`
    <div style="text-align:center;margin-bottom:28px">
      <div style="font-size:48px;line-height:1;margin-bottom:12px">🎊</div>
      <h1 style="margin:0 0 8px;color:#f9fafb;font-size:26px;font-weight:900">Thank you for your purchase!</h1>
      <p style="margin:0;color:#9ca3af;font-size:14px">Hi ${data.name.split(" ")[0]}, your payment has been verified and your order is confirmed.</p>
    </div>

    <!-- Ref pill -->
    <div style="background:${DARK2};border:1px solid ${GOLD}44;border-radius:10px;padding:14px 20px;margin-bottom:28px;display:flex;align-items:center">
      <table width="100%" cellpadding="0" cellspacing="0"><tr>
        <td style="color:${MUTED};font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em">Order Reference</td>
        <td style="text-align:right;color:${GOLD};font-size:18px;font-weight:900;letter-spacing:0.08em;font-family:monospace">${data.ref}</td>
      </tr></table>
    </div>

    <!-- Items -->
    <p style="margin:0 0 12px;color:#e5e7eb;font-size:15px;font-weight:700">✦ Order Summary</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:4px">
      ${itemRows}
    </table>

    <!-- Totals -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:12px 0 28px">
      <tr>
        <td style="padding:6px 0;color:${MUTED};font-size:13px">Subtotal</td>
        <td style="padding:6px 0;text-align:right;color:#d1d5db;font-size:13px">R ${data.total.toLocaleString("en-ZA")}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;color:${MUTED};font-size:13px">Shipping</td>
        <td style="padding:6px 0;text-align:right;color:#22c55e;font-size:13px;font-weight:700">Free</td>
      </tr>
      <tr>
        <td style="padding:10px 0 0;color:#e5e7eb;font-size:16px;font-weight:800;border-top:1px solid ${BORDER}">Total</td>
        <td style="padding:10px 0 0;text-align:right;color:${GOLD};font-size:20px;font-weight:900;border-top:1px solid ${BORDER}">R ${data.total.toLocaleString("en-ZA")}</td>
      </tr>
    </table>

    ${divider()}

    <!-- Customer info grid -->
    <p style="margin:0 0 14px;color:#e5e7eb;font-size:15px;font-weight:700">✦ Customer Information</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px">
      <tr>
        <td width="50%" style="padding:0 8px 0 0;vertical-align:top">
          <div style="background:${DARK2};border:1px solid ${BORDER};border-radius:10px;padding:16px 18px;margin-bottom:12px">
            <p style="margin:0 0 6px;color:${MUTED};font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em">Shipping Address</p>
            <p style="margin:0;color:#d1d5db;font-size:13px;line-height:1.6">${data.name}<br>${data.address || "—"}</p>
          </div>
          <div style="background:${DARK2};border:1px solid ${BORDER};border-radius:10px;padding:16px 18px">
            <p style="margin:0 0 6px;color:${MUTED};font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em">Billing Address</p>
            <p style="margin:0;color:#d1d5db;font-size:13px;line-height:1.6">${data.name}<br>${data.address || "—"}</p>
          </div>
        </td>
        <td width="50%" style="padding:0 0 0 8px;vertical-align:top">
          <div style="background:${DARK2};border:1px solid ${BORDER};border-radius:10px;padding:16px 18px;margin-bottom:12px">
            <p style="margin:0 0 6px;color:${MUTED};font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em">Shipping Method</p>
            <p style="margin:0;color:#d1d5db;font-size:13px">📦 Standard Delivery<br><span style="color:${MUTED};font-size:12px">2–5 business days</span></p>
          </div>
          <div style="background:${DARK2};border:1px solid ${BORDER};border-radius:10px;padding:16px 18px">
            <p style="margin:0 0 6px;color:${MUTED};font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em">Payment Method</p>
            <p style="margin:0;color:#d1d5db;font-size:13px">🏦 EFT Bank Transfer<br><span style="color:#22c55e;font-size:12px;font-weight:700">✔ Payment Verified</span></p>
          </div>
        </td>
      </tr>
    </table>

    <div style="text-align:center">
      ${btn("✉️ Email Us", `mailto:${SUPPORT_EMAIL}?subject=Order%20${data.ref}`, GOLD, BLACK)}
    </div>
  `);

  await sendMail({ to: data.email, subject: `Order Confirmed ✨ — ${data.ref} | Daisy Gadgets Co.`, html, attachments: imgAttachments });
}

// ─── 2. Proof Acknowledgement ─────────────────────────────────────────────────
export async function sendProofAcknowledgement(data: { name: string; email: string; ref: string }) {
  const html = layout(`
    ${label("Payment Received")}
    <h1 style="margin:6px 0 10px;color:#f9fafb;font-size:28px;font-weight:900">✅ We got your proof!</h1>
    <p style="margin:0 0 24px;color:#9ca3af;font-size:15px;line-height:1.6">
      Hi ${data.name.split(" ")[0]}, we received your proof of payment for order <strong style="color:${GOLD}">${data.ref}</strong>.
    </p>

    <div style="background:${DARK2};border:1px solid #22c55e44;border-left:3px solid #22c55e;border-radius:0 12px 12px 0;padding:18px 20px;margin-bottom:28px">
      <p style="margin:0;color:#86efac;font-size:14px;line-height:1.7">
        Your proof is under review. We will verify and confirm your order within <strong>24 hours</strong>. You will receive another email as soon as it is approved.
      </p>
    </div>

    <p style="color:#9ca3af;font-size:14px;margin:0 0 20px">Need help or want to check in?</p>
    ${btn("Email Us", `mailto:${SUPPORT_EMAIL}?subject=Order%20${data.ref}`, GOLD, BLACK)}
  `);
  await sendMail({ to: data.email, subject: `Payment Proof Received — ${data.ref} | Daisy Gadgets Co.`, html });
}

// ─── 3. Rejection Email ──────────────────────────────────────────────────────
export interface RejectionEmailData {
  name: string;
  email: string;
  ref: string;
  total: number;
  items: { name: string; price: string; qty: number; imageUrl?: string }[];
  reason?: string | null;
  bank?: BankDetails | null;
}

export async function sendRejectionEmail(data: RejectionEmailData) {
  const bank = data.bank ?? getBankById("tymebank");
  const { attachments: imgAttachments, cidMap } = await buildProductAttachments(data.items);

  const itemRows = data.items.map(i => {
    const lineTotal = (parseFloat(String(i.price).replace(/[^0-9.]/g, "")) * i.qty).toLocaleString("en-ZA");
    const unitPrice = parseFloat(String(i.price).replace(/[^0-9.]/g, "")).toLocaleString("en-ZA");
    const src = i.imageUrl ? (cidMap.get(i.imageUrl) ?? (i.imageUrl.startsWith("http") ? i.imageUrl : SITE + i.imageUrl)) : null;
    const thumb = src
      ? `<img src="${src}" alt="${i.name}" width="64" height="64" style="width:64px;height:64px;object-fit:cover;border-radius:10px;display:block;border:1px solid ${BORDER}" />`
      : `<div style="width:64px;height:64px;background:${DARK2};border:1px solid ${BORDER};border-radius:10px"></div>`;
    return `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid ${BORDER};width:76px;vertical-align:middle">${thumb}</td>
      <td style="padding:12px 10px;border-bottom:1px solid ${BORDER};vertical-align:middle">
        <p style="margin:0 0 3px;color:#e5e7eb;font-size:14px;font-weight:600">${i.name}</p>
        <p style="margin:0;color:${MUTED};font-size:12px">R ${unitPrice} × ${i.qty}</p>
      </td>
      <td style="padding:12px 0;border-bottom:1px solid ${BORDER};text-align:right;vertical-align:middle">
        <span style="color:${GOLD};font-size:14px;font-weight:700">R ${lineTotal}</span>
      </td>
    </tr>`;
  }).join("");

  const reasonHtml = data.reason
    ? `<div style="background:${DARK2};border-left:3px solid #ef4444;border-radius:0 10px 10px 0;padding:16px 20px;margin-bottom:24px">
        <p style="margin:0 0 4px;color:#ef4444;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em">Reason from our team</p>
        <p style="margin:0;color:#fca5a5;font-size:14px;line-height:1.6">${data.reason}</p>
       </div>`
    : "";

  const html = layout(`
    <!-- Hero -->
    <div style="text-align:center;margin-bottom:28px">
      <div style="font-size:48px;line-height:1;margin-bottom:14px">🔔</div>
      <div style="display:inline-block;background:#ef444420;color:#ef4444;border:1px solid #ef444450;padding:5px 16px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:0.06em;margin-bottom:14px">Action Required</div>
      <h1 style="margin:0 0 10px;color:#f9fafb;font-size:26px;font-weight:900;line-height:1.2">Payment could not be verified</h1>
      <p style="margin:0;color:#9ca3af;font-size:14px;line-height:1.6">Hi <strong style="color:#e5e7eb">${data.name.split(" ")[0]}</strong>, we were unable to verify your proof of payment for order <strong style="color:${GOLD};font-family:monospace">${data.ref}</strong>.</p>
    </div>

    ${reasonHtml}

    <p style="margin:0 0 24px;color:#9ca3af;font-size:14px;line-height:1.7">
      Don&apos;t worry — this happens sometimes. Please re-do your payment using the details below and upload a clear screenshot or photo of your confirmation.
    </p>

    ${divider()}

    <!-- Order summary with images -->
    <p style="margin:0 0 14px;color:#e5e7eb;font-size:15px;font-weight:700">✦ Your Order</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:4px">
      ${itemRows}
    </table>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:10px 0 28px">
      <tr>
        <td style="padding:6px 0;color:${MUTED};font-size:13px">Subtotal</td>
        <td style="padding:6px 0;text-align:right;color:#d1d5db;font-size:13px">R ${data.total.toLocaleString("en-ZA")}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;color:${MUTED};font-size:13px">Shipping</td>
        <td style="padding:6px 0;text-align:right;color:#22c55e;font-size:13px;font-weight:700">Free</td>
      </tr>
      <tr>
        <td style="padding:10px 0 0;color:#e5e7eb;font-size:16px;font-weight:800;border-top:1px solid ${BORDER}">Total Due</td>
        <td style="padding:10px 0 0;text-align:right;color:${GOLD};font-size:20px;font-weight:900;border-top:1px solid ${BORDER}">R ${data.total.toLocaleString("en-ZA")}</td>
      </tr>
    </table>

    ${divider()}

    <!-- Bank details -->
    <p style="margin:0 0 14px;color:#e5e7eb;font-size:15px;font-weight:700">✦ Payment Details (EFT)</p>
    <div style="background:${DARK2};border:1px solid ${BORDER};border-radius:12px;padding:4px 20px;margin-bottom:28px">
      <table width="100%" cellpadding="0" cellspacing="0">
        ${infoRow("Bank", bank.bank)}
        ${infoRow("Account Holder", bank.accountHolder)}
        ${infoRow("Account Type", bank.accountType)}
        ${infoRow("Account Number", `<span style="font-family:monospace;font-size:15px;color:${GOLD};letter-spacing:0.06em">${bank.accountNumber}</span>`)}
        ${infoRow("Branch Code", bank.branchCode)}
        ${bank.payshap ? infoRow("PayShap", bank.payshap) : ""}
        ${infoRow("Reference", `<strong style="color:${GOLD};font-size:15px;font-family:monospace">${data.ref}</strong>`)}
        ${infoRow("Amount", `<strong style="color:${GOLD};font-size:15px">R ${data.total.toLocaleString("en-ZA")}</strong>`)}
      </table>
    </div>

    <p style="margin:0 0 20px;color:#9ca3af;font-size:14px">Once paid, upload your new proof of payment — or send it directly by email and we will update your order manually.</p>
    <div>
      ${btn("📤 Upload New Proof", `${SITE}/checkout`, GOLD, BLACK)}
      &nbsp;&nbsp;
      ${btn("✉️ Send via Email", `mailto:${SUPPORT_EMAIL}?subject=Re-sending%20proof%20for%20order%20${data.ref}`, GOLD, BLACK)}
    </div>
  `);

  await sendMail({ to: data.email, subject: `⚠️ Action Required — ${data.ref} | Daisy Gadgets Co.`, html, attachments: imgAttachments });
}

// ─── 4. Order Status Updates ──────────────────────────────────────────────────
const STATUS_CONTENT: Record<string, { pill: [string, string]; title: string; body: string; cta?: [string, string]; icon: string }> = {
  approved: {
    pill: ["Payment Approved", "#22c55e"],
    icon: "🎊",
    title: "Your payment is confirmed!",
    body: "Great news — your payment has been verified and your order is now being packed and prepared for dispatch. We will notify you as soon as it ships.",
    cta: ["✉️ Email Us", `mailto:${SUPPORT_EMAIL}`],
  },
  shipped: {
    pill: ["Shipped", "#3b82f6"],
    icon: "📦",
    title: "Your order has been shipped!",
    body: "We are pleased to inform you that your order has been successfully packed, processed and shipped.\n\nYour parcel is now in transit to the selected delivery destination. Please keep your contact number available in case our delivery team needs to contact you regarding your order.\n\nWe will notify you again when your order moves to Out for Delivery.",
    cta: ["✉️ Track via Email", `mailto:${SUPPORT_EMAIL}`],
  },
  delivered: {
    pill: ["Delivered", GOLD],
    icon: "🎁",
    title: "Your order has been delivered!",
    body: "We are delighted to confirm that your Daisy Gadgets Co. order has been successfully delivered.\n\nThank you for trusting Daisy Gadgets Co. with your purchase. We hope you are completely satisfied with your order. If you experience any issue with the product or require assistance after delivery, please contact our customer support team and we will be happy to assist.\n\nWe would also appreciate your feedback about your shopping experience with us.\n\nThank you for choosing Daisy Gadgets Co. — Smart Tech. Better Living.",
    cta: ["⭐ Leave a Review", `${SITE}/reviews`],
  },
};

function bodyParagraphs(text: string): string {
  return text.split("\n\n")
    .map(p => `<p style="margin:0 0 14px;color:#9ca3af;font-size:15px;line-height:1.7">${p}</p>`)
    .join("");
}

export async function sendStatusUpdate(data: { name: string; email: string; ref: string; status: string; notes?: string | null; tracking_number?: string | null }) {
  const content = STATUS_CONTENT[data.status];
  if (!content) return;

  const notesHtml = data.notes
    ? `<div style="background:${DARK2};border-left:3px solid ${GOLD};border-radius:0 10px 10px 0;padding:14px 18px;margin:20px 0">
        <p style="margin:0 0 4px;color:${MUTED};font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em">Note from our team</p>
        <p style="margin:0;color:#d1d5db;font-size:14px;font-style:italic;line-height:1.6">"${data.notes}"</p>
       </div>`
    : "";

  const trackingHtml = data.status === "shipped" && data.tracking_number
    ? `<div style="background:${DARK2};border:1px solid #3b82f644;border-left:3px solid #3b82f6;border-radius:0 12px 12px 0;padding:16px 20px;margin:4px 0 20px">
        <p style="margin:0 0 4px;color:${MUTED};font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em">Your Tracking Number</p>
        <p style="margin:0;color:#93c5fd;font-size:20px;font-weight:700;font-family:monospace;letter-spacing:0.08em">${data.tracking_number}</p>
       </div>`
    : "";

  const deliveredInfoHtml = data.status === "delivered"
    ? `<div style="background:${DARK2};border:1px solid ${GOLD}33;border-radius:12px;padding:16px 20px;margin:4px 0 20px">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="color:${MUTED};font-size:13px">Delivery Status</td>
            <td style="color:#10b981;font-size:13px;font-weight:700;text-align:right">Successfully Delivered</td>
          </tr>
          <tr>
            <td style="color:${MUTED};font-size:13px;padding-top:8px">Delivery Date</td>
            <td style="color:#e5e7eb;font-size:13px;font-weight:600;text-align:right;padding-top:8px">${new Date().toLocaleDateString("en-ZA", { day: "numeric", month: "long", year: "numeric" })}</td>
          </tr>
        </table>
       </div>`
    : "";

  const subjects: Record<string, string> = {
    approved:  `Payment Approved — ${data.ref} | Daisy Gadgets Co.`,
    rejected:  `Action Required — ${data.ref} | Daisy Gadgets Co.`,
    shipped:   `Your Order Has Been Shipped – #${data.ref}`,
    delivered: `Order Successfully Delivered – #${data.ref}`,
  };

  const html = layout(`
    <div style="margin-bottom:16px">${statusPill(...content.pill)}</div>
    <div style="font-size:36px;margin-bottom:12px;line-height:1">${content.icon}</div>
    <h1 style="margin:0 0 6px;color:#f9fafb;font-size:26px;font-weight:900">${content.title}</h1>
    <p style="margin:0 0 4px;color:${MUTED};font-size:13px">Order: <strong style="color:${GOLD}">${data.ref}</strong></p>
    ${divider()}
    <p style="margin:0 0 14px;color:#9ca3af;font-size:15px">Dear ${data.name.split(" ")[0]},</p>
    ${deliveredInfoHtml}
    ${trackingHtml}
    ${bodyParagraphs(content.body)}
    ${notesHtml}
    ${content.cta ? `<div style="margin-top:24px">${btn(content.cta[0], content.cta[1])}&nbsp;&nbsp;${btn("✉️ Email Us", `mailto:${SUPPORT_EMAIL}?subject=Order%20${data.ref}`, GOLD, BLACK)}</div>` : ""}
  `);

  await sendMail({ to: data.email, subject: subjects[data.status] ?? `Order Update — ${data.ref}`, html });
}

// ─── 5. Tracking / Progress Update ───────────────────────────────────────────
export const TRACKING_TEMPLATES: Record<string, {
  icon: string; pillText: string; pillColor: string;
  title: string; subject: string; defaultMessage: string; stage: number;
}> = {
  processing: {
    icon: "⚙️", pillText: "Being Prepared", pillColor: "#8b5cf6",
    title: "Your order is being prepared",
    subject: "Your Order Is Being Prepared – Daisy Gadgets Co.",
    defaultMessage: "We are pleased to confirm that your order has been successfully confirmed and is now being prepared by our fulfilment team.\n\nOur team is carefully preparing your order to ensure everything is correct before it moves to the next stage.\n\nWe will notify you as soon as your order is ready for packing.",
    stage: 2,
  },
  packed: {
    icon: "📦", pillText: "Being Packed", pillColor: "#3b82f6",
    title: "Your order is being packed",
    subject: "Your Order Is Being Packed – Daisy Gadgets Co.",
    defaultMessage: "Your order has successfully moved to the packing stage.\n\nOur fulfilment team is currently checking and securely packaging your order to ensure that it is properly prepared for transportation.\n\nOnce packing and final quality checks are completed, your order will proceed to shipping. You will receive another notification when your order has been dispatched.",
    stage: 3,
  },
  out_for_delivery: {
    icon: "🏠", pillText: "Out for Delivery", pillColor: "#10b981",
    title: "Your order is out for delivery today!",
    subject: "Your Order Is Out for Delivery Today",
    defaultMessage: "Great news. Your Daisy Gadgets Co. order is now out for delivery.\n\nYour assigned delivery driver is currently completing the delivery route and will contact you directly when they are approaching your location.\n\nKindly keep your phone available and ensure that someone is available to receive the order.\n\nPlease note: Delivery times may vary depending on the driver's route, traffic and other scheduled deliveries.\n\nWe appreciate your patience and look forward to completing your delivery successfully.",
    stage: 5,
  },
  delayed: {
    icon: "⏳", pillText: "Slight Delay", pillColor: "#f59e0b",
    title: "A small update on your order",
    subject: "Update on Your Order – Daisy Gadgets Co.",
    defaultMessage: "We would like to inform you that there has been a slight delay with your order. We sincerely apologise for any inconvenience this may cause.\n\nOur team is working to resolve this as quickly as possible and your order will be on its way shortly. We will keep you updated with any further changes.",
    stage: -1,
  },
  custom: {
    icon: "📬", pillText: "Update", pillColor: GOLD,
    title: "An update on your order",
    subject: "Update on Your Order – Daisy Gadgets Co.",
    defaultMessage: "",
    stage: -1,
  },
};

function progressBar(activeStage: number): string {
  const stages = ["Order Placed", "Processing", "Packed", "Dispatched", "Delivered"];
  const dotCells: string[] = [];
  const labelCells: string[] = [];

  stages.forEach((name, i) => {
    const s = i + 1;
    const done = s < activeStage;
    const active = s === activeStage;
    const dotBg     = done ? "#10b981" : active ? GOLD : "#1a1a1a";
    const dotColor  = done ? "#fff" : active ? BLACK : "#555";
    const labelColor = active ? "#e5e7eb" : done ? "#9ca3af" : "#4b5563";

    dotCells.push(
      `<td align="center"><table cellpadding="0" cellspacing="0" style="margin:0 auto"><tr>` +
      `<td align="center" width="28" height="28" style="width:28px;height:28px;border-radius:14px;background:${dotBg};border:2px solid ${done ? "#10b981" : active ? GOLD : "#2a2a2a"};text-align:center;vertical-align:middle;font-size:11px;font-weight:800;color:${dotColor};line-height:24px">` +
      `${done ? "&#10003;" : s}</td></tr></table></td>`
    );
    labelCells.push(
      `<td align="center" style="padding:6px 2px 0;vertical-align:top"><p style="margin:0;font-size:10px;color:${labelColor};font-weight:${active ? 700 : 400};line-height:1.4">${name}</p></td>`
    );

    if (i < stages.length - 1) {
      const lineColor = i + 1 < activeStage ? "#10b981" : "#2a2a2a";
      dotCells.push(`<td style="vertical-align:middle;padding-bottom:4px"><div style="height:2px;background:${lineColor}"></div></td>`);
      labelCells.push(`<td></td>`);
    }
  });

  return `<table width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0 8px"><tr>${dotCells.join("")}</tr><tr>${labelCells.join("")}</tr></table>`;
}

export async function sendTrackingUpdate(data: {
  name: string; email: string; ref: string;
  templateId: string; message: string; tracking_number?: string | null;
}) {
  const tmpl = TRACKING_TEMPLATES[data.templateId] ?? TRACKING_TEMPLATES.custom;

  const bodyHtml = data.message
    ? data.message.split("\n\n").map(p =>
        `<p style="margin:0 0 14px;color:#9ca3af;font-size:15px;line-height:1.7">${p}</p>`
      ).join("")
    : "";

  const trackingHtml = data.tracking_number
    ? `<div style="background:${DARK2};border:1px solid #3b82f644;border-left:3px solid #3b82f6;border-radius:0 12px 12px 0;padding:16px 20px;margin:16px 0 20px">
        <p style="margin:0 0 4px;color:${MUTED};font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em">Your Tracking Number</p>
        <p style="margin:0;color:#93c5fd;font-size:20px;font-weight:700;font-family:monospace;letter-spacing:0.08em">${data.tracking_number}</p>
       </div>`
    : "";

  const html = layout(`
    <div style="margin-bottom:16px">${statusPill(tmpl.pillText, tmpl.pillColor)}</div>
    <div style="font-size:36px;margin-bottom:12px;line-height:1">${tmpl.icon}</div>
    <h1 style="margin:0 0 6px;color:#f9fafb;font-size:26px;font-weight:900">${tmpl.title}</h1>
    <p style="margin:0 0 4px;color:${MUTED};font-size:13px">Order: <strong style="color:${GOLD}">${data.ref}</strong></p>
    ${divider()}
    <p style="margin:0 0 14px;color:#9ca3af;font-size:15px">Dear ${data.name.split(" ")[0]},</p>
    ${tmpl.stage > 0 ? progressBar(tmpl.stage) : ""}
    ${trackingHtml}
    ${bodyHtml}
    <div style="margin-top:8px">
      ${btn("✉️ Email Us", `mailto:${SUPPORT_EMAIL}?subject=Order%20${data.ref}`, GOLD, BLACK)}
    </div>
  `);

  await sendMail({ to: data.email, subject: tmpl.subject, html });
}

// ─── 4. Quote Reply ───────────────────────────────────────────────────────────
export async function sendQuoteReply(data: { name: string; email: string; ref: string; package: string; price: string; message: string }) {
  const html = layout(`
    ${label("Your Quote is Ready")}
    <h1 style="margin:6px 0 6px;color:#f9fafb;font-size:28px;font-weight:900">Hi ${data.name.split(" ")[0]}, here is your quote</h1>
    <p style="margin:0 0 28px;color:${MUTED};font-size:13px">Reference: <strong style="color:#e5e7eb">${data.ref}</strong></p>

    <!-- Package card -->
    <div style="background:${DARK2};border:1px solid ${GOLD}44;border-radius:14px;padding:28px;margin-bottom:24px;text-align:center">
      ${label("Recommended Package")}
      <p style="margin:8px 0 20px;color:#f9fafb;font-size:22px;font-weight:900">${data.package}</p>
      <div style="height:1px;background:${BORDER};margin:0 0 20px"></div>
      ${label("Estimated Price")}
      <p style="margin:8px 0 0;color:${GOLD};font-size:34px;font-weight:900;letter-spacing:0.02em">${data.price}</p>
    </div>

    ${data.message ? `
    <p style="margin:0 0 10px;color:#e5e7eb;font-size:15px;font-weight:700">Message from our team</p>
    <div style="background:${DARK2};border:1px solid ${BORDER};border-left:3px solid ${GOLD};border-radius:0 12px 12px 0;padding:16px 20px;margin-bottom:28px">
      <p style="margin:0;color:#d1d5db;font-size:14px;line-height:1.8">${data.message.replace(/\n/g, "<br>")}</p>
    </div>` : ""}

    <p style="color:#9ca3af;font-size:14px;margin:0 0 20px">Ready to proceed or have questions?</p>
    ${btn("Accept Quote", `mailto:${SUPPORT_EMAIL}?subject=Accept%20quote%20${data.ref}`, GOLD, BLACK)}
    &nbsp;&nbsp;
    ${btn("Ask a Question", `mailto:${SUPPORT_EMAIL}?subject=Question%20about%20quote%20${data.ref}`, GOLD, BLACK)}
  `);

  await sendMail({ to: data.email, subject: `Your Quote — ${data.ref} | Daisy Gadgets Co.`, html });
}

// ─── Credit Emails ───────────────────────────────────────────────────────────

export async function sendCreditOtp(data: { email: string; otp: string; purpose: "application" | "account" }) {
  const purposeText = data.purpose === "application"
    ? "complete your credit application"
    : "access your credit account";
  const html = layout(`
    ${label("Verification Code")}
    <h1 style="margin:6px 0 10px;color:#f9fafb;font-size:28px;font-weight:900">Your OTP</h1>
    <p style="margin:0 0 24px;color:#9ca3af;font-size:15px;line-height:1.6">
      Use the code below to ${purposeText}. It expires in <strong style="color:#e5e7eb">10 minutes</strong>.
    </p>
    <div style="background:#0A0A0A;border:1px solid ${GOLD}55;border-radius:14px;padding:32px;text-align:center;margin-bottom:28px">
      <p style="margin:0;color:${GOLD};font-size:48px;font-weight:900;letter-spacing:0.3em;font-family:monospace">${data.otp}</p>
    </div>
    <p style="margin:0;color:#4b5563;font-size:13px">If you did not request this code, please ignore this email.</p>
  `);
  await sendMail({ to: data.email, subject: `Your OTP: ${data.otp} — Daisy Gadgets Co.`, html });
}

export async function sendCreditApplicationReceived(data: { name: string; email: string; ref: string; amount: number; term: number }) {
  const html = layout(`
    ${label("Credit Application")}
    <h1 style="margin:6px 0 10px;color:#f9fafb;font-size:28px;font-weight:900">Application Received</h1>
    <p style="margin:0 0 24px;color:#9ca3af;font-size:15px;line-height:1.6">
      Hi ${data.name.split(" ")[0]}, we have received your credit application <strong style="color:${GOLD}">${data.ref}</strong>.
      Our team will review your application and respond within <strong style="color:#e5e7eb">1–2 business days</strong>.
    </p>
    <div style="background:#161616;border:1px solid #1F1F1F;border-radius:12px;padding:20px 24px;margin-bottom:28px">
      <table width="100%" cellpadding="0" cellspacing="0">
        ${infoRow("Reference", data.ref)}
        ${infoRow("Requested Amount", `R ${data.amount.toLocaleString("en-ZA")}`)}
        ${infoRow("Repayment Term", `${data.term} months`)}
        ${infoRow("Status", "Under Review")}
      </table>
    </div>
    <p style="color:#9ca3af;font-size:14px;margin:0 0 20px">Questions? Contact us by email.</p>
    ${btn("Email Us", `mailto:${SUPPORT_EMAIL}?subject=Credit%20application%20${data.ref}`, GOLD, BLACK)}
  `);
  await sendMail({ to: data.email, subject: `Credit Application Received — ${data.ref} | Daisy Gadgets Co.`, html });
}

export async function sendCreditApproved(data: { name: string; email: string; ref: string; creditLimit: number }) {
  const html = layout(`
    <div style="text-align:center;margin-bottom:28px">
      <div style="font-size:48px;line-height:1;margin-bottom:12px">🎉</div>
      <h1 style="margin:0 0 8px;color:#f9fafb;font-size:26px;font-weight:900">Credit Approved!</h1>
      <p style="margin:0;color:#9ca3af;font-size:14px">Hi ${data.name.split(" ")[0]}, your credit application has been approved.</p>
    </div>
    <div style="background:#161616;border:1px solid ${GOLD}44;border-radius:14px;padding:28px;text-align:center;margin-bottom:28px">
      ${label("Your Credit Limit")}
      <p style="margin:8px 0 0;color:${GOLD};font-size:38px;font-weight:900">R ${data.creditLimit.toLocaleString("en-ZA")}</p>
    </div>
    <div style="background:#161616;border:1px solid #1F1F1F;border-radius:12px;padding:20px 24px;margin-bottom:28px">
      <p style="margin:0 0 12px;color:#e5e7eb;font-size:14px;font-weight:700">How it works:</p>
      <p style="margin:0 0 8px;color:#9ca3af;font-size:14px;line-height:1.7">1. Shop as normal and select <strong style="color:#e5e7eb">Pay on Credit</strong> at checkout.</p>
      <p style="margin:0 0 8px;color:#9ca3af;font-size:14px;line-height:1.7">2. Choose your repayment term (3, 6 or 12 months).</p>
      <p style="margin:0;color:#9ca3af;font-size:14px;line-height:1.7">3. Upload your monthly instalment proof by the due date.</p>
    </div>
    <div style="text-align:center">
      ${btn("View My Account", `${SITE}/credit/account`, GOLD, BLACK)}
      &nbsp;&nbsp;
      ${btn("Shop Now", `${SITE}/shop`, "#161616", GOLD)}
    </div>
  `);
  await sendMail({ to: data.email, subject: `Your Credit is Approved — R${data.creditLimit.toLocaleString("en-ZA")} | Daisy Gadgets Co.`, html });
}

export async function sendCreditRejected(data: { name: string; email: string; ref: string; reason?: string }) {
  const reasonHtml = data.reason
    ? `<div style="background:#161616;border-left:3px solid #ef4444;border-radius:0 10px 10px 0;padding:16px 20px;margin-bottom:24px">
        <p style="margin:0 0 4px;color:#ef4444;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em">Reason</p>
        <p style="margin:0;color:#fca5a5;font-size:14px;line-height:1.6">${data.reason}</p>
       </div>`
    : "";
  const html = layout(`
    ${label("Credit Application")}
    <h1 style="margin:6px 0 10px;color:#f9fafb;font-size:28px;font-weight:900">Application Outcome</h1>
    <p style="margin:0 0 20px;color:#9ca3af;font-size:15px;line-height:1.6">
      Hi ${data.name.split(" ")[0]}, unfortunately we were unable to approve your credit application <strong style="color:${GOLD}">${data.ref}</strong> at this time.
    </p>
    ${reasonHtml}
    <p style="margin:0 0 20px;color:#9ca3af;font-size:14px;line-height:1.7">
      You are welcome to reapply in 3 months. In the meantime, you can shop using our EFT payment option.
    </p>
    ${btn("Shop Now", `${SITE}/shop`, GOLD, BLACK)}
    &nbsp;&nbsp;
    ${btn("Email Us", `mailto:${SUPPORT_EMAIL}`, GOLD, BLACK)}
  `);
  await sendMail({ to: data.email, subject: `Credit Application Update — ${data.ref} | Daisy Gadgets Co.`, html });
}

export async function sendCreditOrderConfirmed(data: {
  name: string;
  email: string;
  orderRef: string;
  creditOrderRef: string;
  amount: number;
  termMonths: number;
  monthly: number;
  total: number;
  instalments: { instalment_number: number; due_date: string; amount: number }[];
}) {
  const scheduleRows = data.instalments.map(p =>
    `<tr>
      <td style="padding:8px 0;color:#6b7280;font-size:13px;border-bottom:1px solid #1F1F1F">Instalment ${p.instalment_number}</td>
      <td style="padding:8px 0;color:#e5e7eb;font-size:13px;font-weight:600;border-bottom:1px solid #1F1F1F">${new Date(p.due_date).toLocaleDateString("en-ZA", { day: "numeric", month: "long", year: "numeric" })}</td>
      <td style="padding:8px 0;color:${GOLD};font-size:13px;font-weight:700;text-align:right;border-bottom:1px solid #1F1F1F">R ${p.amount.toLocaleString("en-ZA")}</td>
    </tr>`
  ).join("");

  const html = layout(`
    <div style="text-align:center;margin-bottom:28px">
      <div style="font-size:48px;line-height:1;margin-bottom:12px">📋</div>
      <h1 style="margin:0 0 8px;color:#f9fafb;font-size:26px;font-weight:900">Order on Credit Confirmed!</h1>
      <p style="margin:0;color:#9ca3af;font-size:14px">Hi ${data.name.split(" ")[0]}, your order has been placed on your credit account.</p>
    </div>
    <div style="background:#161616;border:1px solid ${GOLD}44;border-radius:12px;padding:16px 20px;margin-bottom:24px">
      <table width="100%" cellpadding="0" cellspacing="0">
        ${infoRow("Order Ref", data.orderRef)}
        ${infoRow("Credit Agreement", data.creditOrderRef)}
        ${infoRow("Purchase Amount", `R ${data.amount.toLocaleString("en-ZA")}`)}
        ${infoRow("Repayment Term", `${data.termMonths} months`)}
        ${infoRow("Monthly Instalment", `R ${data.monthly.toLocaleString("en-ZA")}`)}
        ${infoRow("Total Repayable", `R ${data.total.toLocaleString("en-ZA")}`)}
      </table>
    </div>
    <p style="margin:0 0 12px;color:#e5e7eb;font-size:15px;font-weight:700">Repayment Schedule</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px">
      ${scheduleRows}
    </table>
    <div style="background:#161616;border:1px solid #1F1F1F;border-radius:12px;padding:16px 20px;margin-bottom:28px">
      <p style="margin:0;color:#9ca3af;font-size:13px;line-height:1.7">
        Upload your monthly instalment proof of payment on your credit account portal by each due date.
        Late payments may affect your credit standing.
      </p>
    </div>
    ${btn("View My Account", `${SITE}/credit/account`, GOLD, BLACK)}
  `);
  await sendMail({ to: data.email, subject: `Credit Order Confirmed — ${data.orderRef} | Daisy Gadgets Co.`, html });
}

// ─── 5. Welcome / Discount Code ──────────────────────────────────────────────
export async function sendWelcomeEmail(data: { name: string; email: string }) {
  const html = layout(`
    ${label("Welcome to the family")}
    <h1 style="margin:6px 0 10px;color:#f9fafb;font-size:28px;font-weight:900">
      ✨ You are in${data.name ? `, ${data.name.split(" ")[0]}` : ""}!
    </h1>
    <p style="margin:0 0 28px;color:#9ca3af;font-size:15px;line-height:1.6">Thank you for joining the Daisy Gadgets Co. family. Here is your exclusive first-order discount code:</p>

    <!-- Code card -->
    <div style="background:${BLACK};border:1px solid ${GOLD}55;border-radius:14px;padding:32px;text-align:center;margin-bottom:28px">
      ${label("Your Exclusive Discount Code")}
      <p style="margin:12px 0;color:${GOLD};font-size:40px;font-weight:900;letter-spacing:0.15em;font-family:monospace">DAISY25</p>
      <div style="height:1px;background:${BORDER};margin:16px 0"></div>
      <p style="margin:0;color:${MUTED};font-size:13px;line-height:1.6">💎 25% off your first order — mention this code by email<br>when placing your order. Valid for all products.</p>
    </div>

    <p style="color:#9ca3af;font-size:14px;margin:0 0 20px">Browse our full range of gadgets, appliances, solar solutions and more:</p>
    ${btn("🛍️ Shop Now", `${SITE}/shop`)}
    &nbsp;&nbsp;
    ${btn("✉️ Claim via Email", `mailto:${SUPPORT_EMAIL}?subject=Discount%20code%20DAISY25`, GOLD, BLACK)}
  `);

  await sendMail({ to: data.email, subject: "✨ Your 25% Discount Code — Daisy Gadgets Co.", html });
}

// ─── Installment: Approval + Invoice ─────────────────────────────────────────
export async function sendInstallmentApproval(data: {
  name: string;
  email: string;
  ref: string;
  product_name: string;
  product_price: number;
  deposit: number;
  monthly_payment: number;
  term_months: number;
  total_repayable: number;
  phone: string;
}) {
  const fmt = (n: number) => `R ${n.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}`;
  const waMsg = encodeURIComponent(
    `Hi, I received approval for my installment application ${data.ref} for the ${data.product_name}. I'm ready to pay my deposit of ${fmt(data.deposit)}.`
  );

  const bankRows = `
    <tr>
      <td colspan="2" style="padding:10px 0 4px;color:${MUTED};font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;border-top:1px solid ${BORDER}">TymeBank / GoTymeBank</td>
    </tr>
    ${infoRow("Account Holder", "Daisy Gadgets Co.")}
    ${infoRow("Account Type", "Business Account")}
    ${infoRow("Account Number", "51072673949")}
    ${infoRow("Branch Code", "678910")}
  `;

  const html = layout(`
    <!-- Approved badge -->
    <div style="text-align:center;margin-bottom:28px">
      <div style="display:inline-block;background:#10b98122;border:1px solid #10b98155;border-radius:50%;width:64px;height:64px;line-height:64px;font-size:28px;margin-bottom:12px">✅</div>
      <h1 style="margin:0 0 8px;color:#fff;font-size:22px;font-weight:900">Application Approved!</h1>
      <p style="margin:0;color:#9ca3af;font-size:14px">Hi ${data.name.split(" ")[0]}, your installment plan is confirmed.</p>
    </div>

    <!-- Ref + product -->
    <div style="background:${BLACK};border:1px solid ${GOLD}44;border-radius:12px;padding:16px 20px;margin-bottom:24px">
      ${label("Application Reference")}
      <p style="margin:4px 0 12px;color:${GOLD};font-size:24px;font-weight:900;font-family:monospace;letter-spacing:0.1em">${data.ref}</p>
      ${label("Product")}
      <p style="margin:4px 0 0;color:#fff;font-size:15px;font-weight:700">${data.product_name}</p>
    </div>

    ${divider()}

    <!-- Payment schedule -->
    <p style="margin:0 0 12px;color:#fff;font-size:15px;font-weight:700">Your Payment Schedule</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px">
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid ${BORDER};color:${MUTED};font-size:13px">Deposit <span style="color:#f59e0b;font-size:11px;font-weight:700">(pay first)</span></td>
        <td style="padding:10px 0;border-bottom:1px solid ${BORDER};color:#f59e0b;font-size:18px;font-weight:900;text-align:right">${fmt(data.deposit)}</td>
      </tr>
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid ${BORDER};color:${MUTED};font-size:13px">Monthly Payment × ${data.term_months} months</td>
        <td style="padding:10px 0;border-bottom:1px solid ${BORDER};color:${GOLD};font-size:18px;font-weight:900;text-align:right">${fmt(data.monthly_payment)}/mo</td>
      </tr>
      <tr>
        <td style="padding:10px 0;color:${MUTED};font-size:13px">Total Repayable</td>
        <td style="padding:10px 0;color:#e5e7eb;font-size:14px;font-weight:700;text-align:right">${fmt(data.total_repayable)}</td>
      </tr>
    </table>

    <!-- How to start -->
    <div style="background:#f59e0b11;border:1px solid #f59e0b44;border-radius:12px;padding:16px 20px;margin-bottom:24px">
      <p style="margin:0 0 6px;color:#f59e0b;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em">⚡ Next Step — Pay Your Deposit</p>
      <p style="margin:0;color:#d1d5db;font-size:13px;line-height:1.6">Transfer <strong style="color:#f59e0b">${fmt(data.deposit)}</strong> to one of our accounts below using <strong style="color:#fff">${data.ref}</strong> as your payment reference, then send proof of payment by email to activate your plan.</p>
    </div>

    ${divider()}

    <!-- Bank details -->
    <p style="margin:0 0 12px;color:#fff;font-size:15px;font-weight:700">Payment Details</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px">
      ${bankRows}
    </table>

    <!-- Email CTA -->
    <div style="text-align:center;margin-bottom:8px">
      ${btn("✉️ Send Proof of Payment by Email", `mailto:${SUPPORT_EMAIL}?subject=${waMsg}`, GOLD, BLACK)}
    </div>
    <p style="margin:12px 0 0;color:${MUTED};font-size:12px;text-align:center">Always use <strong style="color:#fff">${data.ref}</strong> as your payment reference.</p>
  `);

  await sendMail({
    to: data.email,
    subject: `✅ Installment Approved — ${data.ref} | Daisy Gadgets Co.`,
    html,
  });
}

// ─── Installment: Status Update Emails ───────────────────────────────────────

interface InstallmentUpdateBase {
  name: string;
  email: string;
  ref: string;
  product_name: string;
  deposit: number;
  monthly_payment: number;
  term_months: number;
  total_repayable: number;
  phone: string;
  admin_notes?: string | null;
}

function installmentHeader(emoji: string, title: string, subtitle: string) {
  return `
    <div style="text-align:center;margin-bottom:28px">
      <div style="display:inline-block;background:#ffffff0f;border-radius:50%;width:64px;height:64px;line-height:64px;font-size:28px;margin-bottom:12px">${emoji}</div>
      <h1 style="margin:0 0 8px;color:#fff;font-size:22px;font-weight:900">${title}</h1>
      <p style="margin:0;color:#9ca3af;font-size:14px">${subtitle}</p>
    </div>`;
}

function installmentRefCard(ref: string, product: string) {
  return `
    <div style="background:${BLACK};border:1px solid ${GOLD}44;border-radius:12px;padding:16px 20px;margin-bottom:24px">
      ${label("Application Reference")}
      <p style="margin:4px 0 12px;color:${GOLD};font-size:24px;font-weight:900;font-family:monospace;letter-spacing:0.1em">${ref}</p>
      ${label("Product")}
      <p style="margin:4px 0 0;color:#fff;font-size:15px;font-weight:700">${product}</p>
    </div>`;
}

function installmentSummaryTable(deposit: number, monthly: number, term: number, total: number) {
  const fmt = (n: number) => `R ${n.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}`;
  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px">
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid ${BORDER};color:${MUTED};font-size:13px">Deposit</td>
        <td style="padding:10px 0;border-bottom:1px solid ${BORDER};color:#f59e0b;font-size:16px;font-weight:900;text-align:right">${fmt(deposit)}</td>
      </tr>
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid ${BORDER};color:${MUTED};font-size:13px">Monthly x ${term} months</td>
        <td style="padding:10px 0;border-bottom:1px solid ${BORDER};color:${GOLD};font-size:16px;font-weight:900;text-align:right">${fmt(monthly)}/mo</td>
      </tr>
      <tr>
        <td style="padding:10px 0;color:${MUTED};font-size:13px">Total Repayable</td>
        <td style="padding:10px 0;color:#e5e7eb;font-size:14px;font-weight:700;text-align:right">${fmt(total)}</td>
      </tr>
    </table>`;
}

function bankDetailsBlock(ref: string) {
  return `
    <div style="background:#f59e0b0d;border:1px solid #f59e0b44;border-radius:12px;padding:16px 20px;margin-bottom:20px">
      <p style="margin:0 0 6px;color:#f59e0b;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em">Deposit Payment Details</p>
      <p style="margin:0 0 12px;color:#d1d5db;font-size:13px;line-height:1.6">Use <strong style="color:#fff">${ref}</strong> as your payment reference.</p>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr><td colspan="2" style="padding:6px 0 2px;color:${MUTED};font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em">TymeBank / GoTymeBank</td></tr>
        ${infoRow("Account", "Daisy Gadgets Co.")}
        ${infoRow("Account No.", "51072673949")}
        ${infoRow("Branch", "678910")}
      </table>
    </div>`;
}

export async function sendInstallmentReviewing(data: InstallmentUpdateBase) {
  const waMsg = encodeURIComponent(`Hi, I am following up on my installment application ${data.ref} for the ${data.product_name}.`);

  const html = layout(`
    ${installmentHeader("🔍", "Application Under Review", `Hi ${data.name.split(" ")[0]}, we are looking into your application.`)}
    ${installmentRefCard(data.ref, data.product_name)}

    <p style="color:#9ca3af;font-size:14px;line-height:1.7;margin:0 0 20px">
      Our team is currently reviewing your installment application. We will verify your details and get back to you as soon as possible — usually within <strong style="color:#fff">24 hours</strong>.
    </p>

    <div style="background:#3b82f611;border:1px solid #3b82f644;border-radius:12px;padding:16px 20px;margin-bottom:24px">
      <p style="margin:0 0 8px;color:#3b82f6;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em">What Happens Next</p>
      <p style="margin:0;color:#d1d5db;font-size:13px;line-height:1.8">
        1. We verify your details<br>
        2. We may reach out by email or phone to confirm information<br>
        3. You will receive an approval email with your full payment plan
      </p>
    </div>

    ${data.admin_notes ? `
    <div style="background:${BLACK};border:1px solid ${BORDER};border-radius:12px;padding:16px 20px;margin-bottom:24px">
      ${label("Note from our team")}
      <p style="margin:6px 0 0;color:#d1d5db;font-size:14px;line-height:1.6">${data.admin_notes}</p>
    </div>` : ""}

    <div style="text-align:center">
      ${btn("Email Us", `mailto:${SUPPORT_EMAIL}?subject=${waMsg}`, GOLD, BLACK)}
    </div>
  `);

  await sendMail({
    to: data.email,
    subject: `Application Under Review — ${data.ref} | Daisy Gadgets Co.`,
    html,
  });
}

export async function sendInstallmentAwaitingPayment(data: InstallmentUpdateBase) {
  const fmt = (n: number) => `R ${n.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}`;
  const waMsg = encodeURIComponent(`Hi, I am sending proof of payment for my installment deposit. Application: ${data.ref} — ${data.product_name}.`);

  const html = layout(`
    ${installmentHeader("💳", "Deposit Payment Required", `Hi ${data.name.split(" ")[0]}, one step away from activating your plan!`)}
    ${installmentRefCard(data.ref, data.product_name)}

    <p style="color:#9ca3af;font-size:14px;line-height:1.7;margin:0 0 20px">
      Your application has been processed. To activate your installment plan, please pay the deposit of <strong style="color:#f59e0b;font-size:16px">${fmt(data.deposit)}</strong> to one of our accounts below.
    </p>

    ${installmentSummaryTable(data.deposit, data.monthly_payment, data.term_months, data.total_repayable)}
    ${bankDetailsBlock(data.ref)}

    ${data.admin_notes ? `
    <div style="background:${BLACK};border:1px solid ${BORDER};border-radius:12px;padding:16px 20px;margin-bottom:24px">
      ${label("Note from our team")}
      <p style="margin:6px 0 0;color:#d1d5db;font-size:14px;line-height:1.6">${data.admin_notes}</p>
    </div>` : ""}

    <div style="text-align:center">
      ${btn("Send Proof of Payment", `mailto:${SUPPORT_EMAIL}?subject=${waMsg}`, GOLD, BLACK)}
    </div>
    <p style="margin:12px 0 0;color:${MUTED};font-size:12px;text-align:center">After we confirm receipt, your plan will be activated immediately.</p>
  `);

  await sendMail({
    to: data.email,
    subject: `Deposit Required — ${data.ref} | Daisy Gadgets Co.`,
    html,
  });
}

export async function sendInstallmentActive(data: InstallmentUpdateBase) {
  const fmt = (n: number) => `R ${n.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}`;
  const waMsg = encodeURIComponent(`Hi, I would like to check on my active installment plan ${data.ref} for the ${data.product_name}.`);

  const html = layout(`
    ${installmentHeader("🟢", "Your Plan is Now Active!", `Hi ${data.name.split(" ")[0]}, welcome to your installment plan.`)}
    ${installmentRefCard(data.ref, data.product_name)}

    <p style="color:#9ca3af;font-size:14px;line-height:1.7;margin:0 0 20px">
      Your deposit has been received and your installment plan is now <strong style="color:#10b981">active</strong>. Here is your monthly payment schedule:
    </p>

    <div style="background:#10b98111;border:1px solid #10b98144;border-radius:12px;padding:20px;margin-bottom:24px;text-align:center">
      ${label("Your Monthly Payment")}
      <p style="margin:8px 0 4px;color:#10b981;font-size:36px;font-weight:900">${fmt(data.monthly_payment)}<span style="font-size:16px;color:#9ca3af">/month</span></p>
      <p style="margin:0;color:#9ca3af;font-size:13px">x ${data.term_months} months &nbsp;&middot;&nbsp; Total: ${fmt(data.total_repayable)}</p>
    </div>

    <div style="background:${BLACK};border:1px solid ${BORDER};border-radius:12px;padding:16px 20px;margin-bottom:24px">
      <p style="margin:0 0 10px;color:#fff;font-size:14px;font-weight:700">Payment Instructions</p>
      <p style="margin:0 0 8px;color:#d1d5db;font-size:13px;line-height:1.6">Make your monthly payment to the same bank account using <strong style="color:${GOLD}">${data.ref}</strong> as your reference.</p>
      <p style="margin:0;color:#d1d5db;font-size:13px;line-height:1.6">Send proof of each monthly payment by email to keep your account in good standing.</p>
    </div>

    ${data.admin_notes ? `
    <div style="background:${BLACK};border:1px solid ${BORDER};border-radius:12px;padding:16px 20px;margin-bottom:24px">
      ${label("Note from our team")}
      <p style="margin:6px 0 0;color:#d1d5db;font-size:14px;line-height:1.6">${data.admin_notes}</p>
    </div>` : ""}

    <div style="text-align:center">
      ${btn("Contact Us by Email", `mailto:${SUPPORT_EMAIL}?subject=${waMsg}`, GOLD, BLACK)}
    </div>
  `);

  await sendMail({
    to: data.email,
    subject: `Plan Activated — ${data.ref} | Daisy Gadgets Co.`,
    html,
  });
}

export async function sendInstallmentCompleted(data: InstallmentUpdateBase) {
  const fmt = (n: number) => `R ${n.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}`;
  const waMsg = encodeURIComponent(`Hi, I would like to enquire about another product on installments. My previous plan was ${data.ref}.`);

  const html = layout(`
    ${installmentHeader("🏆", "Fully Paid — Congratulations!", `Hi ${data.name.split(" ")[0]}, you have completed your installment plan!`)}
    ${installmentRefCard(data.ref, data.product_name)}

    <p style="color:#9ca3af;font-size:14px;line-height:1.7;margin:0 0 20px">
      You have successfully completed all payments on your installment plan. Thank you for trusting Daisy Gadgets Co. — we truly appreciate your commitment.
    </p>

    <div style="background:#D4AF3711;border:1px solid #D4AF3744;border-radius:12px;padding:20px;margin-bottom:24px;text-align:center">
      ${label("Total Paid")}
      <p style="margin:8px 0 4px;color:${GOLD};font-size:36px;font-weight:900">${fmt(data.total_repayable)}</p>
      <p style="margin:0;color:#9ca3af;font-size:13px">${data.term_months} monthly payments &nbsp;&middot;&nbsp; Plan complete</p>
    </div>

    <div style="background:${BLACK};border:1px solid ${BORDER};border-radius:12px;padding:16px 20px;margin-bottom:24px">
      <p style="margin:0 0 6px;color:#fff;font-size:14px;font-weight:700">Interested in another product?</p>
      <p style="margin:0;color:#9ca3af;font-size:13px;line-height:1.6">As a returning customer, you may be eligible for priority approval on your next installment application. Email us to get started.</p>
    </div>

    <div style="text-align:center">
      ${btn("Shop Again", `${SITE}/shop`)}
      &nbsp;&nbsp;
      ${btn("Email Us", `mailto:${SUPPORT_EMAIL}?subject=${waMsg}`, GOLD, BLACK)}
    </div>
  `);

  await sendMail({
    to: data.email,
    subject: `Plan Complete — ${data.ref} | Daisy Gadgets Co.`,
    html,
  });
}

export async function sendInstallmentDeclined(data: InstallmentUpdateBase) {
  const waMsg = encodeURIComponent(`Hi, I would like to discuss my declined installment application ${data.ref} for the ${data.product_name} and explore other options.`);

  const html = layout(`
    ${installmentHeader("📋", "Application Update", `Hi ${data.name.split(" ")[0]}, regarding your application ${data.ref}.`)}

    <p style="color:#9ca3af;font-size:14px;line-height:1.7;margin:0 0 20px">
      Thank you for applying for an installment plan on the <strong style="color:#fff">${data.product_name}</strong>. After reviewing your application, we are unfortunately unable to approve it at this time.
    </p>

    ${data.admin_notes ? `
    <div style="background:${BLACK};border:1px solid ${BORDER};border-radius:12px;padding:16px 20px;margin-bottom:24px">
      ${label("Reason")}
      <p style="margin:6px 0 0;color:#d1d5db;font-size:14px;line-height:1.6">${data.admin_notes}</p>
    </div>` : ""}

    <div style="background:#3b82f611;border:1px solid #3b82f644;border-radius:12px;padding:16px 20px;margin-bottom:24px">
      <p style="margin:0 0 8px;color:#3b82f6;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em">Other Options Available</p>
      <p style="margin:0;color:#d1d5db;font-size:13px;line-height:1.8">
        Pay via EFT / bank transfer and get the product immediately<br>
        Enquire about a higher deposit arrangement<br>
        Re-apply in 3 months with updated information<br>
        Contact us to discuss a custom payment plan
      </p>
    </div>

    <p style="color:#9ca3af;font-size:14px;line-height:1.7;margin:0 0 24px">
      We are happy to explore other ways to help you get the product you want. Do not hesitate to reach out.
    </p>

    <div style="text-align:center">
      ${btn("Discuss Options by Email", `mailto:${SUPPORT_EMAIL}?subject=${waMsg}`, GOLD, BLACK)}
      <br><br>
      ${btn("Browse Other Products", `${SITE}/shop`)}
    </div>
  `);

  await sendMail({
    to: data.email,
    subject: `Application Update — ${data.ref} | Daisy Gadgets Co.`,
    html,
  });
}

// ─── 6. Order placed — clear cart reminder ────────────────────────────────────
export async function sendClearCartReminder(data: {
  name: string;
  email: string;
  ref: string;
  items: { name: string; price: string; qty: number; imageUrl?: string }[];
}) {
  const { attachments: imgAttachments, cidMap } = await buildProductAttachments(data.items);

  const itemRows = data.items.map((i) => {
    const src = i.imageUrl
      ? (cidMap.get(i.imageUrl) ?? (i.imageUrl.startsWith("http") ? i.imageUrl : SITE + i.imageUrl))
      : null;
    const thumb = src
      ? `<img src="${src}" alt="${i.name}" width="64" height="64" style="width:64px;height:64px;object-fit:cover;border-radius:10px;display:block;border:1px solid ${BORDER}" />`
      : `<div style="width:64px;height:64px;background:${DARK2};border:1px solid ${BORDER};border-radius:10px"></div>`;
    return `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid ${BORDER};width:76px;vertical-align:middle">${thumb}</td>
      <td style="padding:10px 12px;border-bottom:1px solid ${BORDER};vertical-align:middle">
        <p style="margin:0 0 3px;color:#e5e7eb;font-size:14px;font-weight:600">${i.name}</p>
        <p style="margin:0;color:${MUTED};font-size:12px">Qty: ${i.qty}</p>
      </td>
      <td style="padding:10px 0;border-bottom:1px solid ${BORDER};text-align:right;vertical-align:middle">
        <span style="color:${GOLD};font-size:13px;font-weight:700">${i.price}</span>
      </td>
    </tr>`;
  }).join("");

  const content = `
    <h1 style="margin:0 0 6px;color:#fff;font-size:24px;font-weight:800;letter-spacing:-0.02em">Order placed!</h1>
    <p style="margin:0 0 24px;color:${MUTED};font-size:15px">Hi ${data.name.split(" ")[0]}, your order <strong style="color:${GOLD}">${data.ref}</strong> is in — we're waiting for your proof of payment.</p>

    <!-- Items ordered -->
    <p style="margin:0 0 12px;color:#e5e7eb;font-size:14px;font-weight:700">Items in your order</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px">
      ${itemRows}
    </table>

    <!-- Clear cart notice -->
    <div style="background:${DARK2};border:1px solid #f59e0b44;border-radius:12px;padding:20px 24px;margin-bottom:28px">
      <p style="margin:0 0 8px;color:#f59e0b;font-size:14px;font-weight:700">Remove these from your cart</p>
      <p style="margin:0;color:#9ca3af;font-size:13px;line-height:1.6">
        Your order is now in our system. To avoid placing the same order twice, please clear your cart the next time you visit our shop.
      </p>
    </div>

    <div style="text-align:center;margin-bottom:28px">
      ${btn("Go to Shop", `${SITE}/shop`)}
    </div>

    ${divider()}
    <p style="margin:0;color:${MUTED};font-size:13px;text-align:center">
      Questions? ${btn("Email Us", `mailto:${SUPPORT_EMAIL}?subject=Order%20${encodeURIComponent(data.ref)}`, DARK2, GOLD)}
    </p>
  `;

  await sendMail({
    to: data.email,
    subject: `Order ${data.ref} received — clear your cart | Daisy Gadgets Co.`,
    html: layout(content),
    attachments: imgAttachments,
  });
}

// ─── 7. Campaign / broadcast email ───────────────────────────────────────────
export async function sendCampaignEmail(data: {
  to: string;
  name: string;
  subject: string;
  heading: string;
  body: string;
  ctaText?: string;
  ctaUrl?: string;
  featuredProducts?: { id: string; name: string; price: string; imageUrl?: string }[];
  orderItems?: { id?: string; name: string; price: string; qty: number; imageUrl?: string }[];
  orderRef?: string;
  restoreCartUrl?: string;
  trackingId?: string;
}) {
  const ctaHref = data.ctaUrl && data.trackingId
    ? `${SITE}/api/track/email?id=${data.trackingId}&e=click&url=${encodeURIComponent(data.ctaUrl)}`
    : data.ctaUrl;
  const cta = data.ctaText && ctaHref
    ? `<div style="text-align:center;margin:28px 0">${btn(data.ctaText, ctaHref)}</div>`
    : "";
  const pixel = data.trackingId
    ? `<img src="${SITE}/api/track/email?id=${data.trackingId}&e=open" width="1" height="1" style="display:none;width:1px;height:1px;border:0" alt="" />`
    : "";

  let productSection = "";
  let imgAttachments: MailAttachment[] = [];

  // ── Order items (personalised — from customer's actual order) ──────────────
  if (data.orderItems?.length) {
    const { attachments, cidMap } = await buildProductAttachments(
      data.orderItems.map((i) => ({ name: i.name, imageUrl: i.imageUrl }))
    );
    imgAttachments = attachments;

    const itemRows = data.orderItems.map((i) => {
      const src = i.imageUrl
        ? (cidMap.get(i.imageUrl) ?? (i.imageUrl.startsWith("http") ? i.imageUrl : SITE + i.imageUrl))
        : null;
      const thumb = src
        ? `<img src="${src}" alt="${i.name}" width="64" height="64" style="width:64px;height:64px;object-fit:cover;border-radius:10px;display:block;border:1px solid ${BORDER}" />`
        : `<div style="width:64px;height:64px;background:${DARK2};border:1px solid ${BORDER};border-radius:10px"></div>`;
      const productLink = i.id ? `${SITE}/shop/${i.id}` : `${SITE}/shop`;
      return `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid ${BORDER};width:76px;vertical-align:middle">
          <a href="${productLink}">${thumb}</a>
        </td>
        <td style="padding:10px 12px;border-bottom:1px solid ${BORDER};vertical-align:middle">
          <a href="${productLink}" style="text-decoration:none">
            <p style="margin:0 0 3px;color:#e5e7eb;font-size:14px;font-weight:600">${i.name}</p>
            <p style="margin:0;color:${MUTED};font-size:12px">Qty: ${i.qty}</p>
          </a>
        </td>
        <td style="padding:10px 0;border-bottom:1px solid ${BORDER};text-align:right;vertical-align:middle">
          <span style="color:${GOLD};font-size:13px;font-weight:700">${i.price}</span>
        </td>
      </tr>`;
    }).join("");

    const refLine = data.orderRef
      ? `<p style="margin:0 0 14px;color:${MUTED};font-size:12px">Order ref: <span style="color:${GOLD};font-weight:700;font-family:monospace">${data.orderRef}</span></p>`
      : "";

    const restoreBtn = data.restoreCartUrl
      ? `<div style="text-align:center;margin-top:20px">${btn("Complete Your Order →", data.restoreCartUrl)}</div>`
      : "";

    productSection = `
      ${divider()}
      <p style="margin:0 0 4px;color:#e5e7eb;font-size:14px;font-weight:700">Your last order</p>
      ${refLine}
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:8px">
        ${itemRows}
      </table>
      ${restoreBtn}`;

  // ── Featured products (admin-picked — same for everyone) ───────────────────
  } else if (data.featuredProducts?.length) {
    const { attachments, cidMap } = await buildProductAttachments(
      data.featuredProducts.map((p) => ({ name: p.name, imageUrl: p.imageUrl }))
    );
    imgAttachments = attachments;

    const productCells = data.featuredProducts.map((p) => {
      const src = p.imageUrl
        ? (cidMap.get(p.imageUrl) ?? (p.imageUrl.startsWith("http") ? p.imageUrl : SITE + p.imageUrl))
        : null;
      const thumb = src
        ? `<img src="${src}" alt="${p.name}" width="200" style="width:100%;max-width:200px;height:140px;object-fit:cover;border-radius:10px;display:block;border:1px solid ${BORDER}" />`
        : `<div style="width:100%;height:140px;background:${DARK2};border:1px solid ${BORDER};border-radius:10px"></div>`;
      return `
        <td style="width:48%;vertical-align:top;padding:6px">
          <a href="${SITE}/shop/${p.id}" style="text-decoration:none;display:block">
            ${thumb}
            <p style="margin:10px 0 4px;color:#e5e7eb;font-size:13px;font-weight:600;line-height:1.3">${p.name}</p>
            <p style="margin:0;color:${GOLD};font-size:14px;font-weight:800">${p.price}</p>
          </a>
        </td>`;
    });

    const rows: string[] = [];
    for (let i = 0; i < productCells.length; i += 2) {
      rows.push(`<tr>${productCells.slice(i, i + 2).join("")}</tr>`);
    }

    productSection = `
      ${divider()}
      <p style="margin:0 0 16px;color:#e5e7eb;font-size:14px;font-weight:700">Featured Products</p>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:8px">
        ${rows.join("")}
      </table>`;
  }

  const content = `
    <h1 style="margin:0 0 20px;color:#fff;font-size:22px;font-weight:800;letter-spacing:-0.02em">${data.heading}</h1>
    <div style="color:#d1d5db;font-size:14px;line-height:1.75;white-space:pre-wrap">${data.body}</div>
    ${cta}
    ${productSection}
    ${divider()}
    <p style="margin:0;color:${MUTED};font-size:12px;text-align:center">
      You received this because you placed an order with Daisy Gadgets Co.
    </p>
    ${pixel}
  `;

  await sendMail({
    to: data.to,
    subject: data.subject,
    html: layout(content),
    attachments: imgAttachments.length ? imgAttachments : undefined,
  });
}
