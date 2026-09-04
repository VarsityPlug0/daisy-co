import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ShieldCheck, Truck, Zap, TrendingDown } from "lucide-react";
import { getSiteImages } from "@/lib/siteImages";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Commercial Solar Systems — Offices, Retail & Factories | Daisy & Co.",
  description: "Commercial solar solutions for offices, shops, restaurants and factories. Eliminate load-shedding and reduce electricity costs by up to 90%. Custom quotes available.",
};

const segmentDefs = [
  { name: "Offices",                  desc: "Reduce electricity costs and protect against load-shedding. Keep operations running 24/7 with clean solar power.",                                             imgKey: "solar.com_1" },
  { name: "Shops & Retail",           desc: "Never lose sales due to power cuts. Solar keeps your tills, fridges and lights on — no matter the stage of load-shedding.",                                   imgKey: "solar.com_2" },
  { name: "Restaurants & Hospitality",desc: "Protect refrigeration, cooking equipment and ambiance lighting with reliable solar backup that guests will never notice.",                                      imgKey: "solar.com_3" },
  { name: "Small Factories",          desc: "Three-phase solar systems that can power heavy machinery and production lines for uninterrupted manufacturing.",                                                imgKey: "solar.com_4" },
];

const benefits = [
  { value: "Up to 90%", label: "Electricity Bill Reduction" },
  { value: "3–5 Yrs",   label: "Average ROI Payback" },
  { value: "25 Years",  label: "Panel Output Warranty" },
  { value: "100%",      label: "Load-Shedding Protection" },
];

const reasons = [
  { icon: TrendingDown, text: "Eliminate or drastically reduce Eskom bills" },
  { icon: Zap,          text: "Guaranteed backup power during load-shedding" },
  { icon: ShieldCheck,  text: "Increase property value significantly" },
  { icon: Truck,        text: "Low maintenance — solar panels last 25+ years" },
  { icon: ShieldCheck,  text: "Tax benefits and depreciation allowances" },
  { icon: Zap,          text: "CSR and green credentials for your brand" },
];

export default function CommercialSolar() {
  const imgs = getSiteImages(["solar.com_hero", "solar.com_1", "solar.com_2", "solar.com_3", "solar.com_4"]);
  const segments = segmentDefs.map(s => ({ ...s, img: imgs[s.imgKey] }));
  return (
    <>
      {/* ── HERO ── */}
      <section className="relative bg-[#0A0A0A] overflow-hidden" style={{ minHeight: 300 }}>
        <Image
          src={imgs["solar.com_hero"]}
          alt="Commercial solar installation"
          fill className="object-cover object-center opacity-25"
          priority
        />
        <div className="absolute inset-0"
          style={{ background: "linear-gradient(to right, rgba(10,10,10,0.97) 0%, rgba(10,10,10,0.80) 60%, rgba(10,10,10,0.60) 100%)" }} />
        <div className="absolute inset-0"
          style={{ background: "radial-gradient(ellipse at 80% 50%, rgba(212,175,55,0.1) 0%, transparent 60%)" }} />

        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-12 flex flex-col items-start justify-center" style={{ minHeight: 300 }}>
          <Link href="/solar" className="text-[#D4AF37] text-sm hover:underline mb-4 inline-flex items-center gap-1.5 opacity-80 hover:opacity-100 transition-opacity">
            &larr; Solar Solutions
          </Link>
          <p className="text-[#D4AF37] text-[11px] uppercase tracking-widest font-semibold mb-3">For Your Business</p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight mb-3">
            Commercial{" "}
            <span className="text-[#D4AF37]">Solar Systems</span>
          </h1>
          <p className="text-gray-400 text-base leading-relaxed max-w-xl">
            Protect your business from load-shedding and high electricity costs with a commercial solar system designed for your operation.
          </p>
        </div>
      </section>

      {/* ── ROI STATS ── */}
      <section className="bg-[#0A0A0A] py-8 border-b border-[#1A1A1A]">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {benefits.map((b) => (
              <div key={b.label} className="bg-[#111111] border border-[#1F1F1F] rounded-2xl p-6 text-center card-hover">
                <p className="text-3xl md:text-4xl font-extrabold text-[#D4AF37] mb-2">{b.value}</p>
                <p className="text-sm text-gray-400 leading-snug">{b.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHO WE SERVE ── */}
      <section className="bg-[#0A0A0A] py-12">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">Who We Serve</h2>
            <div className="w-12 h-0.5 bg-[#D4AF37] mx-auto mb-4" />
            <p className="text-gray-400 text-base max-w-lg mx-auto">Commercial solar solutions for every type of business.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {segments.map((seg) => (
              <div key={seg.name} className="bg-[#111111] border border-[#1A1A1A] rounded-2xl overflow-hidden card-hover flex flex-col group">
                <div className="relative h-52 overflow-hidden">
                  <Image src={seg.img} alt={seg.name} fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, 50vw" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#111111]/90 via-black/30 to-transparent" />
                  <h3 className="absolute bottom-5 left-6 text-xl font-bold text-white">{seg.name}</h3>
                </div>
                <div className="p-6">
                  <p className="text-gray-400 text-base leading-relaxed">{seg.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY GO SOLAR ── */}
      <section className="bg-[#0f0f0f] py-12 border-t border-[#1A1A1A]">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="bg-[#111111] border border-[#D4AF37]/20 rounded-2xl p-6 sm:p-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-3">Why Go Solar for Your Business?</h2>
              <div className="w-12 h-0.5 bg-[#D4AF37] mx-auto" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {reasons.map((r) => (
                <div key={r.text} className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center shrink-0 mt-0.5">
                    <r.icon size={15} color="#D4AF37" strokeWidth={2} />
                  </div>
                  <p className="text-gray-300 text-base leading-relaxed">{r.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-[#0A0A0A] py-12 border-t border-[#1A1A1A]">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 text-center">
          <h3 className="text-2xl font-bold text-white mb-3">Ready to go solar?</h3>
          <p className="text-gray-400 text-base mb-6 max-w-lg mx-auto leading-relaxed">
            Contact us for a custom commercial quote tailored to your energy usage and budget.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact" className="btn-gold px-10 py-4 rounded-xl font-bold text-base">
              Request Commercial Quote
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
