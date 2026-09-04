import { getLeads, getCartEvents } from "@/lib/products";
import Link from "next/link";

export const dynamic = "force-dynamic";

type Lead = {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
  productInterest?: string;
  createdAt: string;
};

type CartEvent = {
  id: string;
  visitorId?: string;
  productId: string;
  productName: string;
  price: string;
  category: string;
  createdAt: string;
  visitorName?: string;
  visitorPhone?: string;
  visitorEmail?: string;
};

function timeAgo(iso: string): { label: string; urgency: "hot" | "warm" | "cold" } {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  const hrs = Math.floor(mins / 60);
  const days = Math.floor(hrs / 24);

  if (mins < 60)  return { label: `${mins}m ago`,   urgency: "hot" };
  if (hrs  < 6)   return { label: `${hrs}h ago`,    urgency: "hot" };
  if (hrs  < 24)  return { label: `${hrs}h ago`,    urgency: "warm" };
  if (days < 3)   return { label: `${days}d ago`,   urgency: "warm" };
  return           { label: `${days}d ago`,          urgency: "cold" };
}

function urgencyDot(u: "hot" | "warm" | "cold") {
  const colors = { hot: "#22c55e", warm: "#f59e0b", cold: "#6b7280" };
  return (
    <span
      style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: colors[u], marginRight: 6, flexShrink: 0 }}
    />
  );
}

function cleanPhone(raw?: string): string {
  if (!raw) return "";
  return raw.replace(/[^0-9+]/g, "").replace(/^0/, "27");
}

function waLink(phone: string, message: string) {
  return `https://wa.me/${cleanPhone(phone)}?text=${encodeURIComponent(message)}`;
}

const QUICK_REPLIES = {
  followUp: (name: string) =>
    `Hi ${name || "there"}, this is Daisy Gadgets Co. You showed interest in our store earlier. We have great deals available right now — can I help you find what you're looking for? 😊`,
  cartReminder: (name: string, product: string, price: string) =>
    `Hi ${name || "there"}, this is Daisy Gadgets Co. You added the ${product} (${price}) to your cart earlier but didn't complete your order. We're still holding it for you! Ready to proceed? 🛒`,
  discountPush: (name: string) =>
    `Hi ${name || "there"}, Daisy Gadgets Co. here! Your 25% discount code is DAISY25 — just mention it when you order. Valid on everything in our store. Shop now: https://daisygadgetsco.com`,
  orderReady: (name: string) =>
    `Hi ${name || "there"}, good news from Daisy Gadgets Co.! Your order is ready. Please make your EFT payment and send us your proof of payment to confirm. Any questions? Reply here!`,
};

export default async function LeadsPage() {
  const leads = (getLeads() as Lead[]).slice(0, 100);
  const carts = (getCartEvents() as CartEvent[]).slice(0, 100);

  // Group cart events by visitorId so we can show all products per visitor
  const cartByVisitor = new Map<string, CartEvent[]>();
  for (const c of carts) {
    const key = c.visitorId ?? c.id;
    if (!cartByVisitor.has(key)) cartByVisitor.set(key, []);
    cartByVisitor.get(key)!.push(c);
  }
  // Deduplicate: one entry per visitor (most recent event)
  const uniqueCarts = [...cartByVisitor.values()].map(evts => ({
    latest: evts[0],
    all: evts,
  }));

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      {/* Top bar */}
      <header className="bg-[#0f0f0f] border-b border-[#1A1A1A] px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link href="/admin/dashboard" className="text-gray-500 hover:text-white text-sm transition-colors">
            &larr; Dashboard
          </Link>
          <span className="text-[#1F1F1F]">/</span>
          <span className="text-white text-sm font-semibold">Leads &amp; Cart Activity</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: "#22c55e" }} /> Hot (&lt;6h)
          <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: "#f59e0b", marginLeft: 8 }} /> Warm (6–48h)
          <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: "#6b7280", marginLeft: 8 }} /> Cold (&gt;48h)
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-10">

        {/* ── LEADS ─────────────────────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">Popup Leads ({leads.length})</h2>
            <span className="text-xs text-gray-600">Most recent first</span>
          </div>

          {leads.length === 0 ? (
            <div className="bg-[#111] border border-[#1F1F1F] rounded-2xl p-10 text-center text-gray-500 text-sm">
              No leads yet.
            </div>
          ) : (
            <div className="space-y-3">
              {leads.map((lead) => {
                const { label, urgency } = timeAgo(lead.createdAt);
                const phone = lead.phone ?? "";
                const name = lead.name ?? "";
                const hasWa = !!cleanPhone(phone);

                return (
                  <div
                    key={lead.id}
                    className="bg-[#111] border border-[#1F1F1F] rounded-2xl p-4"
                    style={{ borderLeft: urgency === "hot" ? "3px solid #22c55e" : urgency === "warm" ? "3px solid #f59e0b" : "3px solid #1F1F1F" }}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      {/* Left: identity */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {urgencyDot(urgency)}
                          <span className="text-white font-semibold text-sm">{name || "Anonymous"}</span>
                          <span className="text-gray-600 text-xs">{label}</span>
                        </div>
                        <div className="flex flex-wrap gap-3 text-xs text-gray-400">
                          {phone && <span>📱 {phone}</span>}
                          {lead.email && <span>✉ {lead.email}</span>}
                          {lead.productInterest && lead.productInterest !== "General" && (
                            <span className="text-[#D4AF37]">Interest: {lead.productInterest}</span>
                          )}
                        </div>
                        {lead.message && lead.message !== "Lead captured via 20% off popup" && (
                          <p className="text-gray-500 text-xs mt-1 line-clamp-2">{lead.message}</p>
                        )}
                      </div>

                      {/* Right: action buttons */}
                      {hasWa && (
                        <div className="flex flex-wrap gap-2 shrink-0">
                          <a
                            href={waLink(phone, QUICK_REPLIES.followUp(name))}
                            target="_blank" rel="noopener noreferrer"
                            className="px-3 py-1.5 rounded-lg text-xs font-bold text-white"
                            style={{ background: "#25D366" }}
                          >
                            Follow Up
                          </a>
                          <a
                            href={waLink(phone, QUICK_REPLIES.discountPush(name))}
                            target="_blank" rel="noopener noreferrer"
                            className="px-3 py-1.5 rounded-lg text-xs font-bold text-[#0A0A0A]"
                            style={{ background: "#D4AF37" }}
                          >
                            Send Discount
                          </a>
                          <a
                            href={`https://wa.me/${cleanPhone(phone)}`}
                            target="_blank" rel="noopener noreferrer"
                            className="px-3 py-1.5 rounded-lg text-xs font-bold text-gray-300 bg-white/10"
                          >
                            Open Chat
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ── CART EVENTS ───────────────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">Cart Activity ({uniqueCarts.length} visitors)</h2>
            <span className="text-xs text-gray-600">Most recent first</span>
          </div>

          {uniqueCarts.length === 0 ? (
            <div className="bg-[#111] border border-[#1F1F1F] rounded-2xl p-10 text-center text-gray-500 text-sm">
              No cart events yet.
            </div>
          ) : (
            <div className="space-y-3">
              {uniqueCarts.map(({ latest, all }) => {
                const { label, urgency } = timeAgo(latest.createdAt);
                const phone = latest.visitorPhone ?? "";
                const name = latest.visitorName ?? "";
                const hasWa = !!cleanPhone(phone);
                const topProduct = latest.productName;
                const topPrice = latest.price;

                return (
                  <div
                    key={latest.id}
                    className="bg-[#111] border border-[#1F1F1F] rounded-2xl p-4"
                    style={{ borderLeft: urgency === "hot" ? "3px solid #22c55e" : urgency === "warm" ? "3px solid #f59e0b" : "3px solid #1F1F1F" }}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      {/* Left: identity + products */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {urgencyDot(urgency)}
                          <span className="text-white font-semibold text-sm">{name || "Anonymous visitor"}</span>
                          <span className="text-gray-600 text-xs">{label}</span>
                        </div>
                        <div className="flex flex-wrap gap-3 text-xs text-gray-400 mb-2">
                          {phone && <span>📱 {phone}</span>}
                          {latest.visitorEmail && <span>✉ {latest.visitorEmail}</span>}
                        </div>
                        {/* Products added */}
                        <div className="flex flex-wrap gap-1.5">
                          {all.map((evt) => (
                            <span
                              key={evt.id}
                              className="text-[10px] px-2 py-0.5 rounded-full border border-[#2a2a2a] text-gray-400"
                            >
                              {evt.productName} · {evt.price}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Right: action buttons */}
                      {hasWa && (
                        <div className="flex flex-wrap gap-2 shrink-0">
                          <a
                            href={waLink(phone, QUICK_REPLIES.cartReminder(name, topProduct, topPrice))}
                            target="_blank" rel="noopener noreferrer"
                            className="px-3 py-1.5 rounded-lg text-xs font-bold text-white"
                            style={{ background: "#25D366" }}
                          >
                            Cart Reminder
                          </a>
                          <a
                            href={waLink(phone, QUICK_REPLIES.discountPush(name))}
                            target="_blank" rel="noopener noreferrer"
                            className="px-3 py-1.5 rounded-lg text-xs font-bold text-[#0A0A0A]"
                            style={{ background: "#D4AF37" }}
                          >
                            Send Discount
                          </a>
                          <a
                            href={`https://wa.me/${cleanPhone(phone)}`}
                            target="_blank" rel="noopener noreferrer"
                            className="px-3 py-1.5 rounded-lg text-xs font-bold text-gray-300 bg-white/10"
                          >
                            Open Chat
                          </a>
                        </div>
                      )}
                      {!hasWa && (
                        <span className="text-xs text-gray-700 italic">No phone captured</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
