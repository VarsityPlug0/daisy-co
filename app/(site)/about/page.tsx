import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, Truck, BadgeCheck, Headphones, MapPin, Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "About Us | Daisy Gadgets Co. — Premium Gadgets Worldwide",
  description: "Daisy Gadgets Co. is a proudly South African gadget retailer offering premium electronics, appliances, gaming, solar & more with worldwide shipping.",
};

const values = [
  { icon: BadgeCheck, title: "Authenticity",     desc: "Every product is 100% genuine. We never sell counterfeit goods." },
  { icon: ShieldCheck, title: "Transparency",    desc: "Clear pricing, honest communication, no hidden fees." },
  { icon: Truck,       title: "Reliability",     desc: "We deliver on our promises — fast shipping, secure packaging." },
  { icon: Headphones,  title: "Customer First",  desc: "Real human support by email. We're here when you need us." },
];

const areas = [
  "Gauteng", "Western Cape", "KwaZulu-Natal", "Eastern Cape",
  "Free State", "Limpopo", "Mpumalanga", "North West", "Northern Cape",
  "International (Worldwide)",
];

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto px-5 sm:px-8 py-20">

      {/* Header */}
      <div className="mb-16 text-center">
        <p className="section-label mb-3">Our Story</p>
        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6">
          About <span className="gold-text">Daisy Gadgets Co.</span>
        </h1>
        <p className="text-gray-400 text-lg leading-relaxed max-w-2xl mx-auto">
          We&apos;re a proudly South African gadget retailer on a mission to make premium technology accessible to everyone — locally and worldwide.
        </p>
      </div>

      {/* Mission */}
      <div className="bg-[#111111] border border-[#D4AF37]/20 rounded-3xl p-10 mb-12 text-center">
        <p className="text-[#D4AF37] text-xs uppercase tracking-widest font-bold mb-4">Our Mission</p>
        <p className="text-white text-xl md:text-2xl font-bold leading-relaxed max-w-3xl mx-auto">
          &ldquo;Premium gadgets for everyday convenience. Worldwide shipping available. Same-day delivery in South Africa.&rdquo;
        </p>
      </div>

      {/* Story */}
      <div className="grid md:grid-cols-2 gap-10 mb-16">
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Who We Are</h2>
          <p className="text-gray-400 leading-relaxed mb-4">
            Daisy Gadgets Co. was founded with a simple vision: to offer South Africans access to the best gadgets at fair prices, backed by reliable service and genuine after-sales support.
          </p>
          <p className="text-gray-400 leading-relaxed mb-4">
            Based in Bellville, Cape Town, we serve customers across all 9 South African provinces and ship internationally. Whether you&apos;re buying an iPhone, a PS5, a solar inverter, or a new fridge — we have you covered.
          </p>
          <p className="text-gray-400 leading-relaxed">
            Our team is available by email every day to help you choose the right product, track your order, or resolve any issue.
          </p>
        </div>
        <div className="bg-[#111111] border border-[#1F1F1F] rounded-2xl p-7">
          <h3 className="text-white font-bold text-lg mb-5">Find Us</h3>
          <div className="space-y-4 text-sm">
            <div className="flex items-start gap-3">
              <MapPin size={16} color="#D4AF37" className="shrink-0 mt-0.5" />
              <div>
                <p className="text-white font-medium">Unit 7, Eagle Street</p>
                <p className="text-gray-500">Okavango Park, Bellville, Cape Town</p>
                <p className="text-gray-500">South Africa</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail size={16} color="#D4AF37" className="shrink-0" />
              <a href="mailto:daisygadgetsco@gmail.com" className="text-white hover:text-[#D4AF37] transition-colors">daisygadgetsco@gmail.com</a>
            </div>
          </div>
        </div>
      </div>

      {/* Values */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-white mb-8 text-center">Our Values</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {values.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-[#111111] border border-[#1F1F1F] rounded-2xl p-6 text-center">
              <div className="w-11 h-11 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center mx-auto mb-3">
                <Icon size={20} color="#D4AF37" strokeWidth={1.8} />
              </div>
              <h3 className="text-white font-bold text-sm mb-2">{title}</h3>
              <p className="text-gray-500 text-xs leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Coverage */}
      <div className="bg-[#111111] border border-[#1F1F1F] rounded-2xl p-8 mb-12">
        <h2 className="text-xl font-bold text-white mb-6">Where We Deliver</h2>
        <div className="flex flex-wrap gap-2">
          {areas.map((a) => (
            <span key={a} className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${
              a.includes("International") ? "border-[#D4AF37]/40 text-[#D4AF37] bg-[#D4AF37]/5" : "border-[#2a2a2a] text-gray-400"
            }`}>{a}</span>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Ready to Shop?</h2>
        <p className="text-gray-400 mb-8">Browse our full catalogue to get started.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/shop" className="btn-gold px-10 py-4 rounded-xl font-bold">Shop Now</Link>
          <Link href="/contact" className="btn-outline px-10 py-4 rounded-xl font-bold">Contact Us</Link>
        </div>
      </div>

    </div>
  );
}
