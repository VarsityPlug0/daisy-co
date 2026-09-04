import type { Metadata } from "next";
import Link from "next/link";
import { Truck, MapPin, Clock, Globe, Package } from "lucide-react";

export const metadata: Metadata = {
  title: "Delivery Information | Daisy Gadgets Co.",
  description: "Learn about our delivery options, timeframes, and shipping coverage. Same-day delivery in South Africa. Worldwide shipping available.",
};

export default function DeliveryPage() {
  return (
    <div className="max-w-4xl mx-auto px-5 sm:px-8 py-20">

      <div className="text-center mb-14">
        <p className="section-label mb-3">Shipping & Delivery</p>
        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
          Delivery <span className="gold-text">Information</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-xl mx-auto">
          We deliver nationwide across South Africa and ship worldwide. Here&apos;s everything you need to know.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-5 mb-12">
        {[
          { icon: Clock,   title: "Same-Day Delivery",    desc: "Available in Cape Town metro & select Johannesburg areas. Order before 11am.", highlight: true },
          { icon: Truck,   title: "Nationwide (1–3 Days)", desc: "Door-to-door delivery across all 9 South African provinces via courier." },
          { icon: Globe,   title: "International Shipping", desc: "We ship worldwide. Rates and timelines vary by country. Contact us for a quote." },
          { icon: Package, title: "Secure Packaging",      desc: "All products are carefully packaged to prevent damage in transit." },
        ].map(({ icon: Icon, title, desc, highlight }) => (
          <div key={title} className={`rounded-2xl p-6 border ${highlight ? "bg-[#D4AF37]/5 border-[#D4AF37]/30" : "bg-[#111111] border-[#1F1F1F]"}`}>
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center shrink-0">
                <Icon size={20} color="#D4AF37" strokeWidth={1.8} />
              </div>
              <div>
                <h3 className="text-white font-bold text-sm mb-1.5">{title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-[#111111] border border-[#1F1F1F] rounded-2xl overflow-hidden mb-8">
        <div className="p-6 border-b border-[#1F1F1F]">
          <h2 className="text-lg font-bold text-white">Delivery Timeframes</h2>
        </div>
        <div className="divide-y divide-[#1F1F1F]">
          {[
            ["Cape Town Metro",              "Same-day (before 11am) / Next day"],
            ["Johannesburg / Gauteng",        "1–2 business days"],
            ["Durban / KZN",                  "2–3 business days"],
            ["Eastern Cape",                  "2–3 business days"],
            ["Other SA Provinces",            "2–4 business days"],
            ["Remote / Rural Areas",          "3–5 business days"],
            ["International (Africa)",        "5–10 business days"],
            ["International (Rest of World)", "7–14 business days"],
          ].map(([location, time]) => (
            <div key={location as string} className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-3">
                <MapPin size={14} color="#6B7280" />
                <span className="text-gray-300 text-sm">{location as string}</span>
              </div>
              <span className="text-[#D4AF37] text-sm font-semibold">{time as string}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4 mb-12">
        <h2 className="text-xl font-bold text-white">Frequently Asked</h2>
        {[
          ["Is delivery free?", "Yes! We offer free delivery on all orders within South Africa and free worldwide shipping. No minimum order required."],
          ["How do I track my order?", "Once your payment is confirmed, you'll receive a tracking number via email. You can also use our Track Order page."],
          ["Can I change my delivery address?", "Contact us as soon as possible after placing your order. We can update your address before dispatch."],
          ["What if my order arrives damaged?", "Contact us immediately via email with photos. We'll arrange a replacement or refund under our returns policy."],
        ].map(([q, a]) => (
          <details key={q as string} className="group bg-[#111111] border border-[#1F1F1F] rounded-2xl overflow-hidden">
            <summary className="flex items-center justify-between px-6 py-5 cursor-pointer select-none list-none">
              <span style={{ fontFamily: "var(--font-outfit)", fontWeight: 600, fontSize: 14, color: "#F0F0F0" }}>{q as string}</span>
              <svg className="shrink-0 ml-3 transition-transform duration-200 group-open:rotate-180" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="2.5"><path d="M6 9l6 6 6-6" /></svg>
            </summary>
            <p className="px-6 pb-5 text-gray-400 text-sm leading-relaxed border-t border-[#1F1F1F] pt-4">{a as string}</p>
          </details>
        ))}
      </div>

      <div className="bg-[#111111] border border-[#D4AF37]/20 rounded-2xl p-8 text-center">
        <h3 className="text-xl font-bold text-white mb-3">Need a delivery quote?</h3>
        <p className="text-gray-400 text-sm mb-6">Contact us for international shipping quotes and special delivery arrangements.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/contact" className="btn-gold px-8 py-3.5 rounded-xl font-bold">Contact Us</Link>
          <Link href="/track-order" className="btn-outline px-8 py-3.5 rounded-xl font-bold">Track My Order</Link>
        </div>
      </div>

    </div>
  );
}
