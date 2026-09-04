"use client";
import { useState } from "react";
import Link from "next/link";
import {
  Home, Building2, Briefcase, UtensilsCrossed, ShoppingBag, ChevronRight, ChevronLeft,
  Zap, BatteryCharging, TrendingDown, Shield, Check, Lightbulb, Tv, Wifi, Monitor,
  Thermometer, Wind, Flame, Waves, WashingMachine, Sun, ArrowRight, Phone,
} from "lucide-react";
import type { Metadata } from "next";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Appliance { id: string; label: string; icon: React.ReactNode; watts: number }
interface WizardAnswers {
  propertyType: string;
  monthlyBill: string;
  mainGoal: string;
  appliances: Record<string, number>;
  budget: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const PROPERTY_TYPES = [
  { id: "small-home",  label: "Small Home",     sub: "Apartment / 1–2 bedrooms", icon: <Home size={28} strokeWidth={1.5} /> },
  { id: "family-home", label: "Family Home",    sub: "3–4 bedrooms",              icon: <Home size={28} strokeWidth={1.5} /> },
  { id: "large-home",  label: "Large Home",     sub: "5+ bedrooms / townhouse",   icon: <Home size={28} strokeWidth={1.5} /> },
  { id: "business",    label: "Small Business", sub: "Factory / warehouse",       icon: <Briefcase size={28} strokeWidth={1.5} /> },
  { id: "office",      label: "Office",         sub: "Office / co-working space", icon: <Building2 size={28} strokeWidth={1.5} /> },
  { id: "restaurant",  label: "Restaurant",     sub: "Hospitality / kitchen",     icon: <UtensilsCrossed size={28} strokeWidth={1.5} /> },
  { id: "shop",        label: "Shop / Retail",  sub: "Store / shopping outlet",   icon: <ShoppingBag size={28} strokeWidth={1.5} /> },
  { id: "other",       label: "Other",          sub: "Something else",            icon: <Lightbulb size={28} strokeWidth={1.5} /> },
];

const MONTHLY_BILLS = [
  { id: "under-1k",  label: "Under R1,000",     sub: "Small usage" },
  { id: "1k-2k",     label: "R1,000 – R2,000",  sub: "Average household" },
  { id: "2k-5k",     label: "R2,000 – R5,000",  sub: "Higher usage" },
  { id: "over-5k",   label: "Over R5,000",       sub: "Very high / business" },
  { id: "unknown",   label: "I don't know",      sub: "That's okay" },
];

const MAIN_GOALS = [
  { id: "reduce-bill",     label: "Reduce My Electricity Bill",     sub: "Cut monthly Eskom costs",              icon: <TrendingDown size={24} strokeWidth={1.5} /> },
  { id: "load-shedding",   label: "Backup During Load-Shedding",    sub: "Stay powered during outages",          icon: <Zap size={24} strokeWidth={1.5} /> },
  { id: "essentials",      label: "Run Essential Appliances Only",  sub: "Fridge, lights, Wi-Fi, TV",           icon: <BatteryCharging size={24} strokeWidth={1.5} /> },
  { id: "independence",    label: "Full Energy Independence",        sub: "Minimal or zero Eskom dependency",    icon: <Sun size={24} strokeWidth={1.5} /> },
  { id: "business-cont",   label: "Business Continuity",            sub: "Keep operations running non-stop",    icon: <Shield size={24} strokeWidth={1.5} /> },
];

const APPLIANCES: Appliance[] = [
  { id: "fridge",    label: "Fridge",             watts: 150,  icon: <Thermometer size={22} strokeWidth={1.5} /> },
  { id: "tv",        label: "TV",                  watts: 100,  icon: <Tv size={22} strokeWidth={1.5} /> },
  { id: "lights",    label: "Lights (per room)",   watts: 15,   icon: <Lightbulb size={22} strokeWidth={1.5} /> },
  { id: "wifi",      label: "Wi-Fi Router",         watts: 15,   icon: <Wifi size={22} strokeWidth={1.5} /> },
  { id: "computer",  label: "Computer / Laptop",   watts: 150,  icon: <Monitor size={22} strokeWidth={1.5} /> },
  { id: "microwave", label: "Microwave",           watts: 1200, icon: <Flame size={22} strokeWidth={1.5} /> },
  { id: "washer",    label: "Washing Machine",     watts: 2000, icon: <WashingMachine size={22} strokeWidth={1.5} /> },
  { id: "stove",     label: "Electric Stove",      watts: 3000, icon: <Flame size={22} strokeWidth={1.5} /> },
  { id: "geyser",    label: "Geyser",              watts: 3000, icon: <Waves size={22} strokeWidth={1.5} /> },
  { id: "ac",        label: "Air Conditioner",     watts: 2000, icon: <Wind size={22} strokeWidth={1.5} /> },
  { id: "pool",      label: "Pool Pump",           watts: 750,  icon: <Waves size={22} strokeWidth={1.5} /> },
];

const BUDGETS = [
  { id: "under-50k",  label: "Under R50,000",        sub: "Inverter & battery system" },
  { id: "50-100k",    label: "R50,000 – R100,000",   sub: "Entry solar package" },
  { id: "100-200k",   label: "R100,000 – R200,000",  sub: "Premium solar package" },
  { id: "200k-plus",  label: "R200,000+",             sub: "Large system / commercial" },
  { id: "unsure",     label: "Help Me Decide",        sub: "Get a recommendation" },
];

// ─── Packages ─────────────────────────────────────────────────────────────────
const PACKAGES = {
  "inverter-only": {
    name: "Inverter & Battery System",
    badge: "Load-Shedding Ready",
    price: "From R18,000",
    priceNote: "Depending on system size",
    color: "#3B82F6",
    specs: ["5kVA Hybrid Inverter", "100Ah Lithium Battery", "8–12 hours backup", "Essential appliance protection"],
    included: ["Inverter unit", "Lithium battery", "Cabling & installation kit", "Monitoring display"],
    notIncluded: ["Solar panels (can be added later)", "Grid tie"],
    bestFor: "Apartments, small homes, and budget-conscious buyers needing protection from load-shedding without solar panels.",
    backupHours: "8–12 hours",
    warranty: "5-year inverter, 5-year battery",
    href: "/solar/inverters-batteries",
  },
  "essential-home": {
    name: "Essential Home Solar",
    badge: "Best Value",
    price: "R67,500",
    priceNote: "Installed nationwide",
    color: "#22c55e",
    specs: ["5kW Solar Inverter", "8 × 450W Solar Panels (3.6kWp)", "100Ah Lithium Battery", "Full installation kit"],
    included: ["Inverter", "8 solar panels", "Lithium battery", "Mounting structure", "Cabling", "Monitoring app"],
    notIncluded: ["Generator backup", "Three-phase connection"],
    bestFor: "2–3 bedroom homes looking to cut electricity bills and have backup during load-shedding.",
    backupHours: "6–10 hours",
    warranty: "5-year inverter, 25-year panel output, 5-year battery",
    href: "/solar/residential",
  },
  "premium-home": {
    name: "Premium Home Solar",
    badge: "Most Popular",
    price: "R98,000",
    priceNote: "Installed nationwide",
    color: "#D4AF37",
    specs: ["8kW Hybrid Solar Inverter", "16 × 450W Solar Panels (7.2kWp)", "200Ah Lithium Battery", "Smart monitoring included"],
    included: ["8kW inverter", "16 solar panels", "200Ah lithium battery", "Mounting structure", "Full cabling", "Smart monitoring portal", "Warranty support"],
    notIncluded: ["Geyser solar diversion (add-on)", "Three-phase upgrade"],
    bestFor: "3–5 bedroom family homes needing full coverage including high-draw appliances like geysers.",
    backupHours: "12–18 hours",
    warranty: "10-year inverter, 25-year panel output, 10-year battery",
    href: "/solar/residential",
  },
  "business-home-pro": {
    name: "Business Home Pro",
    badge: "Maximum Power",
    price: "R264,000",
    priceNote: "Installed nationwide",
    color: "#A855F7",
    specs: ["20kW Three-phase Hybrid Inverter", "36 × 550W Solar Panels (19.8kWp)", "2 × 200Ah Lithium Batteries", "Smart energy management system"],
    included: ["20kW inverter", "36 solar panels", "400Ah lithium storage", "Energy management system", "Priority technical support", "Full installation"],
    notIncluded: ["Site assessment (required — included in process)"],
    bestFor: "Large homes, small businesses, and properties needing complete energy independence and high power output.",
    backupHours: "18–24+ hours",
    warranty: "10-year inverter, 25-year panel output, 10-year battery",
    href: "/solar/residential",
  },
  "commercial": {
    name: "Commercial Solar System",
    badge: "Custom Quote",
    price: "From R198,400",
    priceNote: "Custom to your business needs",
    color: "#F97316",
    specs: ["Custom inverter sizing", "Tailored panel configuration", "Commercial battery banks", "Professional site assessment included"],
    included: ["Site assessment", "Custom system design", "Commercial-grade components", "Installation", "After-sales support"],
    notIncluded: ["Cannot be standardised — requires site assessment"],
    bestFor: "Offices, shops, restaurants, and factories needing a system tailored to their exact energy consumption and layout.",
    backupHours: "Custom to your needs",
    warranty: "Commercial warranty — confirmed per system",
    href: "/solar/commercial",
  },
};

type PackageId = keyof typeof PACKAGES;

// ─── Recommendation Logic ──────────────────────────────────────────────────────
function recommend(answers: WizardAnswers): PackageId {
  const { propertyType, budget, appliances } = answers;

  if (["business", "office", "restaurant", "shop"].includes(propertyType)) return "commercial";
  if (budget === "under-50k") return "inverter-only";

  const load = Object.entries(appliances).reduce((sum, [id, qty]) => {
    const a = APPLIANCES.find((x) => x.id === id);
    return sum + (a?.watts ?? 0) * qty;
  }, 0);

  if (budget === "200k-plus" || propertyType === "large-home" || load > 8000) return "business-home-pro";
  if (budget === "100-200k" || propertyType === "family-home" || load > 3000) return "premium-home";
  if (budget === "50-100k" || propertyType === "small-home" || load > 500) return "essential-home";
  return "premium-home";
}

function propertyLabel(id: string) {
  return PROPERTY_TYPES.find((p) => p.id === id)?.label ?? id;
}
function goalLabel(id: string) {
  return MAIN_GOALS.find((g) => g.id === id)?.label ?? id;
}
function budgetLabel(id: string) {
  return BUDGETS.find((b) => b.id === id)?.label ?? id;
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function SelectCard({
  selected, onClick, children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left rounded-2xl border transition-all duration-150 p-4"
      style={{
        background: selected ? "rgba(212,175,55,0.08)" : "#111111",
        borderColor: selected ? "#D4AF37" : "#1F1F1F",
        boxShadow: selected ? "0 0 0 1px #D4AF37, 0 4px 20px rgba(212,175,55,0.12)" : "none",
      }}
    >
      {children}
    </button>
  );
}

function ProgressBar({ step, total }: { step: number; total: number }) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-gray-500 uppercase tracking-widest font-medium">Step {step} of {total}</p>
        <p className="text-xs text-gray-600">{Math.round((step / total) * 100)}% complete</p>
      </div>
      <div className="h-1 bg-[#1a1a1a] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${(step / total) * 100}%`, background: "linear-gradient(90deg, #D4AF37, #F0CE6A)" }}
        />
      </div>
    </div>
  );
}

function NavButtons({
  step, total, onBack, onNext, nextLabel = "Continue", nextDisabled = false,
}: {
  step: number; total: number; onBack: () => void; onNext: () => void;
  nextLabel?: string; nextDisabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between mt-5 pt-4 border-t border-[#1A1A1A]">
      {step > 1 ? (
        <button type="button" onClick={onBack}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-medium">
          <ChevronLeft size={16} /> Back
        </button>
      ) : (
        <div />
      )}
      <button
        type="button"
        onClick={onNext}
        disabled={nextDisabled}
        className="btn-gold px-8 py-3 rounded-xl text-sm font-bold flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {nextLabel} <ChevronRight size={16} />
      </button>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function SolarWizard() {
  const [step, setStep] = useState(1);
  const [done, setDone] = useState(false);
  const [answers, setAnswers] = useState<WizardAnswers>({
    propertyType: "", monthlyBill: "", mainGoal: "",
    appliances: {}, budget: "",
  });

  // Contact form state
  const [form, setForm] = useState({ name: "", phone: "", email: "", province: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<{ ref: string } | null>(null);
  const [submitError, setSubmitError] = useState("");

  const TOTAL = 5;

  function setAppliance(id: string, qty: number) {
    setAnswers((a) => {
      const next = { ...a.appliances };
      if (qty <= 0) { delete next[id]; } else { next[id] = qty; }
      return { ...a, appliances: next };
    });
  }

  function next() {
    if (step < TOTAL) setStep((s) => s + 1);
    else setDone(true);
  }
  function back() {
    if (step > 1) setStep((s) => s - 1);
  }

  async function submitQuote(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.phone) return;
    setSubmitting(true);
    setSubmitError("");

    const pkg = PACKAGES[recommend(answers)];
    const appliancesList = Object.entries(answers.appliances).map(([id, qty]) => ({
      label: APPLIANCES.find((a) => a.id === id)?.label ?? id,
      qty,
    }));

    try {
      const res = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          propertyType: propertyLabel(answers.propertyType),
          monthlyBill: answers.monthlyBill,
          mainGoal: goalLabel(answers.mainGoal),
          appliances: appliancesList,
          budget: budgetLabel(answers.budget),
          recommendedPackage: pkg.name,
          estimatedPrice: pkg.price,
          source: "wizard",
        }),
      });
      const data = await res.json();
      if (res.ok) setSubmitted({ ref: data.ref });
      else setSubmitError(data.error ?? "Something went wrong. Please try again or email us.");
    } catch {
      setSubmitError("Network error. Please try again or email us instead.");
    } finally {
      setSubmitting(false);
    }
  }

  // ── Recommendation ──────────────────────────────────────────────────────────
  if (done) {
    const pkgId = recommend(answers);
    const pkg = PACKAGES[pkgId];

    if (submitted) {
      return (
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 text-center">
          <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mx-auto mb-5">
            <Check size={28} color="#22c55e" />
          </div>
          <h1 className="text-2xl font-extrabold text-white mb-2">Quote Request Received</h1>
          <p className="text-gray-400 mb-4">Your reference number is:</p>
          <div className="inline-block bg-[#111111] border border-[#D4AF37]/40 rounded-xl px-6 py-3 mb-6">
            <p className="text-2xl font-bold text-[#D4AF37] tracking-wider">{submitted.ref}</p>
          </div>
          <p className="text-gray-400 mb-6 max-w-md mx-auto leading-relaxed text-sm">
            We have received your request for the <strong className="text-white">{pkg.name}</strong>. Our team will review it and contact you within 24 hours by email.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => window.dispatchEvent(new CustomEvent("openDaisyChat"))} className="btn-gold px-8 py-3.5 rounded-xl font-bold">
              Chat with Us
            </button>
            <Link href="/" className="btn-outline px-8 py-3.5 rounded-xl">Back to Home</Link>
          </div>
        </div>
      );
    }

    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Result header */}
        <div className="text-center mb-6">
          <p className="section-label mb-2">Your Recommendation</p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
            We Found Your <span className="gold-text">Perfect Solution</span>
          </h1>
          <p className="text-gray-400">Based on your answers, here is what we recommend.</p>
        </div>

        {/* Recommended package */}
        <div className="bg-[#111111] border-2 rounded-2xl p-5 mb-5" style={{ borderColor: pkg.color }}>
          <div className="flex items-start justify-between flex-wrap gap-3 mb-5">
            <div>
              <span className="text-xs font-bold px-3 py-1 rounded-full mb-2 inline-block" style={{ background: `${pkg.color}20`, color: pkg.color }}>
                {pkg.badge}
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">{pkg.name}</h2>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold" style={{ color: pkg.color }}>{pkg.price}</p>
              <p className="text-gray-500 text-xs mt-1">{pkg.priceNote}</p>
            </div>
          </div>

          {/* Specs grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
            {pkg.specs.map((s) => (
              <div key={s} className="flex items-center gap-3 text-sm text-gray-300">
                <span style={{ color: pkg.color }} className="shrink-0 text-base">&#10003;</span> {s}
              </div>
            ))}
          </div>

          {/* Info row */}
          <div className="grid grid-cols-2 gap-3 p-4 rounded-xl mb-4" style={{ background: `${pkg.color}08`, border: `1px solid ${pkg.color}20` }}>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Estimated Backup</p>
              <p className="text-white font-bold">{pkg.backupHours}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Warranty</p>
              <p className="text-white font-bold text-sm">{pkg.warranty}</p>
            </div>
          </div>

          <p className="text-gray-400 text-sm leading-relaxed mb-4">{pkg.bestFor}</p>

          <p className="text-xs text-gray-600 leading-relaxed border-t border-[#1F1F1F] pt-3">
            This is an estimated recommendation. Final system sizing and installation requirements must be confirmed by a qualified solar professional. Prices may vary based on site conditions.
          </p>
        </div>

        {/* Why this matches */}
        <div className="bg-[#0f0f0f] border border-[#1A1A1A] rounded-xl p-4 mb-5">
          <h3 className="text-sm font-bold text-white mb-3">Why this matches your profile</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { label: "Property", value: propertyLabel(answers.propertyType) },
              { label: "Budget", value: budgetLabel(answers.budget) },
              { label: "Main Goal", value: goalLabel(answers.mainGoal) },
              { label: "Monthly Bill", value: answers.monthlyBill || "Not specified" },
            ].filter((i) => i.value).map((item) => (
              <div key={item.label} className="flex items-start gap-3">
                <Check size={14} color="#D4AF37" className="shrink-0 mt-0.5" />
                <p className="text-sm text-gray-400"><span className="text-gray-300 font-medium">{item.label}:</span> {item.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
          <button
            onClick={() => window.dispatchEvent(new CustomEvent("openDaisyChat", { detail: { message: `Hi, I used the Solar Wizard and need help choosing the right system. My recommendation was: ${pkg.name} (${pkg.price}).` } }))}
            className="btn-outline py-3.5 rounded-xl text-sm font-bold text-center"
          >
            Talk to an Expert
          </button>
          <Link href="/solar/compare" className="btn-outline py-3.5 rounded-xl text-sm font-bold text-center">
            Compare All Packages
          </Link>
          <Link href={pkg.href} className="btn-outline py-3.5 rounded-xl text-sm font-bold text-center">
            View Full Details
          </Link>
        </div>

        {/* Contact form */}
        <div className="bg-[#111111] border border-[#1F1F1F] rounded-2xl p-5">
          <h3 className="text-lg font-bold text-white mb-2">Request This Package</h3>
          <p className="text-gray-400 text-sm mb-4">
            Submit your details and we will send you an official quote for the <strong className="text-white">{pkg.name}</strong>.
          </p>

          <form onSubmit={submitQuote} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1.5">Full Name *</label>
                <input
                  value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required
                  placeholder="Your name"
                  className="w-full bg-[#0A0A0A] border border-[#1F1F1F] rounded-xl px-4 py-3 text-white text-sm focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1.5">Phone Number *</label>
                <input
                  value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} required type="tel"
                  placeholder="+27 xx xxx xxxx"
                  className="w-full bg-[#0A0A0A] border border-[#1F1F1F] rounded-xl px-4 py-3 text-white text-sm focus:outline-none"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1.5">Email Address</label>
                <input
                  value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} type="email"
                  placeholder="your@email.com"
                  className="w-full bg-[#0A0A0A] border border-[#1F1F1F] rounded-xl px-4 py-3 text-white text-sm focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1.5">Province</label>
                <select
                  value={form.province} onChange={(e) => setForm((f) => ({ ...f, province: e.target.value }))}
                  className="w-full bg-[#0A0A0A] border border-[#1F1F1F] rounded-xl px-4 py-3 text-white text-sm focus:outline-none"
                >
                  <option value="">Select province</option>
                  {["Gauteng","Western Cape","KwaZulu-Natal","Eastern Cape","Limpopo","Mpumalanga","North West","Free State","Northern Cape"].map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1.5">Additional Requirements (optional)</label>
              <textarea
                value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                rows={3} placeholder="Any specific requirements, questions, or information about your property..."
                className="w-full bg-[#0A0A0A] border border-[#1F1F1F] rounded-xl px-4 py-3 text-white text-sm focus:outline-none resize-none"
              />
            </div>
            {submitError && <p className="text-red-400 text-sm">{submitError}</p>}
            <button type="submit" disabled={submitting}
              className="btn-gold w-full py-4 rounded-xl font-bold text-base disabled:opacity-60">
              {submitting ? "Submitting..." : "Request Official Quote"}
            </button>
            <p className="text-center text-xs text-gray-600">
              Or{" "}
              <button
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent("openDaisyChat", { detail: { message: `Hi, I'm interested in the ${pkg.name} solar package (${pkg.price}). Can you help me?` } }))}
                className="text-[#D4AF37] hover:underline"
              >
                chat with us directly
              </button>
            </p>
          </form>
        </div>
      </div>
    );
  }

  // ── Step UI ─────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      {/* Page heading */}
      {step === 1 && (
        <div className="text-center mb-6">
          <p className="section-label mb-2">Solar Solution Finder</p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
            Find My <span className="gold-text">Solar Solution</span>
          </h1>
          <p className="text-gray-400">Answer 5 quick questions and we will recommend the right system for you.</p>
        </div>
      )}

      <div className="bg-[#111111] border border-[#1F1F1F] rounded-2xl p-5">
        <ProgressBar step={step} total={TOTAL} />

        {/* ── Step 1: Property Type ── */}
        {step === 1 && (
          <div>
            <h2 className="text-xl font-bold text-white mb-2">What are you powering?</h2>
            <p className="text-gray-400 text-sm mb-6">Select the option that best describes your property.</p>
            <div className="grid grid-cols-2 gap-3">
              {PROPERTY_TYPES.map((p) => (
                <SelectCard key={p.id} selected={answers.propertyType === p.id} onClick={() => setAnswers((a) => ({ ...a, propertyType: p.id }))}>
                  <div className={`mb-3 ${answers.propertyType === p.id ? "text-[#D4AF37]" : "text-gray-500"}`}>{p.icon}</div>
                  <p className={`font-semibold text-sm mb-0.5 ${answers.propertyType === p.id ? "text-white" : "text-gray-300"}`}>{p.label}</p>
                  <p className="text-xs text-gray-500">{p.sub}</p>
                </SelectCard>
              ))}
            </div>
            <NavButtons step={step} total={TOTAL} onBack={back} onNext={next} nextDisabled={!answers.propertyType} />
          </div>
        )}

        {/* ── Step 2: Monthly Bill ── */}
        {step === 2 && (
          <div>
            <h2 className="text-xl font-bold text-white mb-2">What is your monthly electricity bill?</h2>
            <p className="text-gray-400 text-sm mb-6">This helps us size the right system for your usage.</p>
            <div className="flex flex-col gap-3">
              {MONTHLY_BILLS.map((b) => (
                <SelectCard key={b.id} selected={answers.monthlyBill === b.id} onClick={() => setAnswers((a) => ({ ...a, monthlyBill: b.id }))}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`font-semibold text-sm ${answers.monthlyBill === b.id ? "text-white" : "text-gray-300"}`}>{b.label}</p>
                      <p className="text-xs text-gray-500">{b.sub}</p>
                    </div>
                    {answers.monthlyBill === b.id && <Check size={18} color="#D4AF37" />}
                  </div>
                </SelectCard>
              ))}
            </div>
            <NavButtons step={step} total={TOTAL} onBack={back} onNext={next} nextDisabled={!answers.monthlyBill} />
          </div>
        )}

        {/* ── Step 3: Main Goal ── */}
        {step === 3 && (
          <div>
            <h2 className="text-xl font-bold text-white mb-2">What is your main goal?</h2>
            <p className="text-gray-400 text-sm mb-6">This determines which system type we recommend.</p>
            <div className="flex flex-col gap-3">
              {MAIN_GOALS.map((g) => (
                <SelectCard key={g.id} selected={answers.mainGoal === g.id} onClick={() => setAnswers((a) => ({ ...a, mainGoal: g.id }))}>
                  <div className="flex items-center gap-4">
                    <div className={`shrink-0 ${answers.mainGoal === g.id ? "text-[#D4AF37]" : "text-gray-500"}`}>{g.icon}</div>
                    <div>
                      <p className={`font-semibold text-sm ${answers.mainGoal === g.id ? "text-white" : "text-gray-300"}`}>{g.label}</p>
                      <p className="text-xs text-gray-500">{g.sub}</p>
                    </div>
                    {answers.mainGoal === g.id && <Check size={18} color="#D4AF37" className="ml-auto shrink-0" />}
                  </div>
                </SelectCard>
              ))}
            </div>
            <NavButtons step={step} total={TOTAL} onBack={back} onNext={next} nextDisabled={!answers.mainGoal} />
          </div>
        )}

        {/* ── Step 4: Appliances ── */}
        {step === 4 && (
          <div>
            <h2 className="text-xl font-bold text-white mb-2">Which appliances do you need to run?</h2>
            <p className="text-gray-400 text-sm mb-6">Select all that apply and set the quantity. This helps calculate your power needs.</p>
            <div className="grid grid-cols-1 gap-2 max-h-[420px] overflow-y-auto pr-1">
              {APPLIANCES.map((a) => {
                const qty = answers.appliances[a.id] ?? 0;
                const selected = qty > 0;
                return (
                  <div
                    key={a.id}
                    className="flex items-center gap-4 rounded-xl border p-3.5 transition-all"
                    style={{
                      background: selected ? "rgba(212,175,55,0.06)" : "#0f0f0f",
                      borderColor: selected ? "rgba(212,175,55,0.5)" : "#1F1F1F",
                    }}
                  >
                    <div className={`shrink-0 ${selected ? "text-[#D4AF37]" : "text-gray-500"}`}>{a.icon}</div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${selected ? "text-white" : "text-gray-300"}`}>{a.label}</p>
                      <p className="text-xs text-gray-600">{a.watts > 0 ? `${a.watts}W` : "Variable"}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => setAppliance(a.id, qty - 1)}
                        disabled={qty === 0}
                        className="w-7 h-7 rounded-lg border border-[#2a2a2a] flex items-center justify-center text-gray-400 hover:text-white hover:border-[#D4AF37]/50 transition-colors disabled:opacity-30 text-lg font-bold"
                      >
                        −
                      </button>
                      <span className={`w-6 text-center text-sm font-bold ${selected ? "text-[#D4AF37]" : "text-gray-600"}`}>
                        {qty}
                      </span>
                      <button
                        type="button"
                        onClick={() => setAppliance(a.id, qty + 1)}
                        className="w-7 h-7 rounded-lg border border-[#2a2a2a] flex items-center justify-center text-gray-400 hover:text-white hover:border-[#D4AF37]/50 transition-colors text-lg font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            <NavButtons
              step={step} total={TOTAL} onBack={back}
              onNext={next}
              nextLabel={Object.keys(answers.appliances).length === 0 ? "Skip" : "Continue"}
            />
          </div>
        )}

        {/* ── Step 5: Budget ── */}
        {step === 5 && (
          <div>
            <h2 className="text-xl font-bold text-white mb-2">What is your budget?</h2>
            <p className="text-gray-400 text-sm mb-6">This helps us narrow down the right solution. Don't worry if you're unsure.</p>
            <div className="flex flex-col gap-3">
              {BUDGETS.map((b) => (
                <SelectCard key={b.id} selected={answers.budget === b.id} onClick={() => setAnswers((a) => ({ ...a, budget: b.id }))}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`font-semibold text-sm ${answers.budget === b.id ? "text-white" : "text-gray-300"}`}>{b.label}</p>
                      <p className="text-xs text-gray-500">{b.sub}</p>
                    </div>
                    {answers.budget === b.id && <Check size={18} color="#D4AF37" />}
                  </div>
                </SelectCard>
              ))}
            </div>
            <NavButtons
              step={step} total={TOTAL} onBack={back} onNext={next}
              nextLabel="See My Recommendation" nextDisabled={!answers.budget}
            />
          </div>
        )}
      </div>
    </div>
  );
}
