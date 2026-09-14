import { NextRequest, NextResponse } from "next/server";
import { getOrder, updateOrder } from "@/lib/orders";
import { verifyITN } from "@/lib/payfast";
import { sendMail, sendOrderConfirmation } from "@/lib/mailer";

// POST /api/checkout/payfast-notify — PayFast's ITN (Instant Transaction
// Notification) webhook. PayFast posts application/x-www-form-urlencoded
// data here after a payment attempt. Must respond fast — verification and
// order updates happen after the 200 is already sent, same pattern as the
// Bevans Sons integration this was ported from.
export async function POST(req: NextRequest) {
  const raw = await req.text();
  const params = new URLSearchParams(raw);
  const body: Record<string, string> = {};
  for (const [k, v] of params.entries()) body[k] = v;

  // Respond immediately — PayFast expects a fast 200, independent of
  // whatever verification/DB work happens below.
  queueMicrotask(() => handleITN(body));
  return new NextResponse("OK", { status: 200 });
}

async function handleITN(body: Record<string, string>) {
  const { valid, reason } = await verifyITN(body);
  if (!valid) {
    console.error("[PayFast ITN] Invalid notification:", reason);
    return;
  }

  const { payment_status, m_payment_id, amount_gross, pf_payment_id } = body;
  if (payment_status !== "COMPLETE") {
    console.warn("[PayFast ITN] Non-complete status:", payment_status);
    return;
  }

  try {
    const order = getOrder(m_payment_id);
    if (!order) {
      console.error("[PayFast ITN] Order not found:", m_payment_id);
      return;
    }

    const paidAmount = parseFloat(amount_gross);
    if (Math.abs(paidAmount - order.total) > 0.01) {
      console.error("[PayFast ITN] Amount mismatch:", { paid: paidAmount, expected: order.total });
      return;
    }

    updateOrder(order.id, {
      status: "approved",
      payment_method: "payfast",
      eft_reference: pf_payment_id,
    });

    sendMail({
      to: "daisygadgetsco@gmail.com, moneybman0@gmail.com",
      subject: `PayFast payment received — ${order.ref} — R${order.total.toLocaleString()}`,
      html: `<pre style="font-family:monospace;font-size:13px">PayFast payment confirmed.\n\nRef: ${order.ref}\nCustomer: ${order.name}\nEmail: ${order.email}\nPhone: ${order.phone}\nAmount: R${paidAmount.toLocaleString()}\nPayFast payment ID: ${pf_payment_id}</pre>`,
    });

    sendOrderConfirmation({
      name: order.name,
      email: order.email,
      ref: order.ref,
      items: order.items,
      total: order.total,
      address: order.address,
      phone: order.phone,
      paymentMethod: "payfast",
    });

    console.log("[PayFast ITN] Confirmed:", order.ref);
  } catch (err) {
    console.error("[PayFast ITN] Error:", err instanceof Error ? err.message : err);
  }
}
