import { getProducts, getLeads } from "@/lib/products";
import { getQuotes } from "@/lib/quotes";
import { listOrders } from "@/lib/orders";
import { listApplications as listInstallmentApps } from "@/lib/installments";
import { isClothingCategory } from "@/lib/categories";
import Link from "next/link";

export const dynamic = "force-dynamic";

// Section card config
const GOLD  = "#C8B993";
const GREEN = "#10b981";
const BLUE  = "#3b82f6";
const AMBER = "#f59e0b";
const PURPLE = "#a855f7";
const TEAL  = "#14b8a6";
const PINK  = "#ec4899";
const ORANGE = "#f97316";
const ROSE  = "#f43f5e";

export default async function Dashboard() {
  const products   = getProducts();
  const leads      = getLeads() as {
    id: string; name?: string; email?: string; phone?: string;
    message?: string; productInterest?: string; createdAt: string;
  }[];
  const quotes     = getQuotes();
  const orders     = listOrders();
  const installmentApps = listInstallmentApps();

  // Derived counts
  const clothingCount     = products.filter((p) => isClothingCategory(p.category)).length;
  const newQuotes         = quotes.filter((q) => q.status === "new").length;
  const pendingOrders     = orders.filter(o => o.status === "pending" || o.status === "proof_submitted").length;
  const newInstallments   = installmentApps.filter(a => a.status === "new").length;
  const featured          = products.filter((p) => p.featured).length;
  const inStock           = products.filter((p) => p.inStock).length;
  const uniqueCustomers   = new Set(orders.map(o => o.email?.toLowerCase()).filter(Boolean)).size;

  // ── Analytics ──────────────────────────────────────────────────────────────
  const PAID = new Set(["approved", "shipped", "delivered"]);
  const paidOrders    = orders.filter(o => PAID.has(o.status));
  const totalRevenue  = paidOrders.reduce((s, o) => s + o.total, 0);
  const avgOrderValue = paidOrders.length ? Math.round(totalRevenue / paidOrders.length) : 0;

  const weeklyRevenue = Array.from({ length: 8 }, (_, wi) => {
    const now = new Date();
    const weekEnd = new Date(now);
    weekEnd.setDate(now.getDate() - wi * 7);
    weekEnd.setHours(23, 59, 59, 999);
    const weekStart = new Date(weekEnd);
    weekStart.setDate(weekEnd.getDate() - 6);
    weekStart.setHours(0, 0, 0, 0);
    const revenue = paidOrders
      .filter(o => { const d = new Date(o.createdAt); return d >= weekStart && d <= weekEnd; })
      .reduce((s, o) => s + o.total, 0);
    const label = weekStart.toLocaleDateString("en-ZA", { month: "short", day: "numeric" });
    return { label, revenue };
  }).reverse();
  const maxWeekRevenue = Math.max(...weeklyRevenue.map(w => w.revenue), 1);

  const productStats = new Map<string, { name: string; qty: number; revenue: number }>();
  for (const order of paidOrders) {
    for (const item of order.items) {
      const unitPrice = parseFloat(String(item.price).replace(/[^0-9.]/g, "")) || 0;
      const prev = productStats.get(item.name) ?? { name: item.name, qty: 0, revenue: 0 };
      prev.qty += item.qty;
      prev.revenue += unitPrice * item.qty;
      productStats.set(item.name, prev);
    }
  }
  const topProducts = [...productStats.values()].sort((a, b) => b.qty - a.qty).slice(0, 5);

  const totalOrders = orders.length;
  const withProof   = orders.filter(o => o.status !== "pending").length;
  const approvedN   = paidOrders.length;
  const deliveredN  = orders.filter(o => o.status === "delivered").length;
  const pct = (n: number) => totalOrders ? Math.round((n / totalOrders) * 100) : 0;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">

      {/* Page title */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white">Overview</h1>
        <p className="text-gray-500 text-sm mt-0.5">Welcome back — here&apos;s what&apos;s happening.</p>
      </div>

      {/* ── Stat strip ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-8">
        {[
          { label: "Products",    value: products.length },
          { label: "In Stock",    value: inStock },
          { label: "Featured",    value: featured },
          { label: "Pending Orders", value: pendingOrders, gold: pendingOrders > 0 },
          { label: "New Quotes",  value: newQuotes,      gold: newQuotes > 0 },
          { label: "New Install. Apps", value: newInstallments, gold: newInstallments > 0 },
        ].map((s) => (
          <div key={s.label}
            className={`bg-[#1D1D1D] border rounded-xl p-3 text-center ${s.gold ? "border-[#C8B993]/40" : "border-[#2A2A2A]"}`}>
            <p className={`text-2xl font-bold mb-0.5 ${s.gold ? "text-[#C8B993]" : "text-white"}`}>{s.value}</p>
            <p className="text-gray-500 text-[10px] leading-tight">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Section cards ────────────────────────────────────────────────────── */}
      <div className="mb-8">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4">Manage</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">

          {/* Orders */}
          <Link href="/admin/dashboard/orders"
            className="group bg-[#1D1D1D] border border-[#2A2A2A] hover:border-[#C8B993]/40 rounded-2xl p-4 transition-all hover:bg-[#141414]">
            <div className="flex items-start justify-between mb-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${AMBER}18` }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={AMBER} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
                </svg>
              </div>
              {pendingOrders > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: `${AMBER}20`, color: AMBER }}>
                  {pendingOrders} pending
                </span>
              )}
            </div>
            <p className="text-white font-semibold text-sm">Orders</p>
            <p className="text-gray-500 text-xs mt-0.5">{orders.length} total</p>
          </Link>

          {/* Quotes */}
          <Link href="/admin/dashboard/quotes"
            className="group bg-[#1D1D1D] border border-[#2A2A2A] hover:border-[#C8B993]/40 rounded-2xl p-4 transition-all hover:bg-[#141414]">
            <div className="flex items-start justify-between mb-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${BLUE}18` }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10,9 9,9 8,9"/>
                </svg>
              </div>
              {newQuotes > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: `${BLUE}20`, color: BLUE }}>
                  {newQuotes} new
                </span>
              )}
            </div>
            <p className="text-white font-semibold text-sm">Quotes</p>
            <p className="text-gray-500 text-xs mt-0.5">{quotes.length} total</p>
          </Link>

          {/* Installments */}
          <Link href="/admin/dashboard/installments"
            className="group bg-[#1D1D1D] border border-[#2A2A2A] hover:border-[#C8B993]/40 rounded-2xl p-4 transition-all hover:bg-[#141414]">
            <div className="flex items-start justify-between mb-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${GREEN}18` }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
                </svg>
              </div>
              {newInstallments > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: `${GREEN}20`, color: GREEN }}>
                  {newInstallments} new
                </span>
              )}
            </div>
            <p className="text-white font-semibold text-sm">Installments</p>
            <p className="text-gray-500 text-xs mt-0.5">{installmentApps.length} total apps</p>
          </Link>

          {/* Leads */}
          <Link href="/admin/dashboard/leads"
            className="group bg-[#1D1D1D] border border-[#2A2A2A] hover:border-[#C8B993]/40 rounded-2xl p-4 transition-all hover:bg-[#141414]">
            <div className="flex items-start justify-between mb-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${PURPLE}18` }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={PURPLE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
                </svg>
              </div>
              {leads.length > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: `${PURPLE}20`, color: PURPLE }}>
                  {leads.length}
                </span>
              )}
            </div>
            <p className="text-white font-semibold text-sm">Leads</p>
            <p className="text-gray-500 text-xs mt-0.5">Contact submissions</p>
          </Link>

          {/* Customers */}
          <Link href="/admin/dashboard/customers"
            className="group bg-[#1D1D1D] border border-[#2A2A2A] hover:border-[#C8B993]/40 rounded-2xl p-4 transition-all hover:bg-[#141414]">
            <div className="flex items-start justify-between mb-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${TEAL}18` }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={TEAL} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/><polyline points="16,11 18,13 22,9"/>
                </svg>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: `${TEAL}20`, color: TEAL }}>
                {uniqueCustomers}
              </span>
            </div>
            <p className="text-white font-semibold text-sm">Customers</p>
            <p className="text-gray-500 text-xs mt-0.5">Unique buyers</p>
          </Link>

          {/* Site Images */}
          <Link href="/admin/dashboard/images"
            className="group bg-[#1D1D1D] border border-[#2A2A2A] hover:border-[#C8B993]/40 rounded-2xl p-4 transition-all hover:bg-[#141414]">
            <div className="flex items-start justify-between mb-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${ORANGE}18` }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ORANGE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21,15 16,10 5,21"/>
                </svg>
              </div>
            </div>
            <p className="text-white font-semibold text-sm">Site Images</p>
            <p className="text-gray-500 text-xs mt-0.5">Hero &amp; banners</p>
          </Link>

          {/* Chat */}
          <Link href="/admin/dashboard/chat"
            className="group bg-[#1D1D1D] border border-[#2A2A2A] hover:border-[#C8B993]/40 rounded-2xl p-4 transition-all hover:bg-[#141414]">
            <div className="flex items-start justify-between mb-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${PINK}18` }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={PINK} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
                </svg>
              </div>
            </div>
            <p className="text-white font-semibold text-sm">Chat</p>
            <p className="text-gray-500 text-xs mt-0.5">Customer messages</p>
          </Link>

          {/* Products */}
          <Link href="/admin/dashboard/products"
            className="group bg-[#1D1D1D] border border-[#2A2A2A] hover:border-[#C8B993]/40 rounded-2xl p-4 transition-all hover:bg-[#141414]">
            <div className="flex items-start justify-between mb-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${GOLD}18` }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
                  <polyline points="3.27,6.96 12,12.01 20.73,6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
                </svg>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: `${GOLD}20`, color: GOLD }}>
                {products.length}
              </span>
            </div>
            <p className="text-white font-semibold text-sm">Products (All)</p>
            <p className="text-gray-500 text-xs mt-0.5">{inStock} in stock</p>
          </Link>

          {/* Clothing & Apparel */}
          <Link href="/admin/dashboard/clothing"
            className="group bg-[#1D1D1D] border border-[#2A2A2A] hover:border-[#C8B993]/40 rounded-2xl p-4 transition-all hover:bg-[#141414]">
            <div className="flex items-start justify-between mb-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${ROSE}18` }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ROSE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.47a1 1 0 00.99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 002-2V10h2.15a1 1 0 00.99-.84l.58-3.47a2 2 0 00-1.34-2.23z"/>
                </svg>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: `${ROSE}20`, color: ROSE }}>
                {clothingCount} items
              </span>
            </div>
            <p className="text-white font-semibold text-sm">Clothing &amp; Apparel</p>
            <p className="text-gray-500 text-xs mt-0.5">Streetwear &amp; drops</p>
          </Link>

        </div>
      </div>

      {/* ── Analytics ────────────────────────────────────────────────────────── */}
      <div className="grid lg:grid-cols-3 gap-4 mb-8">

        <div className="lg:col-span-2 bg-[#1D1D1D] border border-[#2A2A2A] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-white">Weekly Revenue</h2>
            <p className="text-[#C8B993] font-bold text-sm">R {totalRevenue.toLocaleString()}</p>
          </div>
          <div className="flex items-end gap-1.5 h-24">
            {weeklyRevenue.map(({ label, revenue }) => (
              <div key={label} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                <div
                  className="w-full rounded-t-sm"
                  style={{
                    height: revenue > 0 ? `${Math.max((revenue / maxWeekRevenue) * 100, 6)}%` : "3px",
                    background: revenue > 0 ? "#C8B993" : "#2A2A2A",
                  }}
                />
                <span className="text-[8px] text-gray-600 whitespace-nowrap leading-none">{label}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-6 mt-4 pt-3 border-t border-[#2A2A2A]">
            <div>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider">Avg Order</p>
              <p className="text-white font-bold text-sm">R {avgOrderValue.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider">Paid Orders</p>
              <p className="text-white font-bold text-sm">{paidOrders.length}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider">Total Revenue</p>
              <p className="text-[#C8B993] font-bold text-sm">R {totalRevenue.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-[#1D1D1D] border border-[#2A2A2A] rounded-2xl p-5">
          <h2 className="text-sm font-bold text-white mb-4">Conversion Funnel</h2>
          <div className="space-y-3.5">
            {([
              { label: "Orders Placed",   value: totalOrders, p: 100,             color: "#9ca3af" },
              { label: "Proof Submitted", value: withProof,   p: pct(withProof),  color: "#f59e0b" },
              { label: "Approved",        value: approvedN,   p: pct(approvedN),  color: "#10b981" },
              { label: "Delivered",       value: deliveredN,  p: pct(deliveredN), color: "#C8B993" },
            ] as { label: string; value: number; p: number; color: string }[]).map(({ label, value, p, color }) => (
              <div key={label}>
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-gray-400">{label}</span>
                  <span className="text-xs font-bold" style={{ color }}>
                    {value} <span className="text-gray-600 font-normal">({p}%)</span>
                  </span>
                </div>
                <div className="h-1.5 bg-[#2A2A2A] rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${p}%`, background: color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top selling products */}
      {topProducts.length > 0 && (
        <div className="bg-[#1D1D1D] border border-[#2A2A2A] rounded-2xl overflow-hidden mb-8">
          <div className="px-5 py-3.5 border-b border-[#2A2A2A]">
            <h2 className="text-sm font-bold text-white">Top Selling Products</h2>
          </div>
          <div className="divide-y divide-[#1A1A1A]">
            {topProducts.map((p, i) => (
              <div key={p.name} className="flex items-center gap-4 px-5 py-3">
                <span className="text-gray-600 text-xs font-bold w-4 shrink-0">{i + 1}</span>
                <p className="text-white text-sm flex-1 truncate">{p.name}</p>
                <span className="text-gray-500 text-xs shrink-0">{p.qty} sold</span>
                <span className="text-[#C8B993] font-bold text-sm shrink-0">R {Math.round(p.revenue).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
