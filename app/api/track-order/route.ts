import { NextRequest, NextResponse } from "next/server";
import { getOrder } from "@/lib/orders";
import { getApplication } from "@/lib/installments";

// Map an installment application's status onto the public order-tracker's 5-step vocabulary
// (pending → payment_received → processing → shipped → delivered) so installment customers
// can track their order at /track-order using their IA- reference, same as a regular order.
const INSTALLMENT_TO_TRACK: Record<string, string> = {
  new: "pending",
  reviewing: "pending",
  awaiting_documents: "pending",
  documents_received: "pending",
  verification_pending: "pending",
  needs_more_info: "pending",
  deposit_pending: "pending",
  awaiting_payment: "pending",
  declined: "pending",
  deposit_received: "payment_received",
  approved: "payment_received",
  order_confirmed: "processing",
  active: "processing",
  active_installment: "processing",
  dispatched: "shipped",
  completed: "delivered",
};

export async function GET(req: NextRequest) {
  const ref = req.nextUrl.searchParams.get("ref")?.trim();
  if (!ref) return NextResponse.json({ error: "Ref required" }, { status: 400 });

  const order = getOrder(ref);
  if (order) {
    // Return only public-safe fields
    return NextResponse.json({
      ref: order.ref,
      status: order.status,
      name: order.name,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      items: order.items,
      total: order.total,
    });
  }

  // Fall back to installment applications (IA- references).
  const app = getApplication(ref);
  if (app) {
    return NextResponse.json({
      ref: app.ref,
      status: INSTALLMENT_TO_TRACK[app.status] ?? "processing",
      name: app.name,
      createdAt: app.createdAt,
      updatedAt: app.updatedAt,
      items: [{ name: app.product_name, qty: app.quantity ?? 1, price: `R ${Number(app.product_price).toLocaleString("en-ZA")}` }],
      total: Number(app.total_repayable ?? app.product_price),
    });
  }

  return NextResponse.json({ error: "Order not found" }, { status: 404 });
}
