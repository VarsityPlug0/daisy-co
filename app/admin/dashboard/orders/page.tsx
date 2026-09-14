"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  CheckCircle, XCircle, Clock, Truck, Package, ArrowLeft, RefreshCw,
  Search, Copy, MessageCircle, Save, Camera, Upload, X, Download,
  Bell, BellOff,
} from "lucide-react";

interface Order {
  id: string;
  ref: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  items: { id: string; name: string; price: string; qty: number; imageUrl: string }[];
  total: number;
  status: string;
  payment_method: string;
  proof_url: string | null;
  eft_reference: string | null;
  notes: string | null;
  bank_id: string | null;
  tracking_number: string | null;
  createdAt: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending:         { label: "Pending",         color: "#6b7280", icon: <Clock size={13} /> },
  proof_submitted: { label: "Proof Submitted", color: "#f59e0b", icon: <Package size={13} /> },
  approved:        { label: "Approved",        color: "#10b981", icon: <CheckCircle size={13} /> },
  rejected:        { label: "Rejected",        color: "#ef4444", icon: <XCircle size={13} /> },
  shipped:         { label: "Shipped",         color: "#3b82f6", icon: <Truck size={13} /> },
  delivered:       { label: "Delivered",       color: "#D4AF37", icon: <CheckCircle size={13} /> },
};

const BANK_LABELS: Record<string, { label: string; color: string }> = {
  fnb:      { label: "FNB",      color: "#10b981" },
  tymebank: { label: "TymeBank", color: "#8b5cf6" },
};

const NOTIFY_TEMPLATES = [
  { id: "processing",       label: "Being Prepared",   color: "#8b5cf6", default: "We are pleased to confirm that your order has been successfully confirmed and is now being prepared by our fulfilment team.\n\nOur team is carefully preparing your order to ensure everything is correct before it moves to the next stage.\n\nWe will notify you as soon as your order is ready for packing." },
  { id: "packed",           label: "Being Packed",     color: "#3b82f6", default: "Your order has successfully moved to the packing stage.\n\nOur fulfilment team is currently checking and securely packaging your order to ensure that it is properly prepared for transportation.\n\nOnce packing and final quality checks are completed, your order will proceed to shipping. You will receive another notification when your order has been dispatched." },
  { id: "out_for_delivery", label: "Out for Delivery", color: "#10b981", default: "Great news. Your Bevanssons order is now out for delivery.\n\nYour assigned delivery driver is currently completing the delivery route and will contact you directly when they are approaching your location.\n\nKindly keep your phone available and ensure that someone is available to receive the order.\n\nPlease note: Delivery times may vary depending on the driver's route, traffic and other scheduled deliveries.\n\nWe appreciate your patience and look forward to completing your delivery successfully." },
  { id: "delayed",          label: "Delayed",          color: "#f59e0b", default: "We would like to inform you that there has been a slight delay with your order. We sincerely apologise for any inconvenience this may cause.\n\nOur team is working to resolve this as quickly as possible and your order will be on its way shortly. We will keep you updated with any further changes." },
  { id: "custom",           label: "Custom",           color: "#D4AF37", default: "" },
];

const TEST_TEMPLATES = [
  { id: "processing",       label: "Being Prepared" },
  { id: "packed",           label: "Being Packed" },
  { id: "shipped",          label: "Shipped (auto)" },
  { id: "out_for_delivery", label: "Out for Delivery" },
  { id: "delivered",        label: "Delivered (auto)" },
  { id: "delayed",          label: "Delayed" },
];

const STATUSES = ["pending", "proof_submitted", "approved", "shipped", "delivered", "rejected"];

function toWaPhone(phone: string) {
  const clean = phone.replace(/[\s\-()]/g, "");
  if (clean.startsWith("+")) return clean.slice(1);
  if (clean.startsWith("0")) return "27" + clean.slice(1);
  return clean;
}

function exportCSV(rows: Order[], filename = "orders") {
  const header = ["Ref", "Name", "Email", "Phone", "Address", "Items", "Total", "Status", "Bank", "Tracking", "Date"];
  const lines = rows.map(o => [
    o.ref, o.name, o.email, o.phone, o.address,
    o.items.map(i => `${i.name} x${i.qty}`).join("; "),
    o.total, o.status, o.bank_id ?? "", o.tracking_number ?? "",
    new Date(o.createdAt).toLocaleDateString("en-ZA"),
  ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(","));
  const csv = [header.join(","), ...lines].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function AdminOrdersPage() {
  const [orders, setOrders]           = useState<Order[]>([]);
  const [selected, setSelected]       = useState<Order | null>(null);
  const [loading, setLoading]         = useState(true);
  const [updating, setUpdating]       = useState(false);
  const [bulkUpdating, setBulkUpdating] = useState(false);
  const [notes, setNotes]             = useState("");
  const [tracking, setTracking]       = useState("");
  const [savingTracking, setSavingTracking] = useState(false);
  const [filter, setFilter]           = useState("all");
  const [search, setSearch]           = useState("");
  const [showDetail, setShowDetail]   = useState(false);
  const [copied, setCopied]           = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [uploadingProof, setUploadingProof] = useState(false);
  const [notifyTemplate, setNotifyTemplate] = useState<string | null>(null);
  const [notifyMessage,  setNotifyMessage]  = useState("");
  const [sendingNotify,  setSendingNotify]  = useState(false);
  const [notifySent,     setNotifySent]     = useState(false);
  const [showTestPanel,  setShowTestPanel]  = useState(false);
  const [testEmail,      setTestEmail]      = useState("");
  const [testingId,      setTestingId]      = useState<string | null>(null);
  const [testSent,       setTestSent]       = useState<string | null>(null);
  const proofInputRef  = useRef<HTMLInputElement>(null);
  const ordersRef      = useRef<Order[]>([]);

  // Notification / real-time state
  const [alertOrders,   setAlertOrders]   = useState<Order[]>([]);
  const [lastRefreshAt, setLastRefreshAt] = useState<Date>(new Date());
  const [notifEnabled,  setNotifEnabled]  = useState(false);
  const [, setTick]                       = useState(0); // drives "X ago" re-render

  // ── Helpers ────────────────────────────────────────────────────────────────

  function playBeep() {
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.5);
    } catch { /* AudioContext not available */ }
  }

  function timeSince(date: Date) {
    const s = Math.floor((Date.now() - date.getTime()) / 1000);
    if (s < 15) return "just now";
    if (s < 60) return `${s}s ago`;
    return `${Math.floor(s / 60)}m ago`;
  }

  function sendBrowserNotif(newOrders: Order[]) {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission !== "granted") return;
    new Notification("New Payment Proof — Bevanssons", {
      body: `${newOrders.length} new proof${newOrders.length > 1 ? "s" : ""} received: ${newOrders.map(o => o.ref).join(", ")}`,
      icon: "/logo.jpg",
    });
  }

  async function requestNotifications() {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    const perm = await Notification.requestPermission();
    setNotifEnabled(perm === "granted");
  }

  const silentRefresh = useCallback(async () => {
    try {
      const res  = await fetch("/api/orders");
      const data = await res.json();
      if (!Array.isArray(data)) return;

      const knownIds = new Set(ordersRef.current.map(o => o.id));
      const fresh    = (data as Order[]).filter(o => !knownIds.has(o.id) && o.status === "proof_submitted");

      if (fresh.length > 0) {
        setAlertOrders(prev => [...prev, ...fresh]);
        playBeep();
        sendBrowserNotif(fresh);
      }

      setOrders(data as Order[]);
      setLastRefreshAt(new Date());
    } catch { /* network hiccup — ignore */ }
  }, []);

  // ── Effects ────────────────────────────────────────────────────────────────

  // Keep ref in sync with state so silentRefresh always sees current orders
  useEffect(() => { ordersRef.current = orders; }, [orders]);

  // Tab title badge — shows pending count
  useEffect(() => {
    const pending = orders.filter(o => o.status === "pending" || o.status === "proof_submitted").length;
    document.title = pending > 0 ? `(${pending}) Orders — Bevanssons Admin` : "Orders — Bevanssons Admin";
    return () => { document.title = "Bevanssons"; };
  }, [orders]);

  // Auto-refresh every 60 s
  useEffect(() => {
    const interval = setInterval(silentRefresh, 60_000);
    return () => clearInterval(interval);
  }, [silentRefresh]);

  // Tick every 15 s to keep "last updated X ago" fresh
  useEffect(() => {
    const t = setInterval(() => setTick(n => n + 1), 15_000);
    return () => clearInterval(t);
  }, []);

  // Restore notification permission state on mount
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setNotifEnabled(Notification.permission === "granted");
    }
  }, []);

  useEffect(() => { fetchOrders(); }, []);

  async function fetchOrders() {
    setLoading(true);
    const res  = await fetch("/api/orders");
    const data = await res.json();
    setOrders(Array.isArray(data) ? data : []);
    setLastRefreshAt(new Date());
    setLoading(false);
  }

  async function updateStatus(id: string, status: string) {
    setUpdating(true);
    const res = await fetch(`/api/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, notes: notes || undefined }),
    });
    if (res.ok) {
      const updated = await res.json();
      setOrders(o => o.map(x => x.id === id ? updated : x));
      setSelected(updated);
    }
    setUpdating(false);
  }

  async function bulkUpdateStatus(status: string) {
    if (!selectedIds.size) return;
    setBulkUpdating(true);
    const results = await Promise.all(
      [...selectedIds].map(id =>
        fetch(`/api/orders/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        }).then(r => r.ok ? r.json() : null)
      )
    );
    const updated = results.filter(Boolean) as Order[];
    setOrders(prev => prev.map(o => {
      const u = updated.find(x => x.id === o.id);
      return u ?? o;
    }));
    if (selected && updated.find(x => x.id === selected.id)) {
      const u = updated.find(x => x.id === selected.id)!;
      setSelected(u);
    }
    setSelectedIds(new Set());
    setBulkUpdating(false);
  }

  async function saveTracking() {
    if (!selected) return;
    setSavingTracking(true);
    const res = await fetch(`/api/orders/${selected.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tracking_number: tracking.trim() || null }),
    });
    if (res.ok) {
      const updated = await res.json();
      setOrders(o => o.map(x => x.id === selected.id ? updated : x));
      setSelected(updated);
    }
    setSavingTracking(false);
  }

  async function handleProofUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !selected) return;
    setUploadingProof(true);
    const buf = await file.arrayBuffer();
    const bytes = new Uint8Array(buf);
    let binary = "";
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    const base64 = btoa(binary);
    const res = await fetch(`/api/admin/orders/${selected.id}/proof`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ file: base64, mimeType: file.type, filename: file.name }),
    });
    if (res.ok) {
      const updated = await res.json();
      setOrders(o => o.map(x => x.id === selected.id ? updated : x));
      setSelected(updated);
    }
    setUploadingProof(false);
    e.target.value = "";
  }

  function copyField(text: string, key: string) {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }

  function toggleSelect(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (selectedIds.size === visible.length && visible.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(visible.map(o => o.id)));
    }
  }

  async function sendTestEmail(templateId: string) {
    if (!testEmail.trim()) return;
    setTestingId(templateId);
    const res = await fetch("/api/admin/test-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ templateId, email: testEmail.trim() }),
    });
    setTestingId(null);
    if (res.ok) {
      setTestSent(templateId);
      setTimeout(() => setTestSent(null), 3000);
    }
  }

  async function sendNotify() {
    if (!selected || !notifyTemplate || !notifyMessage.trim()) return;
    setSendingNotify(true);
    const res = await fetch(`/api/admin/orders/${selected.id}/notify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ templateId: notifyTemplate, message: notifyMessage }),
    });
    setSendingNotify(false);
    if (res.ok) {
      setNotifySent(true);
      setTimeout(() => setNotifySent(false), 3000);
    }
  }

  function selectOrder(order: Order) {
    setSelected(order);
    setNotes(order.notes ?? "");
    setTracking(order.tracking_number ?? "");
    setNotifyTemplate(null);
    setNotifyMessage("");
    setNotifySent(false);
    setShowDetail(true);
  }

  const q = search.trim().toLowerCase();
  const statusFiltered = filter === "all" ? orders : orders.filter(o => o.status === filter);
  const visible = q
    ? statusFiltered.filter(o =>
        o.ref.toLowerCase().includes(q) ||
        o.name.toLowerCase().includes(q) ||
        o.email.toLowerCase().includes(q) ||
        o.phone.replace(/\s/g, "").includes(q.replace(/\s/g, ""))
      )
    : statusFiltered;

  const allVisibleSelected = visible.length > 0 && visible.every(o => selectedIds.has(o.id));

  const revenue = orders
    .filter(o => ["approved", "shipped", "delivered"].includes(o.status))
    .reduce((s, o) => s + o.total, 0);

  const statCards = [
    { label: "Total",     value: orders.length,                                                                         color: "#9ca3af" },
    { label: "Pending",   value: orders.filter(o => o.status === "pending" || o.status === "proof_submitted").length,   color: "#f59e0b" },
    { label: "Approved",  value: orders.filter(o => o.status === "approved").length,                                    color: "#10b981" },
    { label: "Shipped",   value: orders.filter(o => o.status === "shipped").length,                                     color: "#3b82f6" },
    { label: "Delivered", value: orders.filter(o => o.status === "delivered").length,                                   color: "#D4AF37" },
    { label: "Rejected",  value: orders.filter(o => o.status === "rejected").length,                                    color: "#ef4444" },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A]">

      {/* Lightbox modal */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={() => setLightboxUrl(null)}>
          <button
            onClick={() => setLightboxUrl(null)}
            className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors">
            <X size={24} />
          </button>
          <div className="relative max-w-4xl w-full" onClick={e => e.stopPropagation()}>
            {lightboxUrl.match(/\.pdf$/i) ? (
              <embed src={lightboxUrl} type="application/pdf" className="w-full h-[85vh] rounded-xl" />
            ) : (
              <img src={lightboxUrl} alt="Proof of payment" className="max-h-[90vh] max-w-full mx-auto rounded-xl object-contain" />
            )}
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-[#0f0f0f] border-b border-[#1A1A1A] px-4 sm:px-6 py-3 flex items-center gap-3">
        <Link href="/admin/dashboard" className="text-gray-500 hover:text-white transition-colors shrink-0">
          <ArrowLeft size={18} />
        </Link>
        <h1 className="text-white font-semibold text-sm flex-1">Orders</h1>
        <span className="hidden sm:block text-gray-600 text-[10px]">Updated {timeSince(lastRefreshAt)}</span>
        <button
          onClick={() => exportCSV(visible, "orders")}
          className="flex items-center gap-1.5 text-gray-400 hover:text-[#D4AF37] text-xs transition-colors">
          <Download size={13} /> Export
        </button>
        <button
          onClick={notifEnabled ? undefined : requestNotifications}
          title={notifEnabled ? "Browser notifications on" : "Enable browser notifications"}
          className="text-gray-400 hover:text-white transition-colors">
          {notifEnabled ? <Bell size={15} className="text-[#D4AF37]" /> : <BellOff size={15} />}
        </button>
        <button
          onClick={() => setShowTestPanel(p => !p)}
          className="flex items-center gap-1.5 text-gray-400 hover:text-[#D4AF37] text-xs transition-colors">
          Test Emails
        </button>
        <button onClick={fetchOrders}
          className="flex items-center gap-1.5 text-gray-400 hover:text-white text-xs transition-colors">
          <RefreshCw size={13} /> Refresh
        </button>
      </header>

      {/* Test email panel */}
      {showTestPanel && (
        <div className="bg-[#111] border-b border-[#1F1F1F] px-4 sm:px-6 py-4">
          <div className="max-w-7xl mx-auto">
            <p className="text-[#D4AF37] text-xs font-bold uppercase tracking-wider mb-3">Send Test Emails</p>
            <div className="flex gap-2 mb-3 flex-wrap">
              <input
                type="email"
                value={testEmail}
                onChange={e => setTestEmail(e.target.value)}
                placeholder="Your email address…"
                className="bg-[#0A0A0A] border border-[#2a2a2a] rounded-xl px-4 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#D4AF37]/50 transition-colors w-64"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {TEST_TEMPLATES.map(t => (
                <button
                  key={t.id}
                  onClick={() => sendTestEmail(t.id)}
                  disabled={!testEmail.trim() || testingId === t.id}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-40 transition-all"
                  style={testSent === t.id
                    ? { background: "#10b98120", color: "#10b981", border: "1px solid #10b98140" }
                    : { background: "#1F1F1F", color: "#9ca3af", border: "1px solid #2a2a2a" }}>
                  {testingId === t.id ? "Sending…" : testSent === t.id ? `✓ ${t.label} Sent` : `Send: ${t.label}`}
                </button>
              ))}
            </div>
            <p className="text-gray-600 text-[10px] mt-2">Uses a dummy order (DC-TEST01) so you can preview each template.</p>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">

        {/* Stats */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-4">
          {statCards.map(s => (
            <div key={s.label} className="bg-[#111] border border-[#1F1F1F] rounded-xl p-3 text-center">
              <p className="text-xl sm:text-2xl font-bold mb-0.5" style={{ color: s.color }}>{s.value}</p>
              <p className="text-gray-500 text-[10px] sm:text-xs">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Revenue */}
        <div className="bg-[#111] border border-[#D4AF37]/20 rounded-xl px-4 sm:px-5 py-3.5 flex items-center justify-between mb-5">
          <p className="text-gray-400 text-xs sm:text-sm">Revenue (approved + shipped + delivered)</p>
          <p className="text-[#D4AF37] font-bold text-lg sm:text-xl">R {revenue.toLocaleString()}</p>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-3 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          {["all", ...STATUSES].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
              style={filter === f
                ? { background: "#D4AF37", color: "#000" }
                : { background: "#1F1F1F", color: "#9ca3af" }}>
              {f === "all" ? "All" : STATUS_CONFIG[f]?.label ?? f}
              {" "}({f === "all" ? orders.length : orders.filter(o => o.status === f).length})
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by ref, name, email or phone…"
            className="w-full bg-[#111] border border-[#1F1F1F] rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#D4AF37]/50 transition-colors"
          />
        </div>

        {/* New proof alert banner */}
        {alertOrders.length > 0 && (
          <div className="bg-[#f59e0b]/10 border border-[#f59e0b]/40 rounded-xl px-4 py-3 mb-3 flex items-center gap-3 animate-pulse-once">
            <Package size={15} className="text-[#f59e0b] shrink-0" />
            <p className="text-[#f59e0b] text-sm flex-1">
              <span className="font-bold">{alertOrders.length} new proof{alertOrders.length > 1 ? "s" : ""} submitted</span>
              {" — "}{alertOrders.map(o => o.ref).join(", ")}
            </p>
            <button
              onClick={() => {
                setFilter("proof_submitted");
                setAlertOrders([]);
              }}
              className="text-[#f59e0b] text-xs font-semibold hover:text-white transition-colors shrink-0">
              View
            </button>
            <button onClick={() => setAlertOrders([])} className="text-[#f59e0b]/50 hover:text-[#f59e0b] transition-colors">
              <X size={14} />
            </button>
          </div>
        )}

        {/* Bulk action bar */}
        {selectedIds.size > 0 && (
          <div className="bg-[#1a1a1a] border border-[#D4AF37]/30 rounded-xl px-4 py-3 mb-3 flex items-center gap-2 flex-wrap">
            <span className="text-white text-sm font-semibold mr-1">{selectedIds.size} selected</span>
            <button
              onClick={() => bulkUpdateStatus("shipped")}
              disabled={bulkUpdating}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-50 transition-opacity"
              style={{ background: "#3b82f620", color: "#3b82f6", border: "1px solid #3b82f640" }}>
              {bulkUpdating ? "…" : "Mark Shipped"}
            </button>
            <button
              onClick={() => bulkUpdateStatus("delivered")}
              disabled={bulkUpdating}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-50 transition-opacity"
              style={{ background: "#D4AF3720", color: "#D4AF37", border: "1px solid #D4AF3740" }}>
              {bulkUpdating ? "…" : "Mark Delivered"}
            </button>
            <button
              onClick={() => exportCSV([...selectedIds].map(id => orders.find(o => o.id === id)!).filter(Boolean))}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold"
              style={{ background: "#10b98120", color: "#10b981", border: "1px solid #10b98140" }}>
              Export Selected
            </button>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="ml-auto text-gray-500 hover:text-white transition-colors">
              <X size={15} />
            </button>
          </div>
        )}

        {/* Mobile back */}
        {showDetail && selected && (
          <button onClick={() => setShowDetail(false)}
            className="flex xl:hidden items-center gap-1.5 text-gray-400 hover:text-white text-sm mb-4">
            <ArrowLeft size={15} /> Back to list
          </button>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

          {/* Order list */}
          <div className={`xl:col-span-1 space-y-2.5 ${showDetail && selected ? "hidden xl:block" : "block"}`}>

            {/* Select all row */}
            {!loading && visible.length > 0 && (
              <div className="flex items-center gap-2 px-1 pb-1">
                <input
                  type="checkbox"
                  checked={allVisibleSelected}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 accent-[#D4AF37] cursor-pointer"
                />
                <span className="text-gray-500 text-xs">Select all ({visible.length})</span>
              </div>
            )}

            {loading ? (
              <p className="text-gray-500 text-sm py-10 text-center">Loading…</p>
            ) : visible.length === 0 ? (
              <p className="text-gray-500 text-sm py-10 text-center">No orders found</p>
            ) : visible.map(order => {
              const cfg    = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending;
              const isChecked = selectedIds.has(order.id);
              return (
                <div
                  key={order.id}
                  onClick={() => selectOrder(order)}
                  className="w-full text-left bg-[#111111] border rounded-xl p-4 transition-colors hover:border-[#2a2a2a] cursor-pointer"
                  style={{ borderColor: selected?.id === order.id ? "#D4AF37" : isChecked ? "#D4AF3766" : "#1F1F1F" }}>
                  <div className="flex items-start gap-3">
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onClick={e => toggleSelect(order.id, e)}
                      onChange={() => {}}
                      className="mt-0.5 w-4 h-4 accent-[#D4AF37] cursor-pointer shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[#D4AF37] font-bold text-sm">{order.ref}</span>
                        <div className="flex items-center gap-1.5">
                          {/* Proof indicator */}
                          {order.proof_url && (
                            <Camera size={11} className="text-[#10b981]" />
                          )}
                          <span className="flex items-center gap-1 text-xs" style={{ color: cfg.color }}>
                            {cfg.icon} {cfg.label}
                          </span>
                        </div>
                      </div>
                      <p className="text-white text-sm font-medium truncate">{order.name}</p>
                      <p className="text-gray-500 text-xs truncate">{order.email}</p>
                      <div className="flex justify-between mt-2">
                        <span className="text-xs text-gray-600">
                          {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                          {" · "}{new Date(order.createdAt).toLocaleDateString("en-ZA")}
                        </span>
                        <span className="text-sm font-bold text-white">R {order.total.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order detail */}
          <div className={`xl:col-span-2 ${showDetail && selected ? "block" : "hidden xl:block"}`}>
            {!selected ? (
              <div className="bg-[#111111] border border-[#1F1F1F] rounded-2xl p-12 text-center">
                <p className="text-gray-500">Select an order to view details</p>
              </div>
            ) : (
              <div className="bg-[#111111] border border-[#1F1F1F] rounded-2xl p-4 sm:p-6 space-y-5">

                {/* Order header */}
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <p className="text-[#D4AF37] font-bold text-lg">{selected.ref}</p>
                    <p className="text-gray-500 text-xs mt-0.5">{new Date(selected.createdAt).toLocaleString("en-ZA")}</p>
                    {selected.payment_method && (
                      <p className="text-gray-600 text-xs mt-0.5 capitalize">
                        Payment: {selected.payment_method.replace(/_/g, " ")}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {selected.bank_id && BANK_LABELS[selected.bank_id] && (
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold"
                        style={{
                          color: BANK_LABELS[selected.bank_id].color,
                          background: BANK_LABELS[selected.bank_id].color + "18",
                          border: `1px solid ${BANK_LABELS[selected.bank_id].color}44`,
                        }}>
                        {BANK_LABELS[selected.bank_id].label}
                      </span>
                    )}
                    <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
                      style={{
                        color: STATUS_CONFIG[selected.status]?.color,
                        background: (STATUS_CONFIG[selected.status]?.color ?? "#6b7280") + "18",
                        border: `1px solid ${(STATUS_CONFIG[selected.status]?.color ?? "#6b7280")}44`,
                      }}>
                      {STATUS_CONFIG[selected.status]?.icon}
                      {STATUS_CONFIG[selected.status]?.label ?? selected.status}
                    </span>
                  </div>
                </div>

                {/* Customer info */}
                <div className="bg-[#0f0f0f] rounded-xl p-4 space-y-3">
                  {([
                    ["Customer", selected.name,    "name"],
                    ["Email",    selected.email,   "email"],
                    ["Phone",    selected.phone,   "phone"],
                    ["Address",  selected.address || "Not provided", "address"],
                  ] as [string, string, string][]).map(([label, value, key]) => (
                    <div key={label} className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-0.5">{label}</p>
                        <p className="text-sm text-white break-words">{value}</p>
                      </div>
                      <div className="flex gap-1.5 shrink-0 mt-3">
                        <button
                          onClick={() => copyField(value, key)}
                          title={`Copy ${label}`}
                          className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-colors">
                          {copied === key
                            ? <CheckCircle size={13} color="#22c55e" />
                            : <Copy size={13} />}
                        </button>
                        {label === "Phone" && selected.phone && (
                          <a
                            href={`https://wa.me/${toWaPhone(selected.phone)}?text=${encodeURIComponent(`Hi ${selected.name.split(" ")[0]}, this is Bevanssons regarding your order ${selected.ref}.`)}`}
                            target="_blank" rel="noopener noreferrer"
                            title="Open WhatsApp"
                            className="p-1.5 rounded-lg text-gray-500 hover:text-[#25D366] hover:bg-[#25D366]/10 transition-colors">
                            <MessageCircle size={13} />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* WhatsApp quick action */}
                <a
                  href={`https://wa.me/${toWaPhone(selected.phone)}?text=${encodeURIComponent(`Hi ${selected.name.split(" ")[0]}, this is Bevanssons regarding your order ${selected.ref}. `)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold transition-colors"
                  style={{ background: "#25D36620", color: "#25D366", border: "1px solid #25D36640" }}>
                  <MessageCircle size={15} /> WhatsApp {selected.name.split(" ")[0]}
                </a>

                {/* Items */}
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-3">Order Items</p>
                  <div className="space-y-3">
                    {selected.items.map((item, i) => (
                      <div key={i} className="flex items-center gap-3">
                        {item.imageUrl && (
                          <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-[#1a1a1a] shrink-0">
                            <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white truncate">{item.name}</p>
                          <p className="text-xs text-gray-500">× {item.qty}</p>
                        </div>
                        <p className="text-sm font-bold text-[#D4AF37] shrink-0">
                          R {(parseFloat(String(item.price).replace(/[^0-9.]/g, "")) * item.qty).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between mt-4 pt-3 border-t border-[#1F1F1F]">
                    <span className="text-gray-400 text-sm">Total</span>
                    <span className="text-white font-bold text-lg">R {selected.total.toLocaleString()}</span>
                  </div>
                </div>

                {/* EFT reference */}
                {selected.eft_reference && (
                  <div className="bg-[#0f0f0f] rounded-xl p-4">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">EFT Reference</p>
                    <p className="text-white text-sm font-mono">{selected.eft_reference}</p>
                  </div>
                )}

                {/* Tracking number */}
                <div>
                  <label className="text-[10px] text-gray-500 uppercase tracking-wider block mb-2">
                    Courier Tracking Number
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={tracking}
                      onChange={e => setTracking(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && saveTracking()}
                      placeholder="e.g. CL123456789ZA"
                      className="flex-1 bg-[#0A0A0A] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-600 font-mono focus:outline-none focus:border-[#D4AF37]/50 transition-colors"
                    />
                    <button
                      onClick={saveTracking}
                      disabled={savingTracking || tracking === (selected.tracking_number ?? "")}
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-40 transition-opacity"
                      style={{ background: "#3b82f620", color: "#3b82f6", border: "1px solid #3b82f640" }}>
                      <Save size={13} /> {savingTracking ? "Saving…" : "Save"}
                    </button>
                  </div>
                  {selected.tracking_number && (
                    <p className="text-xs text-gray-500 mt-1.5 font-mono">Saved: {selected.tracking_number}</p>
                  )}
                </div>

                {/* Proof of payment */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">Proof of Payment</p>
                    {/* Admin upload/replace */}
                    <button
                      onClick={() => proofInputRef.current?.click()}
                      disabled={uploadingProof}
                      className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg disabled:opacity-50 transition-colors"
                      style={{ background: "#1F1F1F", color: "#9ca3af" }}>
                      <Upload size={11} />
                      {uploadingProof ? "Uploading…" : selected.proof_url ? "Replace Proof" : "Upload Proof"}
                    </button>
                    <input
                      ref={proofInputRef}
                      type="file"
                      accept="image/*,.pdf"
                      className="hidden"
                      onChange={handleProofUpload}
                    />
                  </div>

                  {selected.proof_url ? (
                    selected.proof_url.match(/\.pdf$/i) ? (
                      <button
                        onClick={() => setLightboxUrl(selected.proof_url!)}
                        className="text-[#D4AF37] text-sm underline">
                        View PDF proof ↗
                      </button>
                    ) : (
                      <button
                        onClick={() => setLightboxUrl(selected.proof_url!)}
                        className="block w-full group">
                        <div className="relative h-48 rounded-xl overflow-hidden border border-[#1F1F1F] group-hover:border-[#D4AF37]/40 transition-colors">
                          <Image src={selected.proof_url} alt="Proof" fill className="object-contain" />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 flex items-center justify-center transition-all">
                            <span className="opacity-0 group-hover:opacity-100 text-white text-xs font-semibold bg-black/60 px-3 py-1.5 rounded-full transition-opacity">
                              View full size
                            </span>
                          </div>
                        </div>
                      </button>
                    )
                  ) : (
                    <div className="h-24 rounded-xl border border-dashed border-[#2a2a2a] flex items-center justify-center">
                      <p className="text-gray-600 text-sm">No proof uploaded</p>
                    </div>
                  )}
                </div>

                {/* Admin notes */}
                <div>
                  <label className="text-[10px] text-gray-500 uppercase tracking-wider block mb-2">Admin Notes</label>
                  <textarea value={notes} onChange={e => setNotes(e.target.value)}
                    rows={2} placeholder="Add internal notes…"
                    className="w-full bg-[#0A0A0A] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 resize-none focus:outline-none focus:border-[#D4AF37]/50 transition-colors" />
                </div>

                {/* Send customer update */}
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-3">Send Customer Update</p>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {NOTIFY_TEMPLATES.map(t => (
                      <button
                        key={t.id}
                        onClick={() => {
                          setNotifyTemplate(t.id);
                          if (notifyTemplate !== t.id) setNotifyMessage(t.default);
                        }}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                        style={notifyTemplate === t.id
                          ? { background: t.color, color: "#000" }
                          : { background: t.color + "20", color: t.color, border: `1px solid ${t.color}40` }}>
                        {t.label}
                      </button>
                    ))}
                  </div>
                  {notifyTemplate && (
                    <div className="space-y-2">
                      <textarea
                        value={notifyMessage}
                        onChange={e => setNotifyMessage(e.target.value)}
                        rows={3}
                        placeholder="Message to customer…"
                        className="w-full bg-[#0A0A0A] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 resize-none focus:outline-none focus:border-[#D4AF37]/50 transition-colors"
                      />
                      <button
                        onClick={sendNotify}
                        disabled={sendingNotify || !notifyMessage.trim()}
                        className="w-full py-2.5 rounded-xl text-sm font-semibold disabled:opacity-40 transition-all"
                        style={{
                          background: notifySent ? "#10b98120" : "#D4AF3720",
                          color: notifySent ? "#10b981" : "#D4AF37",
                          border: `1px solid ${notifySent ? "#10b98140" : "#D4AF3740"}`,
                        }}>
                        {sendingNotify ? "Sending…" : notifySent ? "✓ Email Sent!" : "Send Update Email"}
                      </button>
                    </div>
                  )}
                </div>

                {/* Status actions */}
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-3">Update Status</p>
                  <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
                    {[
                      { status: "approved",  label: "Approve",        color: "#10b981" },
                      { status: "rejected",  label: "Reject",         color: "#ef4444" },
                      { status: "shipped",   label: "Mark Shipped",   color: "#3b82f6" },
                      { status: "delivered", label: "Mark Delivered", color: "#D4AF37" },
                    ].map(({ status, label, color }) => (
                      <button key={status}
                        onClick={() => updateStatus(selected.id, status)}
                        disabled={updating || selected.status === status}
                        className="px-4 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-40 transition-opacity"
                        style={{ background: color + "20", color, border: `1px solid ${color}40` }}>
                        {updating ? "…" : label}
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
