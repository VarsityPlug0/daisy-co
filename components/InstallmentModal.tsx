"use client";
import { useEffect, useRef, useState } from "react";
import { X, ChevronRight, ChevronLeft, Check, MessageCircle } from "lucide-react";

interface Settings {
  min_deposit_pct: number;
  eligible_terms: number[];
  monthly_rate: number;
  admin_fee: number;
}

interface Props {
  product: { id: string; name: string; price: string };
  settings: Settings;
  onClose: () => void;
}

function calcMonthly(price: number, deposit: number, term: number, rate: number, fee: number) {
  const financed = price - deposit + fee;
  if (rate === 0) {
    const monthly = Math.ceil((financed / term) * 100) / 100;
    return { monthly, total: deposit + monthly * term, interest: 0 };
  }
  const r = rate;
  const n = term;
  const monthly = Math.ceil(((financed * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)) * 100) / 100;
  const totalFinanced = monthly * n;
  return { monthly, total: deposit + totalFinanced, interest: Math.round((totalFinanced - financed) * 100) / 100 };
}

function track(event: string, extra?: Record<string, unknown>) {
  fetch("/api/installments/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ event, ...extra }),
  }).catch(() => {});
}

export default function InstallmentModal({ product, settings, onClose }: Props) {
  const price = parseFloat(product.price.replace(/[^0-9.]/g, "")) || 0;
  const deposit = Math.max(2000, Math.ceil(price * settings.min_deposit_pct / 100 * 100) / 100);
  const terms = settings.eligible_terms;

  const [step, setStep] = useState<1 | 2 | 3 | "success">(1);
  const [term, setTerm] = useState<number>(terms.includes(24) ? 24 : terms[terms.length - 1]);
  const [form, setForm] = useState({ name: "", phone: "", email: "", id_number: "", address: "" });
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ ref: string; phone: string } | null>(null);

  const overlayRef = useRef<HTMLDivElement>(null);

  // Close on overlay click
  function handleOverlayClick(e: React.MouseEvent) {
    if (e.target === overlayRef.current) {
      track("abandoned", { product_id: product.id, step });
      onClose();
    }
  }

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        track("abandoned", { product_id: product.id, step });
        onClose();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, product.id, step]);

  // Lock scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const { monthly, total, interest } = calcMonthly(price, deposit, term, settings.monthly_rate, settings.admin_fee);

  function handleTermChange(t: number) {
    setTerm(t);
    track("term_changed", { product_id: product.id, term_months: t });
  }

  function goStep2() {
    track("step1_complete", { product_id: product.id, term_months: term });
    setStep(2);
  }

  function goStep3() {
    track("step2_complete", { product_id: product.id, ref: undefined });
    setStep(3);
  }

  async function submit() {
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/installments/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: product.id,
          term_months: term,
          ...form,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Submission failed");
      setResult({ ref: data.ref, phone: form.phone });
      setStep("success");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass = "w-full bg-[#0A0A0A] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#D4AF37] transition-colors";
  const labelClass = "block text-xs text-gray-500 mb-1.5 font-medium uppercase tracking-wider";

  const canGoStep3 = form.name && form.phone && form.email && form.id_number && form.address && consent;

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="relative w-full sm:max-w-lg bg-[#111111] border border-[#1F1F1F] rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[85dvh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[#1F1F1F] shrink-0">
          <div>
            <p className="text-xs text-[#D4AF37] font-bold uppercase tracking-widest mb-0.5">Get It on Installments</p>
            <p className="text-white font-bold text-sm truncate max-w-[260px]">{product.name}</p>
          </div>
          <button onClick={() => { track("abandoned", { product_id: product.id, step }); onClose(); }}
            className="w-8 h-8 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center text-gray-400 hover:text-white transition-colors">
            <X size={14} />
          </button>
        </div>

        {/* Step indicator */}
        {step !== "success" && (
          <div className="flex items-center gap-2 px-6 pt-4 shrink-0">
            {([1, 2, 3] as const).map((s, i) => {
              const labels = ["Choose Plan", "Your Details", "Confirm"];
              const active = step === s;
              const done = typeof step === "number" && step > s;
              return (
                <div key={s} className="flex items-center gap-2 flex-1">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors shrink-0 ${
                    done ? "bg-[#D4AF37]/30 text-[#D4AF37]" :
                    active ? "bg-[#D4AF37] text-black" :
                    "bg-[#1a1a1a] text-gray-600"
                  }`}>
                    {done ? <Check size={11} /> : s}
                  </div>
                  <span className={`text-xs hidden sm:block ${active ? "text-white font-medium" : "text-gray-600"}`}>{labels[i]}</span>
                  {i < 2 && <div className="flex-1 h-px bg-[#1F1F1F] hidden sm:block" />}
                </div>
              );
            })}
          </div>
        )}

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5">

          {/* ── STEP 1: Choose Plan ── */}
          {step === 1 && (
            <div className="space-y-5">
              {/* Product summary */}
              <div className="bg-[#0A0A0A] border border-[#1F1F1F] rounded-2xl p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-gray-500 text-xs mb-1">Product</p>
                    <p className="text-white font-semibold text-sm">{product.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-500 text-xs mb-1">Cash Price</p>
                    <p className="text-[#D4AF37] font-bold">{product.price}</p>
                  </div>
                </div>
                {deposit > 0 && (
                  <div className="mt-3 pt-3 border-t border-[#1F1F1F]">
                    <p className="text-gray-500 text-xs">Min. Deposit</p>
                    <p className="text-white font-semibold text-sm">R {deposit.toLocaleString("en-ZA")}</p>
                  </div>
                )}
              </div>

              {/* Term selector */}
              <div>
                <p className={labelClass}>Choose your installment period</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {terms.map(t => {
                    const { monthly: m } = calcMonthly(price, deposit, t, settings.monthly_rate, settings.admin_fee);
                    const active = term === t;
                    return (
                      <button key={t} onClick={() => handleTermChange(t)}
                        className={`p-3 rounded-xl border text-center transition-all ${
                          active
                            ? "border-[#D4AF37] bg-[#D4AF37]/10"
                            : "border-[#2a2a2a] hover:border-[#D4AF37]/40 bg-[#0A0A0A]"
                        }`}>
                        <p className={`text-sm font-bold ${active ? "text-[#D4AF37]" : "text-white"}`}>{t} mo</p>
                        <p className={`text-xs mt-0.5 ${active ? "text-[#D4AF37]/70" : "text-gray-500"}`}>
                          R {m.toLocaleString("en-ZA")}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Monthly highlight */}
              <div className="bg-[#0A0A0A] border border-[#D4AF37]/20 rounded-2xl p-5 text-center">
                <p className="text-gray-500 text-xs mb-1">Your monthly payment</p>
                <p className="text-[#D4AF37] text-3xl sm:text-4xl font-black">R {monthly.toLocaleString("en-ZA")}</p>
                <p className="text-gray-600 text-xs mt-1">× {term} months</p>
                <div className="mt-3 pt-3 border-t border-[#1F1F1F] grid grid-cols-2 gap-3 text-center text-xs">
                  <div>
                    <p className="text-gray-600">Total repayable</p>
                    <p className="text-gray-300 font-semibold">R {total.toLocaleString("en-ZA")}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">{interest > 0 ? "Interest / fees" : "Interest"}</p>
                    <p className={interest > 0 ? "text-gray-300 font-semibold" : "text-green-400 font-semibold"}>
                      {interest > 0 ? `R ${interest.toLocaleString("en-ZA")}` : "Interest-free"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 2: Details ── */}
          {step === 2 && (
            <div className="space-y-4">
              {[
                { key: "name",      label: "Full Name",              type: "text",  placeholder: "John Smith" },
                { key: "phone",     label: "Phone / Mobile",         type: "tel",   placeholder: "082 000 0000" },
                { key: "email",     label: "Email Address",          type: "email", placeholder: "john@example.com" },
                { key: "id_number", label: "SA ID / Passport Number", type: "text", placeholder: "8001015009087" },
                { key: "address",   label: "Delivery Address",       type: "text",  placeholder: "123 Main St, Johannesburg" },
              ].map(({ key, label, type, placeholder }) => (
                <div key={key}>
                  <label className={labelClass}>{label}</label>
                  <input
                    type={type}
                    value={form[key as keyof typeof form]}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className={inputClass}
                  />
                </div>
              ))}

              {/* Consent */}
              <label className="flex items-start gap-3 cursor-pointer">
                <div onClick={() => setConsent(c => !c)}
                  className={`w-5 h-5 rounded border mt-0.5 shrink-0 flex items-center justify-center transition-colors ${
                    consent ? "bg-[#D4AF37] border-[#D4AF37]" : "border-[#2a2a2a] bg-[#0A0A0A]"
                  }`}>
                  {consent && <Check size={11} color="black" strokeWidth={3} />}
                </div>
                <p className="text-gray-500 text-xs leading-relaxed">
                  I consent to Daisy Gadgets Co. collecting and using my personal information to process this installment application and contact me by phone or email.
                </p>
              </label>
            </div>
          )}

          {/* ── STEP 3: Confirm ── */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="bg-[#0A0A0A] border border-[#1F1F1F] rounded-2xl divide-y divide-[#1F1F1F]">
                {[
                  ["Product",    product.name],
                  ["Cash Price", product.price],
                  ["Term",       `${term} months`],
                  ["Monthly",    `R ${monthly.toLocaleString("en-ZA")}`],
                  ["Deposit",    `R ${deposit.toLocaleString("en-ZA")}`],
                  ["Total Repayable", `R ${total.toLocaleString("en-ZA")}`],
                  ["Name",      form.name],
                  ["Phone",     form.phone],
                  ["Email",     form.email],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between items-center px-4 py-3">
                    <span className="text-gray-500 text-xs">{label}</span>
                    <span className="text-white text-sm font-semibold text-right max-w-[200px] truncate">{value}</span>
                  </div>
                ))}
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              <p className="text-center text-gray-600 text-xs">
                No credit bureau check. Our team will contact you by phone or email to finalise the agreement.
              </p>
            </div>
          )}

          {/* ── SUCCESS ── */}
          {step === "success" && result && (
            <div className="text-center py-4 space-y-5">
              <div className="w-16 h-16 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center mx-auto">
                <Check size={28} className="text-[#D4AF37]" />
              </div>
              <div>
                <h3 className="text-white text-xl font-black mb-2">Application Received!</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Your application has been submitted successfully. We&apos;ll contact you by phone or email to complete the process.
                </p>
              </div>
              <div className="bg-[#0A0A0A] border border-[#1F1F1F] rounded-xl p-4">
                <p className="text-gray-500 text-xs mb-1">Your Reference</p>
                <p className="text-[#D4AF37] text-xl font-mono font-black">{result.ref}</p>
              </div>
              <a
                href={`mailto:daisygadgetsco@gmail.com?subject=${encodeURIComponent(
                  `Installment application — ${result.ref}`
                )}&body=${encodeURIComponent(
                  `Hi Daisy Gadgets Co, I submitted an installment application for the ${product.name} (${term} months, R${monthly.toLocaleString("en-ZA")}/mo). Application Ref: ${result.ref}`
                )}`}
                onClick={() => track("whatsapp_clicked", { product_id: product.id, ref: result.ref })}
                className="w-full flex items-center justify-center gap-3 py-4 rounded-xl font-bold text-white text-base shadow-lg transition-transform active:scale-95"
                style={{ background: "#D4AF37", color: "#0A0A0A" }}
              >
                <MessageCircle size={20} />
                EMAIL US TO CONTINUE
              </a>
              <button onClick={onClose}
                className="w-full text-center text-gray-600 text-sm hover:text-gray-400 transition-colors py-2">
                Close
              </button>
            </div>
          )}
        </div>

        {/* Sticky footer — action buttons always visible */}
        {step !== "success" && (
          <div className="shrink-0 px-6 pt-4 pb-5 border-t border-[#1F1F1F] bg-[#111111]">
            {step === 1 && (
              <button onClick={goStep2}
                className="btn-gold w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2">
                Next — Enter Your Details <ChevronRight size={16} />
              </button>
            )}
            {step === 2 && (
              <div className="flex gap-3">
                <button onClick={() => setStep(1)}
                  className="flex items-center gap-1.5 px-4 py-3 rounded-xl border border-[#2a2a2a] text-gray-400 hover:text-white text-sm transition-colors">
                  <ChevronLeft size={14} /> Back
                </button>
                <button onClick={goStep3} disabled={!canGoStep3}
                  className="btn-gold flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-40">
                  Review Application <ChevronRight size={16} />
                </button>
              </div>
            )}
            {step === 3 && (
              <div className="flex gap-3">
                <button onClick={() => setStep(2)}
                  className="flex items-center gap-1.5 px-4 py-3 rounded-xl border border-[#2a2a2a] text-gray-400 hover:text-white text-sm transition-colors">
                  <ChevronLeft size={14} /> Back
                </button>
                <button onClick={submit} disabled={submitting}
                  className="btn-gold flex-1 py-3.5 rounded-xl font-bold text-sm disabled:opacity-50">
                  {submitting ? "Submitting…" : `APPLY FOR THIS ${product.name.split(" ")[0].toUpperCase()}`}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
