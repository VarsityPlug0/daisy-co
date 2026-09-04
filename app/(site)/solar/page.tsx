import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getSiteImages } from "@/lib/siteImages";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Solar Solutions for Homes & Businesses | Daisy & Co.",
  description: "Residential solar, commercial solar, inverters and lithium batteries. Premium solar systems delivered and installed across all 9 provinces of South Africa.",
};

const solutionDefs = [
  { title: "Residential Solar",    desc: "Power your home with clean solar energy. Cut your electricity bill by up to 90% with our premium residential solar packages.",  href: "/solar/residential",         imgKey: "solar.pkg_essential", packages: ["Essential Home — R67,500", "Premium Home — R98,000", "Business Home Pro — R264,000"] },
  { title: "Commercial Solar",     desc: "Scale your business energy independence. Reduce overheads and protect against load-shedding with commercial-grade systems.",    href: "/solar/commercial",          imgKey: "solar.pkg_premium",   packages: ["Office & Retail", "Restaurants & Hospitality", "Small Factories"] },
  { title: "Inverters & Batteries",desc: "Keep the lights on during load-shedding. Premium inverters and lithium batteries for reliable backup power.",                  href: "/solar/inverters-batteries", imgKey: "solar.pkg_business",  packages: ["3kVA Inverter Systems", "5kVA Hybrid Systems", "Lithium Battery Banks"] },
];

const stats = [
  { value: "90%",   label: "Electricity bill reduction" },
  { value: "25yr",  label: "Panel output warranty" },
  { value: "6000+", label: "Battery cycle life" },
  { value: "9",     label: "Provinces served" },
];

export default function SolarSolutions() {
  const imgs = getSiteImages(["solar.pkg_essential", "solar.pkg_premium", "solar.pkg_business"]);
  const solutions = solutionDefs.map(s => ({ ...s, img: imgs[s.imgKey] }));
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12">

      {/* Header */}
      <div className="text-center mb-8">
        <p className="text-[#D4AF37] text-sm uppercase tracking-widest mb-3">Energy Independence</p>
        <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-3">
          Solar Solutions for <span className="gold-text">Homes & Businesses</span>
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto text-base leading-relaxed">
          From small homes to large commercial sites, we have the right solar solution to suit your needs and budget.
        </p>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="bg-[#111111] border border-[#1F1F1F] rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-[#D4AF37] mb-1">{s.value}</p>
            <p className="text-sm text-gray-400 leading-snug">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Solutions grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {solutions.map((s) => (
          <div key={s.title} className="bg-[#111111] border border-[#1F1F1F] rounded-2xl overflow-hidden card-hover flex flex-col">
            {/* Image */}
            <div className="relative h-56">
              <Image src={s.img ?? ""} alt={s.title} fill className="object-cover"
                sizes="(max-width: 768px) 100vw, 33vw" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-black/30 to-transparent" />
              <h2 className="absolute bottom-5 left-6 text-2xl font-bold text-white">{s.title}</h2>
            </div>

            {/* Content */}
            <div className="p-5 flex flex-col flex-1">
              <p className="text-gray-400 text-sm leading-relaxed mb-4">{s.desc}</p>
              <ul className="space-y-2 mb-5 flex-1">
                {s.packages.map((pkg) => (
                  <li key={pkg} className="flex items-center gap-3 text-sm text-gray-300">
                    <span className="text-[#D4AF37] text-base">&#10003;</span> {pkg}
                  </li>
                ))}
              </ul>
              <Link href={s.href} className="btn-gold w-full py-3.5 rounded-xl text-sm font-bold">
                View Packages
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Info bar */}
      <div className="bg-[#111111] border border-[#1F1F1F] rounded-xl p-6 grid grid-cols-1 md:grid-cols-3 gap-6 text-center mb-8">
        {[
          { label: "Delivery",  value: "Nationwide across South Africa" },
          { label: "Warranty",  value: "Full product warranty support" },
          { label: "Support",   value: "Email sales & after-sales" },
        ].map((item) => (
          <div key={item.label}>
            <p className="text-[#D4AF37] text-xs uppercase tracking-widest mb-2">{item.label}</p>
            <p className="text-white font-semibold text-base">{item.value}</p>
          </div>
        ))}
      </div>

      {/* Quote CTA */}
      <div className="text-center">
        <p className="text-gray-400 mb-5 text-base">Not sure which system you need? Talk to our solar experts.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/contact" className="btn-gold px-12 py-4 rounded-xl font-bold text-base">Get a Free Quote</Link>
        </div>
      </div>
    </div>
  );
}
