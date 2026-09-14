import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getSiteImages } from "@/lib/siteImages";
import ChatButton from "@/components/ChatButton";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Residential Solar Packages — From R67,500 | Bevanssons",
  description: "Premium residential solar systems for South African homes. Essential, Premium and Business Home Pro packages with full installation, lithium batteries and monitoring.",
};

const packageDefs = [
  {
    name: "Essential Home",
    price: "R67,500",
    tag: "Best Value",
    imgKey: "solar.res_1",
    specs: [
      "5kW Solar Inverter",
      "8 x 450W Solar Panels (3.6kWp)",
      "100Ah Lithium Battery",
      "Full installation kit",
      "Monitoring app included",
    ],
    benefits: [
      "Ideal for 2–3 bedroom homes",
      "Covers essential loads",
      "5-year inverter warranty",
      "Payback period: 4–5 years",
    ],
  },
  {
    name: "Premium Home",
    price: "R98,000",
    tag: "Most Popular",
    imgKey: "solar.res_2",
    specs: [
      "8kW Hybrid Solar Inverter",
      "16 x 450W Solar Panels (7.2kWp)",
      "200Ah Lithium Battery",
      "Battery management system",
      "Advanced monitoring portal",
    ],
    benefits: [
      "Ideal for 3–5 bedroom homes",
      "Full home coverage including geysers",
      "10-year panel warranty",
      "Payback period: 3–4 years",
    ],
  },
  {
    name: "Business Home Pro",
    price: "R264,000",
    tag: "Maximum Power",
    imgKey: "solar.res_3",
    specs: [
      "20kW Three-phase Hybrid Inverter",
      "36 x 550W Solar Panels (19.8kWp)",
      "2 x 200Ah Lithium Battery Banks",
      "Smart energy management system",
      "Priority technical support",
    ],
    benefits: [
      "Large homes and small businesses",
      "Complete energy independence",
      "25-year panel output warranty",
      "Payback period: 2–3 years",
    ],
  },
];

export default function ResidentialSolar() {
  const imgs = getSiteImages(["solar.res_1", "solar.res_2", "solar.res_3"]);
  const packages = packageDefs.map(p => ({ ...p, img: imgs[p.imgKey] }));
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12">

      {/* Header */}
      <div className="text-center mb-8">
        <Link href="/solar" className="text-[#D4AF37] text-sm hover:underline mb-4 inline-block">
          &larr; Solar Solutions
        </Link>
        <p className="text-[#D4AF37] text-sm uppercase tracking-widest mb-3">For Your Home</p>
        <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-3">
          Residential <span className="gold-text">Solar Packages</span>
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto text-base leading-relaxed">
          Go solar and cut your electricity bill by up to 90%. All packages include premium components and nationwide delivery.
        </p>
      </div>

      {/* Package cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {packages.map((pkg, i) => (
          <div key={pkg.name}
            className={`relative bg-[#111111] border rounded-2xl overflow-hidden flex flex-col card-hover ${i === 1 ? "border-[#D4AF37]" : "border-[#1F1F1F]"}`}>

            {/* Hero image */}
            <div className="relative h-52">
              <Image src={pkg.img} alt={pkg.name} fill className="object-cover"
                sizes="(max-width: 768px) 100vw, 33vw" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-black/20 to-transparent" />
              {pkg.tag && (
                <span className="absolute top-4 right-4 btn-gold text-xs px-4 py-1.5 rounded-full font-bold">
                  {pkg.tag}
                </span>
              )}
            </div>

            <div className="p-5 flex flex-col flex-1">
              <h2 className="text-xl font-semibold text-white mb-1">{pkg.name}</h2>
              <p className="text-2xl font-bold text-[#D4AF37] mb-4">{pkg.price}</p>

              <div className="mb-4">
                <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">Specifications</p>
                <ul className="space-y-2">
                  {pkg.specs.map((s) => (
                    <li key={s} className="flex items-start gap-3 text-sm text-gray-300 leading-relaxed">
                      <span className="text-[#D4AF37] mt-0.5 shrink-0 text-base">&#10003;</span> {s}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mb-4 flex-1">
                <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">Benefits</p>
                <ul className="space-y-2">
                  {pkg.benefits.map((b) => (
                    <li key={b} className="flex items-start gap-3 text-sm text-gray-400 leading-relaxed">
                      <span className="text-green-400 mt-0.5 shrink-0 text-base">&#10003;</span> {b}
                    </li>
                  ))}
                </ul>
              </div>

              <ChatButton
                message={`Hi, I'm interested in the ${pkg.name} solar package (${pkg.price}). Can I get a quote?`}
                className="btn-gold w-full py-4 rounded-xl font-bold text-sm"
              >
                Get a Quote
              </ChatButton>
            </div>
          </div>
        ))}
      </div>

      {/* Custom quote CTA */}
      <div className="bg-[#111111] border border-[#1F1F1F] rounded-2xl p-6 text-center">
        <h3 className="text-xl font-bold text-white mb-2">Need a custom size?</h3>
        <p className="text-gray-400 text-base mb-5 max-w-lg mx-auto leading-relaxed">
          We design custom solar systems for any home size and budget. Contact us for a tailored quote.
        </p>
        <Link href="/contact" className="btn-gold px-10 py-4 rounded-xl font-bold">Get Custom Quote</Link>
      </div>
    </div>
  );
}
