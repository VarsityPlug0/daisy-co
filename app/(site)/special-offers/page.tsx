import { getSaleProducts } from "@/lib/products";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Package, Tag } from "lucide-react";
import AddToEnquiry from "@/app/(site)/shop/AddToEnquiry";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Special Offers — 30% OFF | Daisy Gadgets Co.",
  description: "Shop our August to December special — 30% OFF Home Appliances, Tablets & Watches. Free worldwide delivery. Orders over R10,000 get an extra 25% discount.",
};

function parsePrice(p: string): number {
  return parseFloat(p.replace(/[^0-9.]/g, "")) || 0;
}

export default async function SpecialOffersPage() {
  const products = getSaleProducts();

  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-8 py-16">

      {/* Header banner */}
      <div className="relative rounded-3xl overflow-hidden p-12 md:p-20 text-center mb-14"
        style={{ background: "linear-gradient(135deg, #C9971C, #D4AF37, #F0CE6A, #D4AF37, #C9971C)" }}>
        <div className="relative z-10">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Tag size={20} color="#0A0A0A" />
            <span style={{ fontSize: 12, fontFamily: "var(--font-outfit)", fontWeight: 800, color: "#0A0A0A", letterSpacing: "0.15em", textTransform: "uppercase" }}>
              Limited Time — Aug to Dec
            </span>
            <Tag size={20} color="#0A0A0A" />
          </div>
          <h1 style={{ fontFamily: "var(--font-outfit)", fontWeight: 900, fontSize: "clamp(2.5rem, 6vw, 4.5rem)", color: "#0A0A0A", lineHeight: 1.05, marginBottom: 12 }}>
            30% OFF Everything
          </h1>
          <p style={{ color: "#1a1200", fontSize: 15, fontWeight: 600, marginBottom: 6 }}>
            Home Appliances · Tablets · Watches
          </p>
          <p style={{ color: "#1a1200", fontSize: 17, fontWeight: 500, marginBottom: 8 }}>
            Plus orders over R10,000 receive an additional 25% bulk discount.
          </p>
          <p style={{ color: "#2a2000", fontSize: 13 }}>
            Free worldwide delivery included on all orders.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-5 mb-8">
        <h2 className="text-2xl font-bold text-white">Home Appliances, Tablets & Watches on Sale</h2>
        <div className="flex-1 h-px bg-[#1F1F1F]" />
        <span className="text-[#D4AF37] text-sm font-semibold">{products.length} products</span>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-16">
          <Package size={48} color="#2a2a2a" strokeWidth={1} className="mx-auto mb-4" />
          <p className="text-gray-500">No products available right now. Check back soon!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((p) => {
            const original = Math.round(parsePrice(p.price) / 0.7);
            const originalDisplay = p.originalPrice || `R ${original.toLocaleString()}`;
            return (
              <Link key={p.id} href={`/shop/${p.id}`}
                className="bg-[#111111] border border-[#1F1F1F] rounded-2xl overflow-hidden card-hover flex flex-col group">
                <div className="relative h-64 bg-[#0f0f0f] overflow-hidden">
                  {p.imageUrl ? (
                    <Image src={p.imageUrl} alt={p.name} fill
                      className="object-contain transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package size={48} color="#2a2a2a" strokeWidth={1} />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#111111]/70 to-transparent" />
                  <span className="absolute top-3 left-3 btn-gold text-[10px] font-bold px-3 py-1 rounded-full">30% OFF</span>
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <p className="text-xs text-[#D4AF37] uppercase tracking-wider mb-2">{p.category}</p>
                  <p className="font-medium text-white text-sm leading-snug mb-2 flex-1">{p.name}</p>
                  <div className="flex items-center gap-2 mb-3">
                    <p className="text-[#D4AF37] font-bold text-xl">{originalDisplay}</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="w-full py-2.5 rounded-xl text-sm font-semibold text-center text-white border border-[#2a2a2a] group-hover:border-[#D4AF37]/50 transition-colors">
                      View Details
                    </div>
                    <AddToEnquiry id={p.id} name={p.name} price={p.price} imageUrl={p.imageUrl} category={p.category} />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <div className="mt-12 bg-[#111111] border border-[#1F1F1F] rounded-2xl p-7 text-center">
        <p className="text-gray-400 text-sm mb-4">Need a specific product? We source anything. Contact us.</p>
        <Link href="/contact" className="btn-gold px-10 py-3.5 rounded-xl font-bold">Contact Us</Link>
      </div>
    </div>
  );
}
