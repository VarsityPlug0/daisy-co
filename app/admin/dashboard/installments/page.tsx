"use client";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, RefreshCw, ChevronDown, ChevronUp, MessageCircle, Plus, Save, Mail } from "lucide-react";
import Link from "next/link";

interface Application {
  id: string; ref: string;
  product_name: string; product_price: number; product_imageUrl: string | null;
  term_months: number; monthly_payment: number; deposit: number; total_repayable: number;
  name: string; phone: string; email: string; id_number: string; address: string;
  status: string; whatsapp_clicked: number; admin_notes: string | null;
  createdAt: string;
}

interface Product { id: string; name: string; price: string; }

const PIPELINE = ["new", "reviewing", "approved", "awaiting_payment", "active", "completed"] as const;

const STATUSES = [...PIPELINE, "declined"] as string[];

const STATUS_STYLE: Record<string, string> = {
  new:              "bg-blue-500/10 text-blue-400 border-blue-500/30",
  reviewing:        "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
  approved:         "bg-green-500/10 text-green-400 border-green-500/30",
  awaiting_payment: "bg-orange-500/10 text-orange-400 border-orange-500/30",
  active:           "bg-[#D4AF37]/10 text-[#D4AF37] border-[#D4AF37]/30",
  completed:        "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  declined:         "bg-red-500/10 text-red-400 border-red-500/30",
};

const STATUS_LABEL: Record<string, string> = {
  new: "New", reviewing: "Reviewing", approved: "Approved",
  awaiting_payment: "Awaiting Payment", active: "Active",
  completed: "Completed", declined: "Declined",
};

const PIPELINE_LABEL: Record<string, string> = {
  new: "Received", reviewing: "Reviewing", approved: "Approved",
  awaiting_payment: "Awaiting Payment", active: "Active", completed: "Completed",
};

export default function AdminInstallmentsPage() {
  const [tab, setTab] = useState<"applications" | "settings">("applications");
  const [applications, setApplications] = useState<Application[]>([]);
  const [stats, setStats] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");

  // Settings tab
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [settingsForm, setSettingsForm] = useState({
    min_deposit_pct: 10,
    eligible_terms: [6, 12, 18, 24] as number[],
    monthly_rate: 0,
    admin_fee: 0,
    active: true,
  });
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/installments");
    if (res.ok) {
      const d = await res.json();
      setApplications(d.applications);
      setStats(d.stats);
    }
    setLoading(false);
  }, []);

  const fetchProducts = useCallback(async () => {
    const res = await fetch("/api/admin/products");
    if (res.ok) setProducts(await res.json());
  }, []);

  useEffect(() => {
    if (tab === "applications") fetchApplications();
    else fetchProducts();
  }, [tab, fetchApplications, fetchProducts]);

  async function updateStatus(id: string, status: string, notes?: string) {
    setUpdating(id);
    await fetch(`/api/admin/installments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, admin_notes: notes }),
    });
    await fetchApplications();
    setUpdating(null);
  }

  async function resendInvoice(id: string) {
    setUpdating(id + "_email");
    await fetch(`/api/admin/installments/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "resend_invoice" }),
    });
    setUpdating(null);
  }

  function waLink(app: Application) {
    const num = app.phone.replace(/[\s\-()]/g, "").replace(/^0/, "27");
    const fmt = (n: number) => `R ${Number(n).toLocaleString("en-ZA")}`;
    const messages: Record<string, string> = {
      new: `Hi ${app.name.split(" ")[0]}, this is Daisy Gadgets Co. We've received your installment application ${app.ref} for the ${app.product_name}. We're reviewing it and will be in touch shortly.`,
      reviewing: `Hi ${app.name.split(" ")[0]}, we're currently reviewing your installment application ${app.ref} for the ${app.product_name}. Could you confirm your ID number and address for verification?`,
      approved: `Hi ${app.name.split(" ")[0]}, great news! 🎉 Your installment application ${app.ref} for the ${app.product_name} has been APPROVED! Your deposit of ${fmt(app.deposit)} gets your plan started. Check your email for full payment details, or reply here and I'll send the bank details.`,
      awaiting_payment: `Hi ${app.name.split(" ")[0]}, we're waiting for your deposit of ${fmt(app.deposit)} to activate your installment plan for the ${app.product_name}. Please make the payment to our account and send proof of payment here. Reference: ${app.ref}`,
      active: `Hi ${app.name.split(" ")[0]}, your installment plan for the ${app.product_name} is active. Your monthly payment is ${fmt(app.monthly_payment)}. Please ensure payments are made on time. Reference: ${app.ref}`,
      completed: `Hi ${app.name.split(" ")[0]}, congratulations! 🎉 Your installment plan ${app.ref} for the ${app.product_name} is fully paid off. Thank you for choosing Daisy Gadgets Co.!`,
      declined: `Hi ${app.name.split(" ")[0]}, unfortunately your installment application ${app.ref} for the ${app.product_name} was not approved at this time. Please contact us if you'd like to discuss alternatives or other payment options.`,
    };
    const text = messages[app.status] ?? `Hi ${app.name.split(" ")[0]}, this is Daisy Gadgets Co. regarding your installment application ${app.ref} for the ${app.product_name}.`;
    return `https://wa.me/${num}?text=${encodeURIComponent(text)}`;
  }

  async function loadSettings(product: Product) {
    setSelectedProduct(product);
    const res = await fetch(`/api/admin/installments/settings/${product.id}`);
    if (res.ok) {
      const s = await res.json();
      if (s) {
        setSettingsForm({
          min_deposit_pct: s.min_deposit_pct,
          eligible_terms: s.eligible_terms,
          monthly_rate: s.monthly_rate,
          admin_fee: s.admin_fee,
          active: s.active,
        });
      } else {
        setSettingsForm({ min_deposit_pct: 10, eligible_terms: [6, 12, 18, 24], monthly_rate: 0, admin_fee: 0, active: true });
      }
    }
  }

  async function saveSettings() {
    if (!selectedProduct) return;
    setSavingSettings(true);
    await fetch(`/api/admin/installments/settings/${selectedProduct.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settingsForm),
    });
    setSavingSettings(false);
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2000);
  }

  function toggleTerm(t: number) {
    setSettingsForm(f => ({
      ...f,
      eligible_terms: f.eligible_terms.includes(t)
        ? f.eligible_terms.filter(x => x !== t)
        : [...f.eligible_terms, t].sort((a, b) => a - b),
    }));
  }

  const filtered = statusFilter === "all" ? applications : applications.filter(a => a.status === statusFilter);

  const inputClass = "bg-[#0A0A0A] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#D4AF37] w-full";

  return (
    <div className="min-h-screen p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/admin/dashboard" className="text-gray-400 hover:text-white">
            <ArrowLeft size={20} />
          </Link>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-white">Installment Applications</h1>
            <p className="text-gray-500 text-sm">Manage applications and configure eligible products</p>
          </div>
        </div>

        {/* Analytics strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Applications", value: applications.length },
            { label: "Eligibility Clicks", value: stats.eligibility_clicked ?? 0 },
            { label: "WhatsApp Clicks", value: stats.whatsapp_clicked ?? 0 },
            { label: "Abandoned", value: stats.abandoned ?? 0 },
          ].map(({ label, value }) => (
            <div key={label} className="bg-[#111111] border border-[#1F1F1F] rounded-xl p-4 text-center">
              <p className="text-[#D4AF37] text-xl font-black">{value}</p>
              <p className="text-gray-500 text-xs mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-5">
          {(["applications", "settings"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors capitalize ${
                tab === t ? "bg-[#D4AF37] text-black" : "bg-[#111111] border border-[#1F1F1F] text-gray-400 hover:text-white"
              }`}>
              {t === "settings" ? "Product Settings" : "Applications"}
            </button>
          ))}
          {tab === "applications" && (
            <button onClick={fetchApplications}
              className="ml-auto flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#111111] border border-[#1F1F1F] text-gray-400 hover:text-white text-sm">
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
            </button>
          )}
        </div>

        {/* ── Applications tab ── */}
        {tab === "applications" && (
          <>
            {/* Status filter */}
            <div className="flex flex-wrap gap-2 mb-4">
              {["all", ...STATUSES].map(s => (
                <button key={s} onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    statusFilter === s
                      ? "bg-[#D4AF37] text-black"
                      : "bg-[#111111] border border-[#1F1F1F] text-gray-400 hover:text-white"
                  }`}>
                  {s === "all" ? "All" : STATUS_LABEL[s]}
                  {s !== "all" && (
                    <span className="ml-1.5 opacity-60">
                      {applications.filter(a => a.status === s).length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {filtered.length === 0 && !loading && (
                <div className="bg-[#111111] border border-[#1F1F1F] rounded-2xl p-10 text-center text-gray-500">
                  No applications yet.
                </div>
              )}
              {filtered.map(app => (
                <div key={app.id} className="bg-[#111111] border border-[#1F1F1F] rounded-2xl overflow-hidden">
                  {/* Row */}
                  <div className="p-5 flex flex-wrap gap-4 justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1 flex-wrap">
                        <p className="text-white font-semibold">{app.name}</p>
                        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${STATUS_STYLE[app.status]}`}>
                          {STATUS_LABEL[app.status]}
                        </span>
                        {app.whatsapp_clicked === 1 && (
                          <span className="text-xs text-green-400 flex items-center gap-1">
                            <MessageCircle size={11} /> WhatsApp clicked
                          </span>
                        )}
                      </div>
                      <p className="text-gray-500 text-xs font-mono">{app.ref} · {new Date(app.createdAt).toLocaleDateString("en-ZA")}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[#D4AF37] font-bold">R {Number(app.monthly_payment).toLocaleString("en-ZA")}/mo</p>
                      <p className="text-gray-500 text-xs">{app.term_months} months · R{Number(app.product_price).toLocaleString("en-ZA")}</p>
                    </div>
                    <button onClick={() => setExpanded(e => e === app.id ? null : app.id)}
                      className="text-gray-400 hover:text-white p-1">
                      {expanded === app.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>

                  {/* Expanded detail */}
                  {expanded === app.id && (
                    <div className="border-t border-[#1F1F1F] p-5 space-y-4">

                      {/* Product image + summary */}
                      {app.product_imageUrl && (
                        <div className="flex items-center gap-4 bg-[#0A0A0A] border border-[#1F1F1F] rounded-xl p-3">
                          <img
                            src={app.product_imageUrl}
                            alt={app.product_name}
                            className="w-16 h-16 rounded-lg object-cover shrink-0 border border-[#1F1F1F]"
                          />
                          <div className="min-w-0">
                            <p className="text-white font-semibold text-sm leading-snug truncate">{app.product_name}</p>
                            <p className="text-[#D4AF37] font-bold text-sm mt-0.5">R {Number(app.product_price).toLocaleString("en-ZA")}</p>
                            <p className="text-gray-500 text-xs mt-0.5">{app.term_months} months · R {Number(app.monthly_payment).toLocaleString("en-ZA")}/mo</p>
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                        {[
                          ["Product", app.product_name],
                          ["Phone", app.phone],
                          ["Email", app.email],
                          ["ID Number", app.id_number],
                          ["Address", app.address],
                          ["Deposit", `R ${Number(app.deposit).toLocaleString("en-ZA")}`],
                          ["Total Repayable", `R ${Number(app.total_repayable).toLocaleString("en-ZA")}`],
                          ["Application Date", new Date(app.createdAt).toLocaleDateString("en-ZA", { day: "numeric", month: "long", year: "numeric" })],
                        ].map(([label, value]) => (
                          <div key={label}>
                            <p className="text-gray-500 text-xs mb-0.5">{label}</p>
                            <p className="text-white text-sm">{value}</p>
                          </div>
                        ))}
                      </div>

                      {app.admin_notes && (
                        <div className="bg-[#0A0A0A] border border-[#1F1F1F] rounded-xl px-4 py-3">
                          <p className="text-gray-500 text-xs mb-0.5">Notes</p>
                          <p className="text-gray-300 text-sm">{app.admin_notes}</p>
                        </div>
                      )}

                      {/* ── Status pipeline stepper ── */}
                      <div className="bg-[#0A0A0A] border border-[#1F1F1F] rounded-2xl p-4">
                        <p className="text-gray-500 text-[10px] uppercase tracking-widest font-semibold mb-4">Application Progress</p>

                        {app.status === "declined" ? (
                          <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                            <div className="w-8 h-8 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center shrink-0">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                            </div>
                            <div>
                              <p className="text-red-400 font-semibold text-sm">Application Declined</p>
                              <p className="text-red-400/60 text-xs mt-0.5">This application has been closed.</p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center overflow-x-auto pb-1">
                            {PIPELINE.map((step, idx) => {
                              const currentIdx = PIPELINE.indexOf(app.status as typeof PIPELINE[number]);
                              const isPast    = idx < currentIdx;
                              const isCurrent = idx === currentIdx;
                              const isNext    = idx === currentIdx + 1;

                              return (
                                <div key={step} className="flex items-center shrink-0">
                                  {/* Connector line */}
                                  {idx > 0 && (
                                    <div className={`w-6 sm:w-10 h-px shrink-0 ${isPast ? "bg-green-500" : "bg-[#2a2a2a]"}`} />
                                  )}

                                  <div className="flex flex-col items-center gap-1.5">
                                    {/* Circle */}
                                    {isNext ? (
                                      <button
                                        onClick={() => updateStatus(app.id, step)}
                                        disabled={!!updating}
                                        title={`Advance to ${STATUS_LABEL[step]}`}
                                        className="w-9 h-9 rounded-full border-2 border-[#D4AF37] bg-[#D4AF37]/10 text-[#D4AF37] flex items-center justify-center font-bold text-xs hover:bg-[#D4AF37]/25 transition-all disabled:opacity-50 ring-2 ring-[#D4AF37]/20 ring-offset-1 ring-offset-[#0A0A0A]"
                                      >
                                        {updating === app.id ? (
                                          <svg className="animate-spin" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" opacity=".2"/><path d="M21 12a9 9 0 00-9-9"/></svg>
                                        ) : (
                                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9,18 15,12 9,6"/></svg>
                                        )}
                                      </button>
                                    ) : (
                                      <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs
                                        ${isPast    ? "bg-green-500 text-white" :
                                          isCurrent ? "bg-[#D4AF37] text-black" :
                                                      "bg-[#1A1A1A] border border-[#2a2a2a] text-gray-600"}`}>
                                        {isPast ? (
                                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20,6 9,17 4,12"/></svg>
                                        ) : (
                                          <span>{idx + 1}</span>
                                        )}
                                      </div>
                                    )}

                                    {/* Label */}
                                    <span className={`text-[9px] text-center leading-tight max-w-[52px] font-medium
                                      ${isPast ? "text-green-400" : isCurrent ? "text-[#D4AF37]" : isNext ? "text-gray-300" : "text-gray-600"}`}>
                                      {PIPELINE_LABEL[step]}
                                    </span>

                                    {/* Next step indicator */}
                                    {isNext && (
                                      <span className="text-[8px] text-[#D4AF37]/70 font-bold tracking-wide">NEXT</span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Decline button — only when not terminal */}
                        {app.status !== "completed" && app.status !== "declined" && (
                          <div className="mt-4 pt-3 border-t border-[#1F1F1F]">
                            <button
                              onClick={() => updateStatus(app.id, "declined")}
                              disabled={!!updating}
                              className="text-xs text-red-400/70 hover:text-red-400 transition-colors disabled:opacity-50 flex items-center gap-1.5"
                            >
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                              Decline this application
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex flex-wrap gap-2">
                        <a href={waLink(app)}
                          target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg border border-green-500/30 bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-colors">
                          <MessageCircle size={13} /> WhatsApp Customer
                        </a>
                        {(app.status === "approved" || app.status === "awaiting_payment" || app.status === "active") && (
                          <button
                            onClick={() => resendInvoice(app.id)}
                            disabled={updating === app.id + "_email"}
                            className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg border border-[#D4AF37]/30 bg-[#D4AF37]/10 text-[#D4AF37] hover:bg-[#D4AF37]/20 transition-colors disabled:opacity-50">
                            <Mail size={13} />
                            {updating === app.id + "_email" ? "Sending…" : "Resend Invoice Email"}
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── Settings tab ── */}
        {tab === "settings" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Product list */}
            <div>
              <p className="text-white font-semibold mb-3 text-sm">Select a product to configure</p>
              <div className="space-y-1.5 max-h-[600px] overflow-y-auto pr-1">
                {products.map((p: Product) => (
                  <button key={p.id} onClick={() => loadSettings(p)}
                    className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-colors ${
                      selectedProduct?.id === p.id
                        ? "border-[#D4AF37] bg-[#D4AF37]/5 text-white"
                        : "border-[#1F1F1F] bg-[#111111] text-gray-400 hover:text-white hover:border-[#2a2a2a]"
                    }`}>
                    <p className="font-medium truncate">{p.name}</p>
                    <p className="text-xs text-[#D4AF37]">{p.price}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Config form */}
            <div>
              {!selectedProduct ? (
                <div className="bg-[#111111] border border-[#1F1F1F] rounded-2xl p-10 text-center text-gray-500 flex flex-col items-center gap-3">
                  <Plus size={24} className="text-gray-700" />
                  <p className="text-sm">Select a product to enable installments</p>
                </div>
              ) : (
                <div className="bg-[#111111] border border-[#1F1F1F] rounded-2xl p-5 space-y-5">
                  <div>
                    <p className="text-white font-semibold mb-0.5">{selectedProduct.name}</p>
                    <p className="text-[#D4AF37] text-sm">{selectedProduct.price}</p>
                  </div>

                  {/* Enable toggle */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white text-sm font-medium">Enable Installments</p>
                      <p className="text-gray-500 text-xs">Show installment option on this product</p>
                    </div>
                    <button onClick={() => setSettingsForm(f => ({ ...f, active: !f.active }))}
                      className={`w-12 h-6 rounded-full transition-colors relative ${settingsForm.active ? "bg-[#D4AF37]" : "bg-[#2a2a2a]"}`}>
                      <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${settingsForm.active ? "left-7" : "left-1"}`} />
                    </button>
                  </div>

                  <div className="h-px bg-[#1F1F1F]" />

                  {/* Eligible terms */}
                  <div>
                    <p className="text-white text-sm font-medium mb-2">Eligible Terms</p>
                    <div className="flex gap-2">
                      {[3, 6, 12, 18, 24].map(t => (
                        <button key={t} onClick={() => toggleTerm(t)}
                          className={`flex-1 py-2.5 rounded-xl border text-sm font-semibold transition-colors ${
                            settingsForm.eligible_terms.includes(t)
                              ? "border-[#D4AF37] bg-[#D4AF37]/10 text-[#D4AF37]"
                              : "border-[#2a2a2a] text-gray-500 hover:border-[#D4AF37]/30"
                          }`}>
                          {t}mo
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Min deposit */}
                  <div>
                    <label className="block text-white text-sm font-medium mb-1.5">
                      Minimum Deposit (%)
                    </label>
                    <input type="number" className={inputClass} min="0" max="100"
                      value={settingsForm.min_deposit_pct}
                      onChange={e => setSettingsForm(f => ({ ...f, min_deposit_pct: Number(e.target.value) }))} />
                    {selectedProduct && (
                      <p className="text-gray-600 text-xs mt-1">
                        = R {Math.ceil(parseFloat(selectedProduct.price.replace(/[^0-9.]/g, "")) * settingsForm.min_deposit_pct / 100).toLocaleString("en-ZA")}
                      </p>
                    )}
                  </div>

                  {/* Monthly rate */}
                  <div>
                    <label className="block text-white text-sm font-medium mb-1.5">
                      Monthly Interest Rate (%)
                    </label>
                    <input type="number" className={inputClass} min="0" max="30" step="0.1"
                      value={(settingsForm.monthly_rate * 100).toFixed(1)}
                      onChange={e => setSettingsForm(f => ({ ...f, monthly_rate: Number(e.target.value) / 100 }))} />
                    <p className="text-gray-600 text-xs mt-1">
                      {settingsForm.monthly_rate === 0 ? "Interest-free" : `${(settingsForm.monthly_rate * 100).toFixed(1)}% per month`}
                    </p>
                  </div>

                  {/* Admin fee */}
                  <div>
                    <label className="block text-white text-sm font-medium mb-1.5">
                      Admin / Service Fee (R)
                    </label>
                    <input type="number" className={inputClass} min="0"
                      value={settingsForm.admin_fee}
                      onChange={e => setSettingsForm(f => ({ ...f, admin_fee: Number(e.target.value) }))} />
                  </div>

                  <button onClick={saveSettings} disabled={savingSettings}
                    className="btn-gold w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50">
                    <Save size={15} />
                    {savingSettings ? "Saving…" : settingsSaved ? "Saved!" : "Save Settings"}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
