"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, RefreshCw, MessageCircle, Mail, ChevronDown, ChevronUp, Search, User } from "lucide-react";

interface OrderItem {
  id: string; name: string; price: string; qty: number; imageUrl: string;
}
interface Order {
  id: string; ref: string; name: string; email: string; phone: string;
  address: string; items: OrderItem[]; total: number; status: string;
  bank_id: string | null; tracking_number: string | null; createdAt: string;
}

interface Customer {
  email: string;
  name: string;
  phone: string;
  bank_id: string | null;
  orders: Order[];
  totalSpent: number;
  lastOrderAt: string;
}

const PAID = new Set(["approved", "shipped", "delivered"]);

const STATUS_COLORS: Record<string, string> = {
  pending:         "#6b7280",
  proof_submitted: "#f59e0b",
  approved:        "#10b981",
  rejected:        "#ef4444",
  shipped:         "#3b82f6",
  delivered:       "#C8B993",
};

const BANK_LABELS: Record<string, { label: string; color: string }> = {
  fnb:      { label: "FNB",      color: "#10b981" },
  tymebank: { label: "TymeBank", color: "#8b5cf6" },
};

function toWaPhone(phone: string) {
  const clean = phone.replace(/[\s\-()]/g, "");
  if (clean.startsWith("+")) return clean.slice(1);
  if (clean.startsWith("0")) return "27" + clean.slice(1);
  return clean;
}

function groupCustomers(orders: Order[]): Customer[] {
  const map = new Map<string, Customer>();
  const sorted = [...orders].sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  for (const order of sorted) {
    const key = order.email.toLowerCase().trim();
    const existing = map.get(key);
    if (!existing) {
      map.set(key, {
        email:       order.email,
        name:        order.name,
        phone:       order.phone,
        bank_id:     order.bank_id,
        orders:      [order],
        totalSpent:  PAID.has(order.status) ? order.total : 0,
        lastOrderAt: order.createdAt,
      });
    } else {
      existing.orders.push(order);
      if (PAID.has(order.status)) existing.totalSpent += order.total;
      if (order.createdAt > existing.lastOrderAt) {
        existing.lastOrderAt = order.createdAt;
        existing.name  = order.name;
        existing.phone = order.phone;
        if (order.bank_id) existing.bank_id = order.bank_id;
      }
    }
  }

  return [...map.values()].sort((a, b) => b.lastOrderAt.localeCompare(a.lastOrderAt));
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [expanded, setExpanded]   = useState<string | null>(null);
  const [sort, setSort]           = useState<"recent" | "spent" | "orders">("recent");

  useEffect(() => { fetchCustomers(); }, []);

  async function fetchCustomers() {
    setLoading(true);
    const res  = await fetch("/api/orders");
    const data = await res.json();
    setCustomers(groupCustomers(Array.isArray(data) ? data : []));
    setLoading(false);
  }

  const q = search.trim().toLowerCase();
  const filtered = customers
    .filter(c =>
      !q ||
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.phone.replace(/\s/g, "").includes(q.replace(/\s/g, ""))
    )
    .sort((a, b) => {
      if (sort === "spent")  return b.totalSpent - a.totalSpent;
      if (sort === "orders") return b.orders.length - a.orders.length;
      return b.lastOrderAt.localeCompare(a.lastOrderAt);
    });

  const totalCustomers = customers.length;
  const totalRevenue   = customers.reduce((s, c) => s + c.totalSpent, 0);
  const repeatBuyers   = customers.filter(c => c.orders.length > 1).length;

  return (
    <div className="min-h-screen bg-[#111111]">
      <header className="bg-[#0f0f0f] border-b border-[#1A1A1A] px-4 sm:px-6 py-3 flex items-center gap-3">
        <Link href="/admin/dashboard" className="text-gray-500 hover:text-white transition-colors shrink-0">
          <ArrowLeft size={18} />
        </Link>
        <h1 className="text-white font-semibold text-sm flex-1">Customers</h1>
        <button onClick={fetchCustomers} className="flex items-center gap-1.5 text-gray-400 hover:text-white text-xs transition-colors">
          <RefreshCw size={13} /> Refresh
        </button>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">

        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: "Total Customers", value: totalCustomers,          color: "#9ca3af" },
            { label: "Repeat Buyers",   value: repeatBuyers,            color: "#C8B993" },
            { label: "Total Revenue",   value: `R ${totalRevenue.toLocaleString()}`, color: "#10b981" },
          ].map(s => (
            <div key={s.label} className="bg-[#111] border border-[#2A2A2A] rounded-xl p-3 text-center">
              <p className="font-bold text-lg sm:text-xl mb-0.5 truncate" style={{ color: s.color }}>{s.value}</p>
              <p className="text-gray-500 text-[10px] sm:text-xs">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Search + sort */}
        <div className="flex gap-3 mb-5">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, email or phone…"
              className="w-full bg-[#111] border border-[#2A2A2A] rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#C8B993]/50 transition-colors"
            />
          </div>
          <select
            value={sort}
            onChange={e => setSort(e.target.value as typeof sort)}
            className="bg-[#111] border border-[#2A2A2A] rounded-xl px-3 py-2.5 text-sm text-gray-300 focus:outline-none focus:border-[#C8B993]/50 transition-colors appearance-none">
            <option value="recent">Most Recent</option>
            <option value="spent">Most Spent</option>
            <option value="orders">Most Orders</option>
          </select>
        </div>

        {loading ? (
          <p className="text-gray-500 text-sm py-16 text-center">Loading…</p>
        ) : filtered.length === 0 ? (
          <p className="text-gray-500 text-sm py-16 text-center">No customers found</p>
        ) : (
          <div className="space-y-2.5">
            {filtered.map(customer => {
              const isOpen    = expanded === customer.email;
              const bank      = customer.bank_id ? BANK_LABELS[customer.bank_id] : null;
              const orderWord = customer.orders.length === 1 ? "order" : "orders";

              return (
                <div key={customer.email} className="bg-[#1D1D1D] border border-[#2A2A2A] rounded-2xl overflow-hidden transition-colors hover:border-[#2a2a2a]">

                  {/* Customer row */}
                  <div className="flex items-center gap-4 px-5 py-4">

                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-[#2A2A2A] flex items-center justify-center shrink-0">
                      <span className="text-sm font-bold text-gray-400">{customer.name.charAt(0).toUpperCase()}</span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-white font-semibold text-sm truncate">{customer.name}</p>
                        {bank && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0"
                            style={{ color: bank.color, background: bank.color + "18", border: `1px solid ${bank.color}44` }}>
                            {bank.label}
                          </span>
                        )}
                        {customer.orders.length > 1 && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-[#C8B993] bg-[#C8B993]/10 border border-[#C8B993]/30 shrink-0">
                            Repeat
                          </span>
                        )}
                      </div>
                      <p className="text-gray-500 text-xs truncate">{customer.email}</p>
                      <p className="text-gray-600 text-xs">{customer.phone}</p>
                    </div>

                    {/* Stats */}
                    <div className="hidden sm:flex flex-col items-end shrink-0">
                      <p className="text-white font-bold text-sm">R {customer.totalSpent.toLocaleString()}</p>
                      <p className="text-gray-500 text-xs">{customer.orders.length} {orderWord}</p>
                      <p className="text-gray-600 text-[10px]">{new Date(customer.lastOrderAt).toLocaleDateString("en-ZA")}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      <Link
                        href={`/admin/dashboard/customers/${btoa(customer.email).replace(/=/g, "")}`}
                        className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-colors"
                        title="View Profile">
                        <User size={15} />
                      </Link>
                      <a
                        href={`https://wa.me/${toWaPhone(customer.phone)}?text=${encodeURIComponent(`Hi ${customer.name.split(" ")[0]}, this is Bevanssons `)}`}
                        target="_blank" rel="noopener noreferrer"
                        className="p-2 rounded-lg text-gray-500 hover:text-[#25D366] hover:bg-[#25D366]/10 transition-colors">
                        <MessageCircle size={15} />
                      </a>
                      <a
                        href={`mailto:${customer.email}`}
                        className="p-2 rounded-lg text-gray-500 hover:text-[#C8B993] hover:bg-[#C8B993]/10 transition-colors">
                        <Mail size={15} />
                      </a>
                      <button
                        onClick={() => setExpanded(isOpen ? null : customer.email)}
                        className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-colors">
                        {isOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                      </button>
                    </div>
                  </div>

                  {/* Mobile stats row */}
                  <div className="sm:hidden flex justify-between px-5 pb-3 text-xs">
                    <span className="text-gray-500">{customer.orders.length} {orderWord}</span>
                    <span className="text-white font-bold">R {customer.totalSpent.toLocaleString()}</span>
                    <span className="text-gray-600">{new Date(customer.lastOrderAt).toLocaleDateString("en-ZA")}</span>
                  </div>

                  {/* Order history */}
                  {isOpen && (
                    <div className="border-t border-[#2A2A2A] divide-y divide-[#1A1A1A]">
                      {[...customer.orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map(order => (
                        <div key={order.id} className="flex items-center gap-3 px-5 py-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-[#C8B993] text-xs font-bold">{order.ref}</span>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full capitalize"
                                style={{ color: STATUS_COLORS[order.status] ?? "#9ca3af", background: (STATUS_COLORS[order.status] ?? "#9ca3af") + "18" }}>
                                {order.status.replace(/_/g, " ")}
                              </span>
                            </div>
                            <p className="text-gray-500 text-xs mt-0.5">
                              {order.items.length} item{order.items.length !== 1 ? "s" : ""} · {new Date(order.createdAt).toLocaleDateString("en-ZA")}
                            </p>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <p className="text-white font-bold text-sm">R {order.total.toLocaleString()}</p>
                            <Link
                              href="/admin/dashboard/orders"
                              className="text-gray-500 hover:text-white text-xs px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                              View
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
