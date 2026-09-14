import { getDb } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MessageCircle, Mail, Package } from "lucide-react";
import CustomerEmailSender from "./CustomerEmailSender";

export const dynamic = "force-dynamic";

const STATUS_COLORS: Record<string, string> = {
  pending:         "#6b7280",
  proof_submitted: "#f59e0b",
  approved:        "#10b981",
  rejected:        "#ef4444",
  shipped:         "#3b82f6",
  delivered:       "#C8B993",
};

const PAID = new Set(["approved", "shipped", "delivered"]);

function toWaPhone(phone: string) {
  const clean = phone.replace(/[\s\-()]/g, "");
  if (clean.startsWith("+")) return clean.slice(1);
  if (clean.startsWith("0")) return "27" + clean.slice(1);
  return clean;
}

export default async function CustomerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let email: string;
  try {
    const padded = id + "=".repeat((4 - (id.length % 4)) % 4);
    email = Buffer.from(padded, "base64").toString("utf-8");
    if (!email.includes("@")) throw new Error("invalid");
  } catch {
    notFound();
  }

  const db = getDb();

  const rawOrders = db.prepare(
    "SELECT * FROM orders WHERE LOWER(email) = ? ORDER BY createdAt DESC"
  ).all(email.toLowerCase()) as {
    id: string; ref: string; name: string; email: string; phone: string;
    address: string; items: string; total: number; status: string;
    bank_id: string | null; tracking_number: string | null; createdAt: string;
  }[];

  if (rawOrders.length === 0) notFound();

  const orders = rawOrders.map((o) => ({
    ...o,
    items: JSON.parse(o.items) as { id: string; name: string; price: string; qty: number; imageUrl?: string }[],
  }));

  const customer = {
    name:        orders[0].name,
    email:       orders[0].email,
    phone:       orders[0].phone,
    address:     orders[0].address,
    memberSince: orders[orders.length - 1].createdAt,
  };

  const totalSpent   = orders.filter((o) => PAID.has(o.status)).reduce((s, o) => s + o.total, 0);
  const pendingCount = orders.filter((o) => o.status === "pending" || o.status === "proof_submitted").length;
  const lastOrder    = orders[0];
  const lastOrderItems = lastOrder.items;

  // Installment applications
  const installments = db.prepare(
    "SELECT * FROM installment_applications WHERE LOWER(email) = ? ORDER BY createdAt DESC"
  ).all(email.toLowerCase()) as {
    id: string; ref: string; product_name: string; term_months: number;
    monthly_payment: number; deposit: number; status: string; createdAt: string;
  }[];

  // Leads / contact submissions
  const leads = db.prepare(
    "SELECT * FROM leads WHERE LOWER(email) = ? ORDER BY createdAt DESC"
  ).all(email.toLowerCase()) as {
    id: string; name: string; message: string; productInterest: string; createdAt: string;
  }[];

  // Cart events — via visitor.email → cart_events.visitorId
  const rawCartEvents = db.prepare(`
    SELECT ce.productId, ce.productName, ce.price, ce.category, MAX(ce.createdAt) as lastAdded
    FROM cart_events ce
    JOIN visitors v ON v.id = ce.visitorId
    WHERE LOWER(v.email) = ?
    GROUP BY ce.productId
    ORDER BY lastAdded DESC
  `).all(email.toLowerCase()) as {
    productId: string; productName: string; price: string; category: string; lastAdded: string;
  }[];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">

      {/* Back */}
      <Link href="/admin/dashboard/customers"
        className="inline-flex items-center gap-2 text-gray-500 hover:text-white text-sm mb-6 transition-colors">
        <ArrowLeft size={15} /> All Customers
      </Link>

      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        <div className="w-14 h-14 rounded-2xl bg-[#2A2A2A] flex items-center justify-center shrink-0">
          <span className="text-2xl font-bold text-[#C8B993]">{customer.name.charAt(0).toUpperCase()}</span>
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-white">{customer.name}</h1>
          <p className="text-gray-500 text-sm">{customer.email}</p>
          <p className="text-gray-600 text-xs mt-0.5">{customer.phone}</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <a href={`https://wa.me/${toWaPhone(customer.phone)}?text=${encodeURIComponent(`Hi ${customer.name.split(" ")[0]}, this is Bevanssons `)}`}
            target="_blank" rel="noopener noreferrer"
            className="p-2.5 rounded-xl border border-[#2A2A2A] text-gray-500 hover:text-[#25D366] hover:border-[#25D366]/30 transition-colors">
            <MessageCircle size={16} />
          </a>
          <a href={`mailto:${customer.email}`}
            className="p-2.5 rounded-xl border border-[#2A2A2A] text-gray-500 hover:text-[#C8B993] hover:border-[#C8B993]/30 transition-colors">
            <Mail size={16} />
          </a>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          { label: "Orders",        value: orders.length,                    color: "text-white" },
          { label: "Total Spent",   value: `R ${totalSpent.toLocaleString()}`, color: "text-green-400" },
          { label: "Pending",       value: pendingCount,                     color: pendingCount > 0 ? "text-amber-400" : "text-gray-500" },
          { label: "Member Since",  value: new Date(customer.memberSince).toLocaleDateString("en-ZA", { month: "short", year: "numeric" }), color: "text-gray-400" },
        ].map((s) => (
          <div key={s.label} className="bg-[#1D1D1D] border border-[#2A2A2A] rounded-xl p-4 text-center">
            <p className={`text-xl font-bold mb-0.5 ${s.color}`}>{s.value}</p>
            <p className="text-gray-600 text-xs">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-5 gap-6">

        {/* Left: Orders + activity */}
        <div className="lg:col-span-3 space-y-6">

          {/* Order history */}
          <div className="bg-[#1D1D1D] border border-[#2A2A2A] rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-[#2A2A2A]">
              <h2 className="text-sm font-bold text-white">Order History</h2>
            </div>
            <div className="divide-y divide-[#1A1A1A]">
              {orders.map((order) => (
                <div key={order.id} className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[#C8B993] font-bold text-sm font-mono">{order.ref}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full capitalize"
                        style={{ color: STATUS_COLORS[order.status] ?? "#9ca3af", background: (STATUS_COLORS[order.status] ?? "#9ca3af") + "18" }}>
                        {order.status.replace(/_/g, " ")}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-bold text-sm">R {order.total.toLocaleString()}</p>
                      <p className="text-gray-600 text-xs">{new Date(order.createdAt).toLocaleDateString("en-ZA")}</p>
                    </div>
                  </div>
                  {/* Items */}
                  <div className="space-y-2">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex items-center gap-3">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.name} className="w-10 h-10 rounded-lg object-cover shrink-0 border border-[#2A2A2A]" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-[#111111] border border-[#2A2A2A] flex items-center justify-center shrink-0">
                            <Package size={14} className="text-gray-700" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-xs font-medium truncate">{item.name}</p>
                          <p className="text-gray-500 text-xs">Qty: {item.qty}</p>
                        </div>
                        <p className="text-[#C8B993] text-xs font-bold shrink-0">{item.price}</p>
                      </div>
                    ))}
                  </div>
                  {order.address && (
                    <p className="text-gray-600 text-xs mt-3">📍 {order.address}</p>
                  )}
                  {order.tracking_number && (
                    <p className="text-gray-500 text-xs mt-1">Tracking: <span className="text-white font-mono">{order.tracking_number}</span></p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Installment applications */}
          {installments.length > 0 && (
            <div className="bg-[#1D1D1D] border border-[#2A2A2A] rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-[#2A2A2A]">
                <h2 className="text-sm font-bold text-white">Installment Applications</h2>
              </div>
              <div className="divide-y divide-[#1A1A1A]">
                {installments.map((app) => (
                  <div key={app.id} className="flex items-center gap-4 px-5 py-3.5">
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{app.product_name}</p>
                      <p className="text-gray-500 text-xs">
                        {app.term_months} months · R {Math.round(app.monthly_payment).toLocaleString()}/mo · Deposit R {Math.round(app.deposit).toLocaleString()}
                      </p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full capitalize shrink-0"
                      style={{ color: app.status === "approved" ? "#10b981" : app.status === "declined" ? "#ef4444" : "#f59e0b",
                               background: (app.status === "approved" ? "#10b981" : app.status === "declined" ? "#ef4444" : "#f59e0b") + "18" }}>
                      {app.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cart items */}
          {rawCartEvents.length > 0 && (
            <div className="bg-[#1D1D1D] border border-[#2A2A2A] rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-[#2A2A2A] flex items-center justify-between">
                <h2 className="text-sm font-bold text-white">Cart Items</h2>
                <span className="text-[10px] text-amber-400 font-bold px-2 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/20">
                  {rawCartEvents.length} item{rawCartEvents.length !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="divide-y divide-[#1A1A1A]">
                {rawCartEvents.map((item) => (
                  <div key={item.productId} className="flex items-center gap-3 px-5 py-3.5">
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{item.productName}</p>
                      <p className="text-gray-500 text-xs">{item.category}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[#C8B993] text-sm font-bold">{item.price}</p>
                      <p className="text-gray-600 text-[10px]">{new Date(item.lastAdded).toLocaleDateString("en-ZA")}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contact submissions */}
          {leads.length > 0 && (
            <div className="bg-[#1D1D1D] border border-[#2A2A2A] rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-[#2A2A2A]">
                <h2 className="text-sm font-bold text-white">Contact Submissions</h2>
              </div>
              <div className="divide-y divide-[#1A1A1A]">
                {leads.map((lead) => (
                  <div key={lead.id} className="px-5 py-3.5">
                    {lead.productInterest && (
                      <p className="text-[#C8B993] text-xs font-medium mb-1">{lead.productInterest}</p>
                    )}
                    <p className="text-gray-400 text-sm leading-relaxed">{lead.message}</p>
                    <p className="text-gray-600 text-xs mt-1">{new Date(lead.createdAt).toLocaleDateString("en-ZA")}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Email panel */}
        <div className="lg:col-span-2">
          <div className="bg-[#1D1D1D] border border-[#2A2A2A] rounded-2xl p-5 sticky top-6">
            <h2 className="text-sm font-bold text-white mb-4">Send Email</h2>
            <CustomerEmailSender
              email={customer.email}
              name={customer.name}
              lastOrderItems={lastOrderItems}
              lastOrderRef={lastOrder.ref}
              cartItems={rawCartEvents.map(e => ({ id: e.productId, name: e.productName, price: e.price, qty: 1 }))}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
