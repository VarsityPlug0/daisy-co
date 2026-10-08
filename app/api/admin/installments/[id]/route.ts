import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { getApplication, adminSetApplicationStatus, getReviewBundle, ensureUploadToken } from "@/lib/installments";
import {
  sendInstallmentApproval,
  sendInstallmentReviewing,
  sendInstallmentAwaitingPayment,
  sendInstallmentActive,
  sendInstallmentCompleted,
  sendInstallmentDeclined,
} from "@/lib/mailer";

const VALID_STATUSES = [
  "new", "reviewing", "awaiting_documents", "documents_received", "verification_pending",
  "approved", "needs_more_info", "declined", "deposit_pending", "awaiting_payment",
  "deposit_received", "order_confirmed", "dispatched", "active", "active_installment", "completed",
];

// Human reviewer endpoint: return an application's documents + status history for the admin Documents tab.
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const bundle = getReviewBundle(id);
  if (!bundle) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(bundle);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const { status, admin_notes, reviewer } = await req.json();

  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }
  if (!getApplication(id)) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Records the human reviewer + timestamp + audit-trail entry (all status changes here are human-initiated).
  // Accepts an id or a ref; only a change verified in the database counts, and only then is the customer emailed.
  const changed = adminSetApplicationStatus(id, status, typeof reviewer === "string" && reviewer.trim() ? reviewer.trim() : "admin", admin_notes);
  if (!changed) return NextResponse.json({ error: "Status was not updated" }, { status: 500 });
  const app = changed.before;

  const emailData = {
    name: app.name,
    email: app.email,
    ref: app.ref,
    product_name: app.product_name,
    product_price: app.product_price,
    deposit: app.deposit,
    monthly_payment: app.monthly_payment,
    term_months: app.term_months,
    total_repayable: app.total_repayable,
    phone: app.phone,
    admin_notes: admin_notes ?? app.admin_notes,
  };

  const emailMap: Record<string, () => Promise<void>> = {
    reviewing:        () => sendInstallmentReviewing(emailData),
    approved:         () => sendInstallmentApproval(emailData),
    awaiting_payment: () => sendInstallmentAwaitingPayment(emailData),
    active:           () => sendInstallmentActive(emailData),
    completed:        () => sendInstallmentCompleted(emailData),
    declined:         () => sendInstallmentDeclined(emailData),
  };

  if (emailMap[status]) {
    emailMap[status]().catch(console.error);
  }

  return NextResponse.json({ ok: true });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const { action } = await req.json();

  const app = getApplication(id);
  if (!app) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Build a one-tap WhatsApp reminder that carries the customer's own secure document-upload link.
  if (action === "upload_link") {
    const token = ensureUploadToken(app.ref);
    if (!token) return NextResponse.json({ error: "Could not create upload link" }, { status: 500 });
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://gadgets.bevanssons.store";
    const uploadUrl = `${siteUrl}/verify/${token}`;
    const firstName = (app.name || "there").trim().split(/\s+/)[0];
    const message =
      `Hi ${firstName}, it's Bevans Sons about your installment for the ${app.product_name} (Ref ${app.ref}). ` +
      `You're almost there — just upload your documents securely here to finish your order: ${uploadUrl}. ` +
      `Any questions, reply here. Thank you!`;
    // Normalise SA number to international digits for wa.me (0XXXXXXXXX -> 27XXXXXXXXX).
    let digits = (app.phone || "").replace(/\D/g, "");
    if (digits.startsWith("0")) digits = "27" + digits.slice(1);
    else if (digits.startsWith("27")) { /* already international */ }
    else if (digits.length === 9) digits = "27" + digits;
    const waLink = `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
    return NextResponse.json({ ok: true, waLink, message, url: uploadUrl, phone: digits });
  }

  if (action !== "resend_invoice") {
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }

  await sendInstallmentApproval({
    name: app.name,
    email: app.email,
    ref: app.ref,
    product_name: app.product_name,
    product_price: app.product_price,
    deposit: app.deposit,
    monthly_payment: app.monthly_payment,
    term_months: app.term_months,
    total_repayable: app.total_repayable,
    phone: app.phone,
  });

  return NextResponse.json({ ok: true });
}
