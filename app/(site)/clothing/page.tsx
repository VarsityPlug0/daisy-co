import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getClothingProducts } from "@/lib/products";
import AddToEnquiry from "@/app/(site)/shop/AddToEnquiry";
import {
  Shirt, Sparkles, Flame, Footprints, Tag, ShieldCheck,
  Truck, RefreshCw, ArrowRight, Star, ShoppingBag, Eye
} from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Clothing & Streetwear — Premium Fashion | Daisy & Co.",
  description: "Shop premium urban clothing, heavyweight hoodies, streetwear, sneakers, caps and designer fashion. Fast delivery across South Africa.",
};

const FEATURED_CATS = [
  {
    name: "Hoodies & Streetwear",
    cat: "Hoodies & Streetwear",
    desc: "Heavyweight fleece & oversized drops",
    img: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=85",
    tag: "Coming Soon",
  },
  {
    name: "Men's Wear",
    cat: "Men's Wear",
    desc: "Urban jackets, essential tees & denim",
    img: "https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?w=800&auto=format&fit=crop&q=85",
    tag: "Coming Soon",
  },
  {
    name: "Women's Fashion",
    cat: "Women's Fashion",
    desc: "Chic knitwear, athleisure & modern fits",
    img: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=85",
    tag: "Coming Soon",
  },
  {
    name: "Sneakers & Kicks",
    cat: "Sneakers & Shoes",
    desc: "Retro high-tops & lifestyle footwear",
    img: "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=800&auto=format&fit=crop&q=85",
    tag: "Coming Soon",
  },
  {
    name: "Caps & Accessories",
    cat: "Caps & Accessories",
    desc: "Embroidered snapbacks & beanies",
    img: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800&auto=format&fit=crop&q=85",
    tag: "Coming Soon",
  },
];

export default function ClothingPage() {
  const allClothing = getClothingProducts();

  return (
    <div className="min-h-screen">
      {/* Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#141414] to-[#0A0A0A] border-b border-[#1F1F1F] py-16 md:py-24">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:24px_24px]" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            {/* Hero Text */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#D4AF37] text-xs font-bold uppercase tracking-wider animate-pulse">
                <Sparkles size={14} /> Coming Soon — Official Streetwear Drop
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-[1.1]">
                Urban Luxury & <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#AA771C]">
                  Streetwear — Coming Soon
                </span>
              </h1>

              <p className="text-gray-300 text-base sm:text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Elevate your daily rotation with upcoming heavyweight cotton hoodies, signature graphic drops, premium footwear, and streetwear accessories. Pre-register to get notified first on launch day.
              </p>

              <div className="flex flex-wrap gap-4 justify-center lg:justify-start pt-2">
                <a
                  href="mailto:daisygadgetsco@gmail.com?subject=Notify%20me%20when%20Clothing%20%26%20Streetwear%20drops"
                  className="btn-gold px-8 py-4 rounded-xl font-extrabold text-sm flex items-center gap-2 shadow-xl shadow-[#D4AF37]/20"
                >
                  <Sparkles size={16} /> Notify Me on Drop
                </a>
                <a
                  href="#catalog"
                  className="px-6 py-4 rounded-xl font-bold text-sm text-gray-300 border border-[#2a2a2a] bg-[#141414] hover:bg-[#1f1f1f] hover:text-white hover:border-gray-500 transition-all flex items-center gap-2"
                >
                  <Eye size={16} className="text-[#D4AF37]" /> Preview Drop Catalog
                </a>
              </div>

              {/* Guarantees */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-[#1F1F1F] max-w-lg mx-auto lg:mx-0">
                <div className="flex flex-col items-center lg:items-start text-xs text-gray-400">
                  <Truck size={18} className="text-[#D4AF37] mb-1" />
                  <span className="font-bold text-white">Same-Day SA Delivery</span>
                  <span>Fast shipping</span>
                </div>
                <div className="flex flex-col items-center lg:items-start text-xs text-gray-400">
                  <RefreshCw size={18} className="text-[#D4AF37] mb-1" />
                  <span className="font-bold text-white">Free Size Swaps</span>
                  <span>7-day return policy</span>
                </div>
                <div className="flex flex-col items-center lg:items-start text-xs text-gray-400">
                  <ShieldCheck size={18} className="text-[#D4AF37] mb-1" />
                  <span className="font-bold text-white">100% Quality</span>
                  <span>Premium fabrics</span>
                </div>
              </div>
            </div>

            {/* Hero Visual Collage */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md aspect-[4/5] rounded-3xl overflow-hidden border border-[#D4AF37]/40 shadow-2xl shadow-black/80">
                <Image
                  src="https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=900&auto=format&fit=crop&q=90"
                  alt="Daisy Streetwear Model Coming Soon"
                  fill
                  priority
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent" />
                <div className="absolute top-4 right-4 bg-[#D4AF37] text-black font-black text-[11px] uppercase tracking-wider px-3 py-1 rounded-full shadow-lg">
                  COMING SOON
                </div>
                <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-black/70 backdrop-blur-md border border-white/10">
                  <p className="text-xs text-[#D4AF37] font-bold uppercase tracking-wider">Upcoming Drop</p>
                  <h2 className="text-lg font-bold text-white">Daisy Acid-Wash Vintage Graphic Hoodie</h2>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-white font-extrabold">R 950 <span className="text-xs text-gray-400 font-normal line-through">R 1,350</span></span>
                    <span className="text-[10px] bg-[#D4AF37]/20 border border-[#D4AF37] text-[#D4AF37] font-bold px-2.5 py-0.5 rounded-full">DROPPING SOON</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Department Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 py-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <p className="text-[#D4AF37] text-xs uppercase tracking-widest font-bold mb-2">Explore Departments</p>
            <h2 className="text-3xl font-extrabold text-white">Upcoming Collections</h2>
          </div>
          <Link href="/shop" className="text-sm font-semibold text-gray-400 hover:text-[#D4AF37] flex items-center gap-1.5 transition-colors">
            View full store <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {FEATURED_CATS.map((c) => (
            <Link
              key={c.name}
              href={`/shop?cat=${encodeURIComponent(c.cat)}`}
              className="group relative rounded-2xl overflow-hidden aspect-[3/4] bg-[#111111] border border-[#1F1F1F] hover:border-[#D4AF37]/50 transition-all shadow-lg hover:shadow-xl hover:shadow-[#D4AF37]/10"
            >
              <Image
                src={c.img}
                alt={c.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
              <div className="absolute top-3 left-3">
                <span className="text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#0A0A0A]/90 text-[#D4AF37] border border-[#D4AF37]/40 backdrop-blur-sm">
                  {c.tag}
                </span>
              </div>
              <div className="absolute bottom-4 left-4 right-4 space-y-1">
                <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-[#D4AF37] transition-colors">
                  {c.name}
                </h3>
                <p className="text-[11px] text-gray-400 line-clamp-1">{c.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Live Clothing Products Catalog */}
      <section id="catalog" className="max-w-7xl mx-auto px-4 sm:px-8 py-10 scroll-mt-24">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 border-b border-[#1F1F1F] pb-6">
          <div>
            <span className="text-xs text-[#D4AF37] font-bold uppercase tracking-wider">Preview Drop</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Apparel & Footwear Preview (Coming Soon)</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/shop?cat=Clothing%20%26%20Apparel" className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[#D4AF37] text-black">
              All Apparel
            </Link>
            <Link href="/shop?cat=Men%27s%20Wear" className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[#141414] text-gray-300 border border-[#222] hover:text-white">
              Men's
            </Link>
            <Link href="/shop?cat=Women%27s%20Fashion" className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[#141414] text-gray-300 border border-[#222] hover:text-white">
              Women's
            </Link>
            <Link href="/shop?cat=Hoodies%20%26%20Streetwear" className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[#141414] text-gray-300 border border-[#222] hover:text-white">
              Hoodies
            </Link>
            <Link href="/shop?cat=Sneakers%20%26%20Shoes" className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[#141414] text-gray-300 border border-[#222] hover:text-white">
              Sneakers
            </Link>
          </div>
        </div>

        {allClothing.length === 0 ? (
          <div className="text-center py-16 bg-[#111111] rounded-3xl border border-[#1F1F1F] space-y-4">
            <Shirt size={48} className="mx-auto text-gray-600" />
            <h3 className="text-lg font-bold text-white">New Apparel Drop Arriving Shortly</h3>
            <p className="text-sm text-gray-400 max-w-md mx-auto">
              We are adding new hoodies, jackets, sneakers and caps. You can check the complete store or contact our team directly for custom sizes.
            </p>
            <Link href="/shop" className="btn-gold inline-flex px-6 py-3 rounded-xl text-xs font-bold">
              Browse Entire Shop
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {allClothing.map((product) => (
              <div
                key={product.id}
                className="group flex flex-col bg-[#111111] border border-[#1F1F1F] rounded-2xl overflow-hidden hover:border-[#D4AF37]/40 transition-all hover:shadow-xl hover:shadow-[#D4AF37]/5"
              >
                {/* Product Image */}
                <Link href={`/shop/${product.id}`} className="relative aspect-square overflow-hidden bg-[#0A0A0A]">
                  <Image
                    src={product.imageUrl || "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=85"}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-2.5 right-2.5 bg-[#D4AF37] text-black text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded shadow-md">
                    COMING SOON
                  </span>
                  <span className="absolute bottom-2.5 left-2.5 bg-black/75 backdrop-blur-sm text-gray-300 text-[10px] font-medium px-2 py-0.5 rounded border border-white/10">
                    {product.category}
                  </span>
                </Link>

                {/* Details */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <Link href={`/shop/${product.id}`} className="block">
                      <h3 className="text-sm font-bold text-white group-hover:text-[#D4AF37] transition-colors line-clamp-2 leading-snug">
                        {product.name}
                      </h3>
                    </Link>
                    <p className="text-[11px] text-gray-400 mt-1 line-clamp-1">
                      {product.description || "Sizes: XS, S, M, L, XL, 2XL"}
                    </p>
                  </div>

                  <div className="space-y-3 pt-2 border-t border-[#1a1a1a]">
                    <div className="flex items-baseline justify-between">
                      <span className="text-base font-extrabold text-[#D4AF37]">{product.price}</span>
                      {product.originalPrice && (
                        <span className="text-xs text-gray-500 line-through">{product.originalPrice}</span>
                      )}
                    </div>
                    <AddToEnquiry
                      id={product.id}
                      name={product.name}
                      price={product.price}
                      originalPrice={product.originalPrice}
                      imageUrl={product.imageUrl}
                      category={product.category}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Style & Fit Reassurance */}
      <section className="bg-[#111111] border-t border-[#1F1F1F] py-16 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
            <h2 className="text-3xl font-extrabold text-white">How Our Sizing Works</h2>
            <p className="text-gray-400 text-sm">
              We know ordering clothing online should be effortless. Every item comes with standardized measurements and hassle-free size exchanges.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-[#141414] border border-[#222] rounded-2xl p-6 space-y-3 text-center">
              <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/10 text-[#D4AF37] flex items-center justify-center mx-auto text-xl font-bold">
                1
              </div>
              <h3 className="text-base font-bold text-white">True to Size & Relaxed Fits</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Hoodies and tees are cut with modern streetwear proportions — generous shoulders with clean drape. Order your normal size or size up for baggy fit.
              </p>
            </div>

            <div className="bg-[#141414] border border-[#222] rounded-2xl p-6 space-y-3 text-center">
              <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/10 text-[#D4AF37] flex items-center justify-center mx-auto text-xl font-bold">
                2
              </div>
              <h3 className="text-base font-bold text-white">Heavy 380+ GSM Fabrics</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                We use thick combed cotton fleece and preshrunk textiles to prevent shrinkage and color fade in the wash.
              </p>
            </div>

            <div className="bg-[#141414] border border-[#222] rounded-2xl p-6 space-y-3 text-center">
              <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/10 text-[#D4AF37] flex items-center justify-center mx-auto text-xl font-bold">
                3
              </div>
              <h3 className="text-base font-bold text-white">Instant Size Exchanges</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                If the size doesn't fit exactly as you like, email us and our courier will swap it at your door within 1–3 business days.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}