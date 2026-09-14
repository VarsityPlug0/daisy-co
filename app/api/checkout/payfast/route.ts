import { NextRequest, NextResponse } from "next/server";
import { getOrder } from "@/lib/orders";
import { buildPaymentData } from "@/lib/payfast";

// POST /api/checkout/payfast — given an existing order id, return the
// PayFast fields + url the client should auto-submit as a form POST.
// The order itself is already created (via POST /api/orders) before this
// is called — this route never creates or prices an order, only builds
// the payment redirect for one that already exists, same real-total
// discipline as the rest of checkout.
export async function POST(req: NextRequest) {
  const { orderId } = await req.json();
  if (!orderId || typeof orderId !== "string") {
    return NextResponse.json({ error: "orderId required" }, { status: 400 });
  }

  const order = getOrder(orderId);
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  try {
    const payfast = buildPaymentData({
      order,
      returnUrl: `${siteUrl}/checkout/success?ref=${order.ref}`,
      cancelUrl: `${siteUrl}/checkout?cancelled=1&ref=${order.ref}`,
      notifyUrl: `${siteUrl}/api/checkout/payfast-notify`,
    });
    return NextResponse.json(payfast);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "PayFast is temporarily unavailable" },
      { status: 503 }
    );
  }
}
