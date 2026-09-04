import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { getProducts } from "@/lib/products";
import { isClothingCategory, isDeviceCategory } from "@/lib/categories";
import {
  Smartphone, Tv, Gamepad2, Laptop, Package,
  ShieldCheck, Truck, BadgeCheck, Headphones,
  Star, ChevronRight, Zap, Tag, Sparkles,
} from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Daisy Gadgets Co. | Premium Gadgets — Worldwide Shipping",
  description: "Shop iPhones, Smart TVs, PS5, Xbox, Gaming PCs, MacBooks, Laptops, Solar Inverters, Home Appliances & more. Same-day delivery in South Africa. Free worldwide shipping.",
  alternates: { canonical: "https://daisygadgetsco.com" },
  openGraph: {
    title: "Daisy Gadgets Co. | Premium Gadgets — Worldwide Shipping",
    description: "Shop iPhones, Smart TVs, PS5, Xbox, Gaming PCs, MacBooks, Laptops, Solar & more. 30% OFF August to December. Same-day delivery in South Africa.",
    url: "https://daisygadgetsco.com",
    type: "website",
  },
};

const CATEGORIES = [
  { label: "Smartphones",        href: "/shop?cat=Smartphones",                      icon: Smartphone,  color: "#3B82F6" },
  { label: "Smart TVs",          href: "/shop?cat=TVs",                              icon: Tv,           color: "#8B5CF6" },
  { label: "Gaming Consoles",    href: "/shop?cat=Gaming%20Consoles",                icon: Gamepad2,     color: "#EF4444" },
  { label: "Gaming PCs",         href: "/shop?cat=Gaming%20PCs",                     icon: Gamepad2,     color: "#F59E0B" },
  { label: "Laptops & MacBooks", href: "/shop?cat=Laptops%20%26%20MacBooks",         icon: Laptop,       color: "#10B981" },
  { label: "Home Appliances",    href: "/shop?cat=Home%20Appliances",                icon: Package,      color: "#06B6D4" },
  { label: "Solar & Power",      href: "/shop?cat=Solar%20%26%20Power%20Solutions",  icon: Zap,          color: "#D4AF37" },
  { label: "All Products",       href: "/shop",                                      icon: Package,      color: "#6B7280" },
];

const REVIEWS = [
  { name: "Thabo M.", location: "Johannesburg", stars: 5, text: "Received my PS5 in perfect condition. Delivery was incredibly fast. Will definitely buy again!", product: "PlayStation 5" },
  { name: "Sarah K.", location: "Cape Town",    stars: 5, text: "The iPhone I ordered was exactly as described. Came sealed in original packaging. Brilliant service!", product: "iPhone 15 Pro" },
  { name: "Mpho D.", location: "Durban",        stars: 5, text: "Ordered a Samsung TV during the special and saved a fortune. Setup support via WhatsApp was amazing.", product: "Samsung 65\" QLED" },
  { name: "Riaan V.", location: "Pretoria",     stars: 5, text: "Solar inverter system arrived well-packaged. The team guided me through everything on WhatsApp.", product: "5kVA Inverter Bundle" },
];

const TRUST = [
  { icon: ShieldCheck, title: "Secure Payments",     desc: "EFT, PayShap & card payments. SSL-secured checkout." },
  { icon: Truck,       title: "Worldwide Shipping",  desc: "We ship globally. Same-day delivery available in South Africa." },
  { icon: BadgeCheck,  title: "Authentic Products",  desc: "100% genuine products. All items come with full manufacturer warranty." },
  { icon: Headphones,  title: "Email Support",       desc: "Real human support by email. We respond quickly." },
];

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Daisy Gadgets Co.",
  url: "https://daisygadgetsco.com",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: "https://daisygadgetsco.com/shop?q={search_term_string}",
    },
    "query-input": "required name=search_term_string",
  },
};

export default async function HomePage() {
  const allProducts = getProducts().filter((p) => p.inStock);
  const featuredDevices = allProducts.filter((p) => isDeviceCategory(p.category) && p.featured).slice(0, 8);
  const featuredClothing = allProducts.filter((p) => isClothingCategory(p.category)).slice(0, 4);
  const newArrivals = allProducts.slice(-8).reverse();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
    <div className="overflow-x-hidden">

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative min-h-[88vh] flex items-center" style={{ background: "linear-gradient(135deg, #0A0A0A 0%, #111111 50%, #0f0d08 100%)" }}>
        {/* Radial glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div style={{ position: "absolute", top: "10%", left: "50%", transform: "translateX(-50%)", width: 900, height: 500, background: "radial-gradient(ellipse, rgba(212,175,55,0.08) 0%, transparent 70%)", borderRadius: "50%" }} />
        </div>

        <div className="max-w-7xl mx-auto px-5 sm:px-8 w-full py-20 md:py-28 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-full px-4 py-2 mb-6">
              <Tag size={12} color="#D4AF37" />
              <span style={{ fontSize: 11, fontFamily: "var(--font-outfit)", fontWeight: 700, color: "#D4AF37", letterSpacing: "0.08em" }}>SPECIAL OFFERS — AUG TO DEC</span>
            </div>
            <h1 style={{ fontFamily: "var(--font-outfit)", fontWeight: 900, fontSize: "clamp(2.4rem,5vw,4rem)", lineHeight: 1.08, color: "#fff", marginBottom: "1.5rem" }}>
              Premium Gadgets<br />
              <span className="gold-text">For Everyday</span><br />
              Convenience.
            </h1>
            <p className="text-gray-400 text-lg leading-relaxed mb-8 max-w-md">
              iPhones, Smart TVs, Gaming, MacBooks, Appliances, Solar & more. Free worldwide delivery. Same-day in South Africa.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/shop" className="btn-gold px-8 py-4 rounded-xl font-bold text-base flex items-center gap-2">
                Shop Now <ChevronRight size={16} />
              </Link>
              <Link href="/special-offers" className="btn-outline px-8 py-4 rounded-xl font-bold text-base">
                View Offers
              </Link>
            </div>
            <div className="flex flex-wrap gap-6 mt-10">
              {["Free Worldwide Delivery", "25% Off R10k+ Orders", "Authentic Products"].map((b) => (
                <div key={b} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
                  <span style={{ fontSize: 12, color: "#9CA3AF", fontFamily: "var(--font-outfit)", fontWeight: 500 }}>{b}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Hero image grid */}
          <div className="hidden md:grid grid-cols-2 gap-3">
            {[
              "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=300&fit=crop",
              "https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=400&h=300&fit=crop",
              "https://images.unsplash.com/photo-1547394765-185e1e68f34e?w=400&h=300&fit=crop",
              "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop",
            ].map((src, i) => (
              <div key={i} className={`relative rounded-2xl overflow-hidden ${i === 0 ? "row-span-2 h-64" : "h-[118px]"}`}>
                <Image src={src} alt="gadget" fill className="object-cover" sizes="300px" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Category Grid ────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 py-20">
        <div className="text-center mb-12">
          <p className="section-label mb-3">Browse by Category</p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white">Shop <span className="gold-text">Everything</span></h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {CATEGORIES.map(({ label, href, icon: Icon, color }) => (
            <Link key={label} href={href}
              className="bg-[#111111] border border-[#1F1F1F] rounded-2xl p-5 flex flex-col items-center gap-3 text-center card-hover group">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${color}18` }}>
                <Icon size={22} color={color} strokeWidth={1.8} />
              </div>
              <span style={{ fontSize: 13, fontFamily: "var(--font-outfit)", fontWeight: 600, color: "#D1D5DB" }}
                className="group-hover:text-[#D4AF37] transition-colors">{label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Special Offer Banner ─────────────────────────────────── */}
      <section className="mx-4 sm:mx-8 lg:mx-auto max-w-7xl mb-8">
        <div className="relative rounded-3xl overflow-hidden p-10 md:p-16 text-center"
          style={{ background: "linear-gradient(135deg, #C9971C, #D4AF37, #F0CE6A, #D4AF37, #C9971C)" }}>
          <div className="relative z-10">
            <p style={{ fontSize: 11, fontFamily: "var(--font-outfit)", fontWeight: 800, letterSpacing: "0.15em", color: "#0A0A0A", textTransform: "uppercase", marginBottom: 8 }}>Limited Time</p>
            <h2 style={{ fontFamily: "var(--font-outfit)", fontWeight: 900, fontSize: "clamp(2rem,5vw,3.5rem)", color: "#0A0A0A", lineHeight: 1.1, marginBottom: 12 }}>
              30% OFF Selected Products
            </h2>
            <p style={{ color: "#1a1a00", fontSize: 16, marginBottom: 28, fontWeight: 500 }}>
              Home Appliances · Tablets · Watches — Orders over R10,000 get an extra 25% discount
            </p>
            <Link href="/special-offers"
              className="inline-flex items-center gap-2 bg-[#0A0A0A] text-[#D4AF37] font-bold px-8 py-4 rounded-xl text-sm hover:bg-[#111] transition-colors">
              Shop the Sale <ChevronRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Featured Tech & Devices ───────────────────────────── */}
      {featuredDevices.length > 0 && (
        <section className="max-w-7xl mx-auto px-5 sm:px-8 py-16">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="section-label mb-2">⚡ Hand-picked Devices</p>
              <h2 className="text-3xl font-extrabold text-white">Featured <span className="gold-text">Devices & Tech</span></h2>
            </div>
            <Link href="/shop" className="text-[#D4AF37] text-sm font-semibold flex items-center gap-1 hover:gap-2 transition-all">
              View All Tech <ChevronRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {featuredDevices.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* ── Streetwear & Apparel Drop (Coming Soon) ────────────── */}
      {featuredClothing.length > 0 && (
        <section className="max-w-7xl mx-auto px-5 sm:px-8 py-16 border-t border-[#1F1F1F]">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#D4AF37] text-xs font-bold uppercase tracking-wider mb-2">
                <Sparkles size={13} /> Official Drop Preview
              </div>
              <h2 className="text-3xl font-extrabold text-white">Daisy Streetwear <span className="gold-text">Collection</span></h2>
              <p className="text-gray-400 text-sm mt-1">Preview upcoming heavyweight hoodies, jackets, retro kicks and urban essentials.</p>
            </div>
            <Link href="/clothing" className="btn-gold px-6 py-3 rounded-xl text-xs font-bold shrink-0 inline-flex items-center gap-1.5 self-start sm:self-auto">
              Preview Clothing Hub <ChevronRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {featuredClothing.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* ── New Arrivals ─────────────────────────────────────────── */}
      {newArrivals.length > 0 && (
        <section className="max-w-7xl mx-auto px-5 sm:px-8 pb-20 border-t border-[#1F1F1F] pt-16">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="section-label mb-2">Just landed</p>
              <h2 className="text-3xl font-extrabold text-white">New <span className="gold-text">Arrivals</span></h2>
            </div>
            <Link href="/new-arrivals" className="text-[#D4AF37] text-sm font-semibold flex items-center gap-1 hover:gap-2 transition-all">
              See All <ChevronRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {newArrivals.slice(0, 4).map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* ── Why Choose Us ────────────────────────────────────────── */}
      <section style={{ background: "#111111", borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-20">
          <div className="text-center mb-14">
            <p className="section-label mb-3">Why Daisy Gadgets Co.</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white">Your Trusted <span className="gold-text">Gadget Partner</span></h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {TRUST.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-[#0d0d0d] border border-[#1F1F1F] rounded-2xl p-6 text-center">
                <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center mx-auto mb-4">
                  <Icon size={22} color="#D4AF37" strokeWidth={1.8} />
                </div>
                <h3 style={{ fontFamily: "var(--font-outfit)", fontWeight: 700, fontSize: 15, color: "#fff", marginBottom: 8 }}>{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Customer Reviews ─────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 py-20">
        <div className="text-center mb-12">
          <p className="section-label mb-3">Happy Customers</p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white">What Our <span className="gold-text">Customers Say</span></h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {REVIEWS.map((r) => (
            <div key={r.name} className="bg-[#111111] border border-[#1F1F1F] rounded-2xl p-6">
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: r.stars }).map((_, i) => (
                  <Star key={i} size={14} fill="#D4AF37" color="#D4AF37" />
                ))}
              </div>
              <p className="text-gray-300 text-sm leading-relaxed mb-4">&ldquo;{r.text}&rdquo;</p>
              <div className="border-t border-[#1F1F1F] pt-4">
                <p style={{ fontFamily: "var(--font-outfit)", fontWeight: 700, fontSize: 13, color: "#fff" }}>{r.name}</p>
                <p className="text-xs text-gray-600">{r.location} &middot; {r.product}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link href="/reviews" className="btn-outline px-8 py-3.5 rounded-xl font-semibold text-sm">
            Read More Reviews
          </Link>
        </div>
      </section>

      {/* ── Contact CTA ─────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 pb-24">
        <div className="bg-[#111111] border border-[#1F1F1F] rounded-3xl p-12 text-center">
          <h2 className="text-3xl font-extrabold text-white mb-4">Need Help Choosing?</h2>
          <p className="text-gray-400 text-base leading-relaxed mb-8 max-w-xl mx-auto">
            Contact our team. We&apos;ll help you find the perfect gadget, check availability, and get you the best deal.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact" className="btn-gold px-10 py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2">
              Contact Us
            </Link>
            <Link href="/shop" className="btn-outline px-10 py-4 rounded-xl font-bold text-base">
              Browse Products
            </Link>
          </div>
        </div>
      </section>

    </div>
    </>
  );
}

function ProductCard({ product }: { product: ReturnType<typeof getProducts>[0] }) {
  const isClothing = isClothingCategory(product.category);

  return (
    <Link href={`/shop/${product.id}`}
      className="bg-[#111111] border border-[#1F1F1F] rounded-2xl overflow-hidden card-hover flex flex-col group">
      <div className="relative h-64 bg-[#0f0f0f] overflow-hidden">
        {product.imageUrl ? (
          <Image src={product.imageUrl} alt={product.name} fill
            className={`${isClothing ? "object-cover" : "object-contain"} transition-transform duration-500 group-hover:scale-105`}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package size={40} color="#2a2a2a" strokeWidth={1} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#111111]/60 to-transparent" />
        {isClothing ? (
          <span className="absolute top-3 right-3 bg-[#D4AF37] text-black text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-lg">
            COMING SOON
          </span>
        ) : product.featured ? (
          <span className="absolute top-3 left-3 btn-gold text-[10px] font-bold px-2.5 py-1 rounded-full">Featured</span>
        ) : null}
      </div>
      <div className="p-5 flex flex-col flex-1">
        <p className="text-[10px] text-[#D4AF37] uppercase tracking-wider mb-1.5">{product.category}</p>
        <p className="font-semibold text-white text-sm leading-snug mb-2 flex-1 line-clamp-2">{product.name}</p>
        <p className="text-[#D4AF37] font-bold text-lg mb-3">{product.price}</p>
        <div className="w-full py-2.5 rounded-xl text-xs font-semibold text-center text-white border border-[#2a2a2a] group-hover:border-[#D4AF37]/50 transition-colors">
          {isClothing ? "Preview Item (Soon)" : "View Details"}
        </div>
      </div>
    </Link>
  );
}
