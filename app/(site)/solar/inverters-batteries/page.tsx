import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getSiteImages } from "@/lib/siteImages";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Inverters & Lithium Batteries — Backup Power | Daisy & Co.",
  description: "Premium hybrid inverters (3kVA–8kVA) and lithium batteries (100Ah–200Ah+). Stay powered through load-shedding. Nationwide delivery across South Africa.",
};

const inverterDefs = [
  { name: "3kVA Hybrid Inverter", price: "From R8,500",  tag: "",             imgKey: "solar.inv_1", specs: ["3kW output", "MPPT solar charger", "LCD display", "Grid-tie capable"] },
  { name: "5kVA Hybrid Inverter", price: "From R12,000", tag: "Most Popular", imgKey: "solar.inv_2", specs: ["5kW output", "80A MPPT charger", "Wi-Fi monitoring", "Parallel capable"] },
  { name: "8kVA Hybrid Inverter", price: "From R18,500", tag: "",             imgKey: "solar.inv_3", specs: ["8kW output", "120A MPPT charger", "Three-phase option", "App monitoring"] },
];

const batteryDefs = [
  { name: "100Ah Lithium Battery", price: "From R9,800",  tag: "",            imgKey: "solar.bat_1", specs: ["5.12kWh capacity", "6000+ cycle life", "BMS protection", "Stackable design"] },
  { name: "200Ah Lithium Battery", price: "From R17,500", tag: "Best Seller", imgKey: "solar.bat_2", specs: ["10.24kWh capacity", "6000+ cycle life", "Smart BMS", "10-year warranty"] },
  { name: "Lithium Battery Bank",  price: "From R35,000", tag: "",            imgKey: "solar.bat_3", specs: ["Custom capacity", "Up to 40kWh", "Scalable system", "Industrial grade"] },
];

function ProductCard({ item }: { item: typeof inverterDefs[0] & { img: string } }) {
  return (
    <div className={`relative bg-[#111111] border rounded-2xl overflow-hidden card-hover flex flex-col group ${item.tag ? "border-[#D4AF37]" : "border-[#1F1F1F]"}`}>
      {/* Image */}
      <div className="relative h-44 bg-[#0a0a0a] overflow-hidden">
        <Image src={item.img} alt={item.name} fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 33vw" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-black/20 to-transparent" />
        {item.tag && (
          <span className="absolute top-4 right-4 btn-gold text-xs px-4 py-1.5 rounded-full font-bold z-10">
            {item.tag}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-lg font-semibold text-white mb-1">{item.name}</h3>
        <p className="text-xl font-bold text-[#D4AF37] mb-4">{item.price}</p>
        <ul className="space-y-2 flex-1 mb-4">
          {item.specs.map((s) => (
            <li key={s} className="flex items-center gap-3 text-sm text-gray-300">
              <span className="text-[#D4AF37] text-base">&#10003;</span> {s}
            </li>
          ))}
        </ul>
        <Link href="/contact" className="btn-gold w-full py-3.5 rounded-xl text-sm font-bold text-center block">
          Get Price
        </Link>
      </div>
    </div>
  );
}

export default function InvertersBatteries() {
  const imgs = getSiteImages(["solar.inv_1","solar.inv_2","solar.inv_3","solar.bat_1","solar.bat_2","solar.bat_3"]);
  const inverters = inverterDefs.map(i => ({ ...i, img: imgs[i.imgKey] }));
  const batteries = batteryDefs.map(b => ({ ...b, img: imgs[b.imgKey] }));
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12">

      {/* Header */}
      <div className="text-center mb-8">
        <Link href="/solar" className="text-[#D4AF37] text-sm hover:underline mb-4 inline-block">
          &larr; Solar Solutions
        </Link>
        <p className="text-[#D4AF37] text-sm uppercase tracking-widest mb-3">Backup Power</p>
        <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-3">
          Inverters & <span className="gold-text">Batteries</span>
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto text-base leading-relaxed">
          Stay powered during load-shedding with premium inverters and lithium batteries. Reliable, efficient, and built to last.
        </p>
      </div>

      {/* Inverters */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-8">Inverters</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
          {inverters.map((item) => <ProductCard key={item.name} item={item} />)}
        </div>
      </div>

      <div className="gold-divider my-8" />

      {/* Batteries */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-8">Lithium Batteries</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
          {batteries.map((item) => <ProductCard key={item.name} item={item} />)}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-[#111111] border border-[#D4AF37]/30 rounded-2xl p-7 text-center">
        <h3 className="text-xl font-bold text-white mb-2">Need help choosing the right system?</h3>
        <p className="text-gray-400 text-base mb-5 max-w-lg mx-auto leading-relaxed">
          Our team will assess your power needs and recommend the perfect inverter and battery combination.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/contact" className="btn-gold px-10 py-4 rounded-xl font-bold">Get Free Assessment</Link>
        </div>
      </div>
    </div>
  );
}
