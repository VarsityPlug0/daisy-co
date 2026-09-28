import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { getApplication, reviewApplication, getReviewBundle } from "@/lib/installments";
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
  const app = getApplication(id);
  if (!app) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Records the human reviewer + timestamp + audit-trail entry (all status changes here are human-initiated).
  reviewApplication(id, status, typeof reviewer === "string" && reviewer.trim() ? reviewer.trim() : "admin", admin_notes);

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

  if (action !== "resend_invoice") {
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }

  const app = getApplication(id);
  if (!app) return NextResponse.json({ error: "Not found" }, { status: 404 });

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
