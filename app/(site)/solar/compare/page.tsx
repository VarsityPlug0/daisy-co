import type { Metadata } from "next";
import Link from "next/link";
import { Check, X } from "lucide-react";
import ChatButton from "@/components/ChatButton";

export const metadata: Metadata = {
  title: "Compare Solar Packages — Essential, Premium & Business Pro | Bevanssons",
  description: "Compare all Bevanssons solar packages side by side. See prices, inverter size, battery capacity, panel count, backup hours and warranty for every package.",
};

const packages = [
  {
    id: "essential",
    name: "Essential Home",
    tag: "Best Value",
    tagColor: "#22c55e",
    price: "R67,500",
    href: "/solar/residential",
    inverter: "5kW Hybrid Inverter",
    panels: "8 × 450W (3.6kWp)",
    battery: "100Ah Lithium (5.12kWh)",
    backup: "6–10 hours",
    monitoring: "Basic app monitoring",
    warranty: "5yr inverter / 25yr panels / 5yr battery",
    threePhase: false,
    parallelCapable: false,
    smartMgmt: false,
    bestFor: "2–3 bedroom homes",
    payback: "4–5 years",
    highlight: false,
  },
  {
    id: "premium",
    name: "Premium Home",
    tag: "Most Popular",
    tagColor: "#C8B993",
    price: "R98,000",
    href: "/solar/residential",
    inverter: "8kW Hybrid Inverter",
    panels: "16 × 450W (7.2kWp)",
    battery: "200Ah Lithium (10.24kWh)",
    backup: "12–18 hours",
    monitoring: "Advanced monitoring portal",
    warranty: "10yr inverter / 25yr panels / 10yr battery",
    threePhase: false,
    parallelCapable: true,
    smartMgmt: false,
    bestFor: "3–5 bedroom homes",
    payback: "3–4 years",
    highlight: true,
  },
  {
    id: "business-pro",
    name: "Business Home Pro",
    tag: "Maximum Power",
    tagColor: "#A855F7",
    price: "R264,000",
    href: "/solar/residential",
    inverter: "20kW Three-phase Hybrid",
    panels: "36 × 550W (19.8kWp)",
    battery: "2 × 200Ah Lithium (20.48kWh)",
    backup: "18–24+ hours",
    monitoring: "Smart energy management system",
    warranty: "10yr inverter / 25yr panels / 10yr battery",
    threePhase: true,
    parallelCapable: true,
    smartMgmt: true,
    bestFor: "Large homes & small businesses",
    payback: "2–3 years",
    highlight: false,
  },
];

const rows: { label: string; key: keyof typeof packages[0] | "tag" | "price" | "inverter" | "panels" | "battery" | "backup" | "monitoring" | "warranty" | "threePhase" | "parallelCapable" | "smartMgmt" | "bestFor" | "payback"; type: "text" | "bool" }[] = [
  { label: "Price",                      key: "price",          type: "text" },
  { label: "Inverter",                   key: "inverter",       type: "text" },
  { label: "Solar Panels",              key: "panels",         type: "text" },
  { label: "Battery Storage",           key: "battery",        type: "text" },
  { label: "Backup Duration",           key: "backup",         type: "text" },
  { label: "Monitoring",                key: "monitoring",     type: "text" },
  { label: "Warranty",                  key: "warranty",       type: "text" },
  { label: "Three-phase",               key: "threePhase",     type: "bool" },
  { label: "Parallel Capable",          key: "parallelCapable",type: "bool" },
  { label: "Smart Energy Management",  key: "smartMgmt",      type: "bool" },
  { label: "Best For",                  key: "bestFor",        type: "text" },
  { label: "Est. Payback Period",       key: "payback",        type: "text" },
];

export default function ComparePage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="text-center mb-8">
        <Link href="/solar" className="text-[#C8B993] text-sm hover:underline mb-4 inline-block">&larr; Solar Solutions</Link>
        <p className="section-label mb-3">Side-by-Side</p>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">
          Compare <span className="gold-text">Solar Packages</span>
        </h1>
        <p className="text-gray-400 max-w-xl mx-auto text-base leading-relaxed">
          All prices include installation. Specifications and prices are subject to site assessment.
        </p>
        <div className="mt-6">
          <Link href="/solar/wizard" className="btn-gold px-7 py-3 rounded-xl text-sm font-bold inline-flex items-center gap-2">
            Not sure which to choose? Take the Wizard
          </Link>
        </div>
      </div>

      {/* Mobile: stacked cards */}
      <div className="lg:hidden space-y-6 mb-12">
        {packages.map((pkg) => (
          <div
            key={pkg.id}
            className="rounded-2xl border overflow-hidden"
            style={{ borderColor: pkg.highlight ? pkg.tagColor : "#2A2A2A", background: "#1D1D1D" }}
          >
            <div className="p-6 border-b" style={{ borderColor: "#2A2A2A" }}>
              <span className="text-xs font-bold px-3 py-1 rounded-full inline-block mb-3" style={{ background: `${pkg.tagColor}20`, color: pkg.tagColor }}>
                {pkg.tag}
              </span>
              <h2 className="text-xl font-semibold text-white mb-1">{pkg.name}</h2>
              <p className="text-3xl font-bold" style={{ color: pkg.tagColor }}>{pkg.price}</p>
            </div>
            <div className="p-6 space-y-4">
              {rows.map((row) => (
                <div key={row.label} className="flex items-start justify-between gap-4 text-sm">
                  <p className="text-gray-500 shrink-0 w-40">{row.label}</p>
                  {row.type === "bool" ? (
                    pkg[row.key] ? <Check size={16} color="#22c55e" /> : <X size={16} color="#4B5563" />
                  ) : (
                    <p className={`text-right font-medium ${row.key === "price" ? "text-[#C8B993]" : "text-gray-200"}`}>
                      {String(pkg[row.key])}
                    </p>
                  )}
                </div>
              ))}
            </div>
            <div className="p-6 border-t" style={{ borderColor: "#2A2A2A" }}>
              <ChatButton
                message={`Hi, I'm interested in the ${pkg.name} solar package (${pkg.price}). Can you help me?`}
                className="btn-gold w-full py-3.5 rounded-xl font-bold text-sm"
              >
                Request This Package
              </ChatButton>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop: comparison table */}
      <div className="hidden lg:block overflow-hidden rounded-3xl border border-[#2A2A2A]">
        {/* Package headers */}
        <div className="grid grid-cols-4 bg-[#0f0f0f] border-b border-[#2A2A2A]">
          <div className="p-4 border-r border-[#2A2A2A]">
            <p className="text-gray-600 text-sm">Compare packages</p>
          </div>
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className="p-4 text-center relative"
              style={{ background: pkg.highlight ? "rgba(200,185,147,0.04)" : "transparent", borderRight: "1px solid #2A2A2A" }}
            >
              {pkg.highlight && (
                <div className="absolute top-0 left-0 right-0 h-1 rounded-t-none" style={{ background: pkg.tagColor }} />
              )}
              <span className="text-xs font-bold px-3 py-1 rounded-full inline-block mb-3" style={{ background: `${pkg.tagColor}20`, color: pkg.tagColor }}>
                {pkg.tag}
              </span>
              <h2 className="text-lg font-semibold text-white mb-2">{pkg.name}</h2>
              <p className="text-2xl font-bold" style={{ color: pkg.tagColor }}>{pkg.price}</p>
            </div>
          ))}
        </div>

        {/* Rows */}
        {rows.map((row, i) => (
          <div
            key={row.label}
            className="grid grid-cols-4"
            style={{ background: i % 2 === 0 ? "#1D1D1D" : "#0f0f0f", borderBottom: "1px solid #1A1A1A" }}
          >
            <div className="px-4 py-3 border-r border-[#1A1A1A] flex items-center">
              <p className="text-gray-500 text-sm font-medium">{row.label}</p>
            </div>
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className="px-4 py-3 border-r border-[#1A1A1A] flex items-center justify-center text-center"
                style={{ background: pkg.highlight ? "rgba(200,185,147,0.02)" : "transparent" }}
              >
                {row.type === "bool" ? (
                  pkg[row.key] ? <Check size={18} color="#22c55e" /> : <X size={18} color="#374151" />
                ) : (
                  <p className={`text-sm font-medium ${row.key === "price" ? "text-[#C8B993] font-bold text-base" : "text-gray-300"}`}>
                    {String(pkg[row.key])}
                  </p>
                )}
              </div>
            ))}
          </div>
        ))}

        {/* CTA row */}
        <div className="grid grid-cols-4 bg-[#0f0f0f] border-t border-[#2A2A2A]">
          <div className="p-4 border-r border-[#2A2A2A]" />
          {packages.map((pkg) => (
            <div key={pkg.id} className="p-4 border-r border-[#2A2A2A]"
              style={{ background: pkg.highlight ? "rgba(200,185,147,0.03)" : "transparent" }}>
              <ChatButton
                message={`Hi, I'm interested in the ${pkg.name} solar package (${pkg.price}). Can you help me?`}
                className={pkg.highlight ? "btn-gold w-full py-3.5 rounded-xl font-bold text-sm" : "btn-outline w-full py-3.5 rounded-xl font-bold text-sm"}
              >
                Request This
              </ChatButton>
            </div>
          ))}
        </div>
      </div>

      {/* Commercial note */}
      <div className="mt-6 bg-[#1D1D1D] border border-[#2A2A2A] rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-5 justify-between">
        <div>
          <h3 className="text-lg font-bold text-white mb-1">Need a commercial system?</h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            Offices, shops, restaurants and factories require a custom quote. Commercial systems start from <strong className="text-white">R198,400</strong>.
          </p>
        </div>
        <div className="flex gap-3 shrink-0">
          <Link href="/solar/commercial" className="btn-outline px-6 py-3 rounded-xl text-sm font-bold whitespace-nowrap">
            Commercial Solar
          </Link>
          <Link href="/solar/wizard" className="btn-gold px-6 py-3 rounded-xl text-sm font-bold whitespace-nowrap">
            Take the Wizard
          </Link>
        </div>
      </div>

      {/* Disclaimer */}
      <p className="text-center text-gray-600 text-xs mt-8 max-w-2xl mx-auto leading-relaxed">
        All prices include standard installation. Final pricing subject to site assessment, roof type, and location. Specifications may vary. Contact us for a detailed quote.
      </p>
    </div>
  );
}
