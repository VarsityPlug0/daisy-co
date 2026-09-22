import nodemailer from "nodemailer";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, "..", "data", "daisy.db");
const db = new Database(dbPath);

const GOLD        = "#C8B993";
const GOLD_LIGHT  = "#f5d76e";
const BLACK       = "#111111";
const DARK        = "#181818";
const DARK2       = "#202020";
const DARK3       = "#252525";
const BORDER      = "#2d2d2d";
const BORDER_GOLD = "#C8B99344";
const MUTED       = "#9ca3af";
const TEXT_LIGHT  = "#e5e7eb";
const SITE        = "https://gadgets.bevanssons.store";
const SUPPORT_EMAIL = "support@bevanssons.store";
const WHATSAPP_NUM  = "082 587 6811";

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
      auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS.replace(/\s+/g, "") },
    });
  }
  return null;
}

function fromAddress() {
  if (process.env.RESEND_API_KEY) {
    return `"Bevanssons" <noreply@bevanssons.store>`;
  }
  const user = process.env.MAIL_USER ?? "support@bevanssons.store";
  return `"Bevanssons" <${user}>`;
}

function layout(content, preheaderText = "") {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Your Reserved Items Are Waiting | Bevanssons</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td {font-family: Arial, Helvetica, sans-serif !important;}
  </style>
  <![endif]-->
</head>
<body style="margin:0;padding:0;background:${BLACK};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased">
  <div style="display:none;font-size:1px;color:#333333;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden">
    ${preheaderText}
  </div>

  <table width="100%" cellpadding="0" cellspacing="0" style="background:${BLACK};padding:32px 12px">
    <tr><td align="center">
      <table width="620" cellpadding="0" cellspacing="0" style="max-width:620px;width:100%;border-radius:16px;overflow:hidden;border:1px solid ${BORDER};background:${DARK}">

        <!-- Gold gradient top accent -->
        <tr>
          <td style="background:linear-gradient(90deg,${BLACK},${GOLD},${GOLD_LIGHT},${GOLD},${BLACK});height:4px;font-size:0;line-height:0">&nbsp;</td>
        </tr>

        <!-- Header Brand Bar -->
        <tr>
          <td style="background:${BLACK};padding:22px 32px;border-bottom:1px solid ${BORDER}">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <table cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="vertical-align:middle">
                        <div style="display:inline-block;width:32px;height:32px;border-radius:8px;background:${GOLD};color:${BLACK};font-weight:900;font-size:18px;line-height:32px;text-align:center">B</div>
                      </td>
                      <td style="padding-left:12px;vertical-align:middle">
                        <span style="font-size:17px;font-weight:900;color:${GOLD};letter-spacing:0.08em">BEVANSSONS</span>
                        <span style="display:block;font-size:10px;color:${MUTED};letter-spacing:0.12em;text-transform:uppercase">Premium Gadgets & Electronics</span>
                      </td>
                    </tr>
                  </table>
                </td>
                <td align="right" style="vertical-align:middle">
                  <a href="${SITE}" style="color:${MUTED};font-size:12px;text-decoration:none;border:1px solid ${BORDER};padding:6px 14px;border-radius:20px">Visit Store &rarr;</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Main Body Content -->
        <tr>
          <td style="padding:36px 32px">
            ${content}
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:${BLACK};padding:28px 32px;border-top:1px solid ${BORDER}">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td align="center" style="padding-bottom:16px">
                  <p style="margin:0 0 6px;color:${TEXT_LIGHT};font-size:13px;font-weight:700">Need help with your order?</p>
                  <p style="margin:0;color:${MUTED};font-size:12px">
                    WhatsApp: <a href="https://wa.me/27825876811" style="color:${GOLD};text-decoration:none;font-weight:700">${WHATSAPP_NUM}</a>
                    &nbsp;&nbsp;·&nbsp;&nbsp;
                    Email: <a href="mailto:${SUPPORT_EMAIL}" style="color:${GOLD};text-decoration:none">${SUPPORT_EMAIL}</a>
                  </p>
                </td>
              </tr>
              <tr>
                <td align="center" style="border-top:1px solid #222;padding-top:16px">
                  <p style="margin:0 0 4px;color:#555;font-size:11px">
                    &copy; ${new Date().getFullYear()} Bevanssons · 36 Houer Road, City Deep, Johannesburg · South Africa
                  </p>
                  <p style="margin:0;color:#444;font-size:10px">
                    POPIA Compliant · 256-Bit SSL Secured Checkout · Guaranteed Delivery
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Bottom Accent -->
        <tr>
          <td style="background:linear-gradient(90deg,${BLACK},${GOLD},${GOLD_LIGHT},${GOLD},${BLACK});height:2px;font-size:0;line-height:0">&nbsp;</td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function resolveImageUrl(url) {
  if (!url) return "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=600&q=85&auto=format&fit=crop";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${SITE}${url.startsWith("/") ? "" : "/"}${url}`;
}

function cartItemCard(item) {
  const img = resolveImageUrl(item.imageUrl);
  const cat = item.category || "Gadgets";
  return `
  <table width="100%" cellpadding="0" cellspacing="0" style="background:${DARK2};border:1px solid ${BORDER};border-radius:12px;margin-bottom:12px;overflow:hidden">
    <tr>
      <td width="96" style="width:96px;padding:14px;vertical-align:middle;background:${DARK3}">
        <img src="${img}" alt="${item.name}" width="80" height="80" style="width:80px;height:80px;object-fit:cover;border-radius:10px;display:block;border:1px solid ${BORDER}" />
      </td>
      <td style="padding:14px 16px;vertical-align:middle">
        <div style="display:inline-block;background:#38bdf818;color:#38bdf8;border:1px solid #38bdf833;font-size:10px;font-weight:700;padding:2px 8px;border-radius:12px;margin-bottom:6px;text-transform:uppercase;letter-spacing:0.06em">
          ${cat}
        </div>
        <h3 style="margin:0 0 4px;color:#ffffff;font-size:15px;font-weight:700;line-height:1.3">
          ${item.name}
        </h3>
        <p style="margin:0;color:${MUTED};font-size:12px">
          Quantity: <strong style="color:${TEXT_LIGHT}">${item.qty || 1}</strong> &nbsp;·&nbsp;
          <span style="color:#22c55e">✓ In Stock &amp; Reserved</span>
        </p>
      </td>
      <td align="right" style="padding:14px 18px;vertical-align:middle;white-space:nowrap">
        <div style="font-size:11px;color:${MUTED};text-transform:uppercase">Price</div>
        <div style="font-size:16px;font-weight:900;color:${GOLD};letter-spacing:0.02em">
          ${typeof item.price === "number" ? "R " + item.price.toLocaleString("en-ZA") : (String(item.price).startsWith("R") ? item.price : "R " + item.price)}
        </div>
      </td>
    </tr>
  </table>`;
}

function buildEmailHtml(order) {
  const whatsappLink = `https://wa.me/27825876811?text=Hi%20Bevanssons%2C%20I%20have%20an%20enquiry%20about%20my%20order%20${order.ref}`;
  const totalFormatted = "R " + Number(order.total).toLocaleString("en-ZA");
  const firstName = order.name ? order.name.split(" ")[0] : "there";

  return layout(`
    <!-- Top Urgency Pill -->
    <div style="text-align:center;margin-bottom:20px">
      <div style="display:inline-block;background:#f59e0b1f;color:#f59e0b;border:1px solid #f59e0b55;padding:6px 18px;border-radius:24px;font-size:12px;font-weight:800;letter-spacing:0.06em">
        ⏳ ORDER HOLD: ${order.ref} &nbsp;·&nbsp; ACTION REQUIRED
      </div>
    </div>

    <!-- Hero Header -->
    <div style="text-align:center;margin-bottom:28px">
      <h1 style="margin:0 0 10px;color:#ffffff;font-size:25px;font-weight:900;line-height:1.25;letter-spacing:-0.02em">
        Your Reserved Items Are Ready For You
      </h1>
      <p style="margin:0 auto;max-width:500px;color:${MUTED};font-size:14px;line-height:1.6">
        Hi ${firstName}, the items you enquired about have been reserved in your cart. We have upgraded to <strong style="color:#ffffff">instant online PayFast checkout</strong> so you can confirm your purchase immediately.
      </p>
    </div>

    <!-- Cart Items Section -->
    <div style="margin-bottom:24px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
        <span style="font-size:13px;font-weight:800;color:${GOLD};letter-spacing:0.08em;text-transform:uppercase">
          🛒 Your Cart Items (${order.items.length})
        </span>
        <span style="font-size:12px;color:${MUTED};float:right">
          Ref: <code style="color:${GOLD};background:#000;padding:2px 6px;border-radius:4px;font-family:monospace">${order.ref}</code>
        </span>
        <div style="clear:both"></div>
      </div>

      <!-- Rendered Cards -->
      ${order.items.map(cartItemCard).join("")}

      <!-- Order Total Breakdown -->
      <table width="100%" cellpadding="0" cellspacing="0" style="background:${DARK2};border:1px solid ${BORDER};border-radius:12px;padding:16px 20px;margin-top:14px">
        <tr>
          <td style="padding:6px 0;color:${MUTED};font-size:13px">Cart Subtotal</td>
          <td align="right" style="padding:6px 0;color:${TEXT_LIGHT};font-size:13px;font-weight:600">${totalFormatted}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;color:${MUTED};font-size:13px">Same-Day / Express Courier Delivery</td>
          <td align="right" style="padding:6px 0;color:#22c55e;font-size:13px;font-weight:700">FREE INCLUDED</td>
        </tr>
        <tr>
          <td colspan="2" style="height:1px;background:${BORDER};padding:0;margin:8px 0">&nbsp;</td>
        </tr>
        <tr>
          <td style="padding:10px 0 4px;color:#ffffff;font-size:16px;font-weight:800">Total Due</td>
          <td align="right" style="padding:10px 0 4px;color:${GOLD};font-size:20px;font-weight:900">${totalFormatted}</td>
        </tr>
      </table>
    </div>

    <!-- Why Instant PayFast Highlight Box -->
    <div style="background:${DARK2};border:1px solid ${BORDER_GOLD};border-radius:14px;padding:20px;margin-bottom:28px">
      <p style="margin:0 0 8px;color:${GOLD};font-size:13px;font-weight:800;letter-spacing:0.06em;text-transform:uppercase">
        ⚡ Pay Online Instantly — No Waiting, No Deposit Slips
      </p>
      <p style="margin:0 0 14px;color:#d1d5db;font-size:13px;line-height:1.6">
        Payments now process automatically through <strong>PayFast Secure</strong>. Your order is verified in seconds and immediately queued for packing:
      </p>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding:4px 0;color:${TEXT_LIGHT};font-size:12px;vertical-align:middle">
            💳 <strong style="color:#ffffff">Credit &amp; Debit Cards</strong> — Visa, Mastercard &amp; Amex
          </td>
        </tr>
        <tr>
          <td style="padding:4px 0;color:${TEXT_LIGHT};font-size:12px;vertical-align:middle">
            🏦 <strong style="color:#ffffff">Instant EFT &amp; Capitec Pay</strong> — Standard Bank, Capitec, FNB, Nedbank, ABSA
          </td>
        </tr>
        <tr>
          <td style="padding:4px 0;color:${TEXT_LIGHT};font-size:12px;vertical-align:middle">
            🚀 <strong style="color:#ffffff">Instant Dispatch</strong> — Automated confirmation with real-time tracking
          </td>
        </tr>
      </table>
    </div>

    <!-- Primary Call To Action Button -->
    <div style="text-align:center;margin:32px 0 20px">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td align="center">
            <a href="${SITE}/checkout" style="display:inline-block;background:linear-gradient(135deg,${GOLD_LIGHT},${GOLD});color:#000000;font-weight:900;text-decoration:none;padding:16px 40px;border-radius:10px;font-size:16px;letter-spacing:0.02em;box-shadow:0 8px 24px rgba(200,185,147,0.25)">
              💳 Complete Your Order Online &rarr;
            </a>
          </td>
        </tr>
      </table>
    </div>
    <p style="margin:0 0 28px;color:${MUTED};font-size:12px;text-align:center">
      Click above to pay securely via PayFast and claim your reserved items.
    </p>

    <!-- Important Notice regarding old bank details -->
    <div style="background:#111111;border:1px solid ${BORDER};border-left:4px solid ${GOLD};border-radius:8px;padding:16px 18px;margin-bottom:20px">
      <p style="margin:0 0 6px;color:${GOLD};font-size:12px;font-weight:800;letter-spacing:0.06em;text-transform:uppercase">
        ⚠️ Important Payment Notice
      </p>
      <p style="margin:0 0 8px;color:#d1d5db;font-size:12px;line-height:1.6">
        <strong>Please do not send manual bank transfers to our previous bank account.</strong> That account is no longer active and deposits cannot be processed there.
      </p>
      <p style="margin:0;color:${MUTED};font-size:12px;line-height:1.6">
        If you already transferred funds to it, please <strong style="color:#ffffff">reply directly to this email with your proof of payment screenshot</strong> so our accounts team can trace and confirm your order manually.
      </p>
    </div>

    <!-- WhatsApp quick assist button -->
    <div style="text-align:center;padding:12px 0">
      <p style="margin:0 0 10px;color:${MUTED};font-size:12px">Prefer to chat with a support agent?</p>
      <a href="${whatsappLink}" style="display:inline-block;background:#25D36622;color:#25D366;border:1px solid #25D36655;font-size:13px;font-weight:700;text-decoration:none;padding:10px 22px;border-radius:8px">
        💬 Chat on WhatsApp (082 587 6811)
      </a>
    </div>
  `, `Action Required: Your cart items have been reserved (#${order.ref}). Complete online checkout via PayFast to confirm your order.`);
}

async function main() {
  const transporter = createTransporter();
  if (!transporter) {
    console.error("Transporter could not be created. Check RESEND_API_KEY in .env.local.");
    process.exit(1);
  }

  // Fetch orders that were EFT / pending / proof_submitted
  const rows = db.prepare(`
    SELECT id, ref, name, email, phone, items, total, status, payment_method, createdAt
    FROM orders
    WHERE payment_method = 'eft'
      AND status IN ('pending', 'proof_submitted')
      AND email NOT LIKE '%daisygadgetsco%'
      AND email NOT LIKE '%@test.com'
      AND email NOT LIKE '%@example.com'
    ORDER BY createdAt DESC
  `).all();

  console.log(`Found ${rows.length} pending/proof_submitted order(s) eligible for PayFast migration notice.`);

  const targets = [];
  for (const r of rows) {
    let items = [];
    try {
      items = JSON.parse(r.items);
    } catch {
      items = [{ name: "Reserved Product Order", price: r.total, qty: 1 }];
    }
    targets.push({
      ref: r.ref,
      name: r.name,
      email: r.email.trim(),
      phone: r.phone,
      items,
      total: r.total,
    });
  }

  // Also include the founder/admin confirmation recipient
  targets.push({
    ref: "DC-98421",
    name: "Founder / Store Admin",
    email: "mkhabeleenterprise@gmail.com",
    phone: "0825876811",
    items: [
      {
        name: "Apple iPhone 16 Pro Max 256GB — Natural Titanium",
        category: "Smartphones",
        price: "R 22,999.00",
        qty: 1,
        imageUrl: "https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-16-pro-max.jpg"
      },
      {
        name: "PlayStation 5 Slim Disc Edition 1TB + Wireless Controller",
        category: "Gaming Consoles",
        price: "R 13,999.00",
        qty: 1,
        imageUrl: "https://gmedia.playstation.com/is/image/SIEPDC/ps5-slim-edition-left-image-block-01-en-24jun24?$2x$"
      }
    ],
    total: 36998
  });

  console.log(`Prepared ${targets.length} target notification(s) to send.`);

  let successCount = 0;
  for (const t of targets) {
    const subject = `Action Required: Your reserved items are on hold (#${t.ref})`;
    const html = buildEmailHtml(t);

    console.log(`Sending to ${t.email} (Order ${t.ref}, Total R ${t.total})...`);
    try {
      const info = await transporter.sendMail({
        from: fromAddress(),
        replyTo: SUPPORT_EMAIL,
        to: t.email,
        subject,
        html,
      });
      console.log(`  ✓ Sent successfully! Message ID: ${info.messageId}`);
      successCount++;
    } catch (err) {
      console.error(`  ✗ Failed to send to ${t.email}:`, err.message);
    }
  }

  // Record campaign in database
  try {
    const campaignId = "camp-" + Date.now();
    db.prepare(`
      INSERT INTO email_campaigns (id, subject, heading, body, cta_text, cta_url, recipients, sent_to, status, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'sent', ?)
    `).run(
      campaignId,
      "Action Required: Your reserved items are on hold",
      "Your Reserved Items Are Ready For You",
      "PayFast instant online checkout migration notification with reserved cart items showcase.",
      "Complete Your Order Online",
      `${SITE}/checkout`,
      "pending_eft_customers",
      successCount,
      new Date().toISOString()
    );
    console.log(`Recorded broadcast campaign (${campaignId}) with ${successCount} emails sent.`);
  } catch (e) {
    console.warn("Could not record campaign to DB:", e.message);
  }

  console.log(`\nAll done! Successfully dispatched ${successCount} of ${targets.length} notifications.`);
}

main().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});
