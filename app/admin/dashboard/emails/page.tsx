import { getDb } from "@/lib/db";
import { listOrders } from "@/lib/orders";
import { getProducts } from "@/lib/products";
import EmailComposer from "./EmailComposer";
import FollowUpRunner from "./FollowUpRunner";

export const dynamic = "force-dynamic";

const TYPE_LABELS: Record<string, string> = {
  cart_abandon_1d:   "Cart Abandon",
  delivery_followup: "Delivery Follow-up",
  reengagement_30d:  "Re-engagement",
};

export default function EmailsPage() {
  const orders = listOrders();

  const customerCount = new Set(orders.map((o) => o.email.toLowerCase())).size;
  const pendingCount = new Set(
    orders
      .filter((o) => o.status === "pending" || o.status === "proof_submitted")
      .map((o) => o.email.toLowerCase())
  ).size;

  const products = getProducts().map((p) => ({
    id: p.id, name: p.name, price: p.price, imageUrl: p.imageUrl ?? "", category: p.category,
  }));

  const db = getDb();

  // Manual campaigns
  const campaigns = db
    .prepare("SELECT * FROM email_campaigns ORDER BY createdAt DESC LIMIT 20")
    .all() as {
      id: string; subject: string; heading: string; recipients: string;
      sent_to: number; status: string; createdAt: string;
    }[];

  // Automated sends stats
  const autoSends = db.prepare(`
    SELECT type, COUNT(*) as total,
           SUM(opened) as opens, SUM(clicked) as clicks
    FROM email_sends
    WHERE createdAt > datetime('now', '-30 days')
    GROUP BY type
  `).all() as { type: string; total: number; opens: number; clicks: number }[];

  const recentAuto = db.prepare(`
    SELECT * FROM email_sends ORDER BY createdAt DESC LIMIT 30
  `).all() as {
    id: string; email: string; type: string; ref: string | null;
    subject: string | null; opened: number; clicked: number; createdAt: string;
  }[];

  const totalAutoSent   = autoSends.reduce((s, r) => s + r.total, 0);
  const totalAutoOpened = autoSends.reduce((s, r) => s + r.opens, 0);
  const totalAutoClicked = autoSends.reduce((s, r) => s + r.clicks, 0);
  const openRate   = totalAutoSent > 0 ? Math.round((totalAutoOpened  / totalAutoSent)  * 100) : 0;
  const clickRate  = totalAutoSent > 0 ? Math.round((totalAutoClicked / totalAutoSent) * 100) : 0;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">

      <div className="mb-7">
        <h1 className="text-xl font-bold text-white">Email Centre</h1>
        <p className="text-gray-500 text-sm mt-0.5">Campaigns, automated follow-ups, and email analytics.</p>
      </div>

      {/* Automated follow-ups section */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest">Automated Follow-ups</h2>
          <FollowUpRunner />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          {[
            { label: "Sent (30d)",  value: totalAutoSent,   color: "text-white" },
            { label: "Open Rate",   value: `${openRate}%`,  color: openRate >= 30 ? "text-green-400" : "text-gray-400" },
            { label: "Click Rate",  value: `${clickRate}%`, color: clickRate >= 10 ? "text-green-400" : "text-gray-400" },
            { label: "Sequences",   value: 3,               color: "text-[#C8B993]" },
          ].map((s) => (
            <div key={s.label} className="bg-[#1D1D1D] border border-[#2A2A2A] rounded-xl p-4 text-center">
              <p className={`text-xl font-bold mb-0.5 ${s.color}`}>{s.value}</p>
              <p className="text-gray-600 text-xs">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Sequence breakdown */}
        <div className="grid sm:grid-cols-3 gap-3 mb-5">
          {[
            { type: "cart_abandon_1d",   icon: "🛒", desc: "24h after cart add, no order placed",         color: "#f59e0b" },
            { type: "delivery_followup", icon: "⭐", desc: "3 days after order marked delivered",          color: "#10b981" },
            { type: "reengagement_30d",  icon: "💌", desc: "30 days since last paid order",               color: "#C8B993" },
          ].map((seq) => {
            const stat = autoSends.find((r) => r.type === seq.type);
            return (
              <div key={seq.type} className="bg-[#1D1D1D] border border-[#2A2A2A] rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{seq.icon}</span>
                  <p className="text-white text-sm font-semibold">{TYPE_LABELS[seq.type]}</p>
                  <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full text-green-400 bg-green-400/10 border border-green-400/20">Active</span>
                </div>
                <p className="text-gray-500 text-xs mb-3">{seq.desc}</p>
                {stat ? (
                  <div className="flex gap-4 text-xs">
                    <span className="text-gray-400">{stat.total} sent</span>
                    <span className="text-blue-400">{stat.opens} opens</span>
                    <span className="text-[#C8B993]">{stat.clicks} clicks</span>
                  </div>
                ) : (
                  <p className="text-gray-600 text-xs">No sends yet</p>
                )}
              </div>
            );
          })}
        </div>

        {/* Recent automated sends */}
        {recentAuto.length > 0 && (
          <div className="bg-[#1D1D1D] border border-[#2A2A2A] rounded-2xl overflow-hidden">
            <div className="px-5 py-3 border-b border-[#2A2A2A]">
              <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Recent Automated Sends</p>
            </div>
            <div className="divide-y divide-[#1A1A1A]">
              {recentAuto.map((s) => (
                <div key={s.id} className="flex items-center gap-3 px-5 py-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-xs font-medium truncate">{s.email}</p>
                    <p className="text-gray-500 text-[10px]">{TYPE_LABELS[s.type] ?? s.type}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {s.opened ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full text-blue-400 bg-blue-400/10">Opened</span>
                    ) : null}
                    {s.clicked ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full text-green-400 bg-green-400/10">Clicked</span>
                    ) : null}
                    {!s.opened && !s.clicked ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full text-gray-500 bg-white/5">Sent</span>
                    ) : null}
                    <p className="text-gray-600 text-[10px] w-20 text-right">
                      {new Date(s.createdAt).toLocaleDateString("en-ZA", { day: "numeric", month: "short" })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Manual campaign composer */}
      <div className="mb-7">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4">Send Campaign</h2>
        <EmailComposer customerCount={customerCount} pendingCount={pendingCount} products={products} />
      </div>

      {/* Campaign history */}
      {campaigns.length > 0 && (
        <div className="mt-6">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4">Campaign History</h2>
          <div className="bg-[#1D1D1D] border border-[#2A2A2A] rounded-2xl overflow-hidden">
            <div className="grid grid-cols-[1fr_120px_90px_130px] gap-3 px-5 py-3 border-b border-[#2A2A2A]">
              {["Subject", "Recipients", "Sent", "Date"].map((h) => (
                <p key={h} className="text-[11px] text-gray-500 uppercase tracking-wider font-medium">{h}</p>
              ))}
            </div>
            {campaigns.map((c) => (
              <div key={c.id} className="grid grid-cols-[1fr_120px_90px_130px] gap-3 items-center px-5 py-3.5 border-b border-[#1A1A1A] last:border-0">
                <p className="text-white text-sm truncate">{c.subject}</p>
                <p className="text-gray-400 text-sm capitalize">{c.recipients}</p>
                <p className="text-[#C8B993] font-bold text-sm">{c.sent_to}</p>
                <p className="text-gray-500 text-xs">
                  {new Date(c.createdAt).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
