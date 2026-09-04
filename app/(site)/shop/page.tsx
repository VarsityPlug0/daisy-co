import { getProducts } from "@/lib/products";
import { isClothingCategory, isDeviceCategory, DEVICE_CATEGORIES, CLOTHING_CATEGORIES } from "@/lib/categories";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Package, Smartphone, Shirt, Sparkles, ArrowRight } from "lucide-react";
import { Suspense } from "react";
import ShopFilters from "./ShopFilters";
import AddToEnquiry from "./AddToEnquiry";

export const dynamic = "force-dynamic";

const CAT_META: Record<string, { title: string; description: string }> = {
  "Smartphones":             { title: "Smartphones — iPhones & Android",               description: "Shop iPhones, Samsung Galaxy, and more. 100% authentic with full warranty. Fast delivery across South Africa." },
  "TVs":                     { title: "Smart TVs — Samsung, LG, Hisense",              description: "4K and OLED Smart TVs from Samsung, LG, Hisense and more. Great prices with free delivery in South Africa." },
  "Gaming Consoles":         { title: "Gaming Consoles — PS5, Xbox & More",            description: "Buy PS5, Xbox Series X/S and gaming accessories. 100% authentic with full warranty." },
  "Gaming PCs":              { title: "Gaming PCs — High-Performance Rigs",            description: "Pre-built gaming PCs with RTX and AMD Ryzen. Ready to game out of the box." },
  "Laptops & MacBooks":      { title: "Laptops & MacBooks",                             description: "Windows laptops and Apple MacBooks for work, study and creative use. M3 chip MacBooks available." },
  "Tablets & Watches":       { title: "Tablets & Watches — iPads & Apple Watch",       description: "Shop iPads and Apple Watches. Sealed, authentic devices delivered fast." },
  "Clothing & Apparel":      { title: "Clothing & Apparel — Urban & Streetwear",       description: "Explore premium fashion, streetwear, sneakers, hoodies and accessories. Free delivery available." },
  "Men's Wear":              { title: "Men's Clothing & Essentials",                   description: "Shop men's jackets, hoodies, tees, denim and urban wear. Quality fits and fast delivery." },
  "Women's Fashion":         { title: "Women's Fashion & Apparel",                     description: "Trendy women's sets, dresses, cardigans and athleisure at unbeatable prices." },
  "Hoodies & Streetwear":    { title: "Hoodies & Streetwear Collections",              description: "Heavyweight premium oversized hoodies, crewnecks and graphic streetwear." },
  "Sneakers & Shoes":        { title: "Sneakers & Footwear",                           description: "Retro high-tops, urban lifestyle sneakers and performance runners." },
  "Caps & Accessories":      { title: "Caps, Beanies & Fashion Accessories",           description: "Snapbacks, beanies, bags and accessories to elevate your fit." },
  "Home Appliances":         { title: "Home Appliances — Fridges, Washers & More",     description: "Fridges, washing machines, dishwashers and more from trusted brands. Delivered to your door." },
  "Kitchen Appliances":      { title: "Kitchen Appliances — Ovens, Hobs & More",       description: "Ovens, hobs, espresso machines and kitchen tech at great prices." },
  "Solar & Power Solutions": { title: "Solar & Power Solutions — Inverters & Batteries", description: "Load-shedding solutions: 5kVA–10kVA inverters, lithium batteries and solar panels for home and business." },
  "Electric Ride-On Cars":   { title: "Kids Electric Ride-On Cars",                    description: "Licensed Mercedes and premium electric ride-on cars for kids. Safe, fun and fast delivery." },
  "Furniture":               { title: "Furniture — Sofas, Beds & More",                description: "Quality furniture delivered to your home. Sofas, beds, dining sets and more." },
  "Office Equipment":        { title: "Office Equipment — Printers & Tech",            description: "Printers, shredders and office technology for home and business use." },
};

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ cat?: string; q?: string }> }): Promise<Metadata> {
  const { cat, q } = await searchParams;
  if (q) {
    return {
      title: `Search: "${q}"`,
      description: `Search results for "${q}" at Daisy Gadgets Co. Find smartphones, TVs, gaming, laptops, solar and more.`,
    };
  }
  if (cat && CAT_META[cat]) {
    const m = CAT_META[cat];
    return {
      title: m.title,
      description: m.description,
      alternates: { canonical: `https://daisygadgetsco.com/shop?cat=${encodeURIComponent(cat)}` },
      openGraph: { title: `${m.title} | Daisy Gadgets Co.`, description: m.description },
      twitter: { card: "summary_large_image", title: m.title, description: m.description },
    };
  }
  return {
    title: "Shop — Premium Gadgets",
    description: "Browse our full range of smartphones, smart TVs, gaming consoles, laptops, MacBooks, home appliances, solar & more. Worldwide shipping available.",
    alternates: { canonical: "https://daisygadgetsco.com/shop" },
  };
}

const toNum = (price: string) => parseFloat(price.replace(/[^0-9.]/g, "")) || 0;

export default async function Shop({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string; q?: string; sort?: string; price?: string }>;
}) {
  const { cat, q, sort = "featured", price } = await searchParams;

  let products = getProducts().filter((p) => p.inStock);

  // Category filter
  if (cat) products = products.filter((p) => p.category === cat);

  // Search filter
  if (q) {
    const query = q.toLowerCase();
    products = products.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        (p.description ?? "").toLowerCase().includes(query),
    );
  }

  // Price range filter
  if (price) {
    products = products.filter((p) => {
      const n = toNum(p.price);
      if (price === "under5")  return n < 5000;
      if (price === "5to15")   return n >= 5000 && n < 15000;
      if (price === "15to30")  return n >= 15000 && n < 30000;
      if (price === "over30")  return n >= 30000;
      return true;
    });
  }

  // Sort
  if (sort === "price_asc")  products = [...products].sort((a, b) => toNum(a.price) - toNum(b.price));
  else if (sort === "price_desc") products = [...products].sort((a, b) => toNum(b.price) - toNum(a.price));
  else if (sort === "newest") products = [...products].reverse();
  else products = [...products].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));

  const total = products.length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10">

      {/* Compact header */}
      <div className="mb-5 flex items-baseline gap-3">
        <h1 className="text-2xl font-extrabold text-white">
          Our <span className="gold-text">Shop</span>
        </h1>
        {cat && <span className="text-gray-500 text-sm">/ {cat}</span>}
      </div>

      <Suspense fallback={null}>
        <ShopFilters total={total} />
      </Suspense>

      {total === 0 ? (
        <div className="text-center py-16">
          <Package size={48} color="#2a2a2a" strokeWidth={1} className="mx-auto mb-4" />
          <p className="text-gray-500 text-base mb-4">No products match your filters.</p>
          <Link href="/shop" className="btn-gold px-8 py-3 rounded-xl font-bold">Clear Filters</Link>
        </div>
      ) : (
        <ProductGrid products={products} cat={cat} isDefaultSort={sort === "featured"} />
      )}

      <div className="mt-12 bg-[#111111] border border-[#D4AF37]/25 rounded-2xl p-7 text-center">
        <h3 className="text-xl font-bold text-white mb-2">Can&apos;t find what you&apos;re looking for?</h3>
        <p className="text-gray-400 text-sm mb-5 max-w-lg mx-auto leading-relaxed">
          We source a wide range of gadgets. Contact us and we&apos;ll find it for you.
        </p>
        <Link
          href="/contact"
          className="btn-gold px-10 py-4 rounded-xl font-bold text-base"
        >
          Contact Us
        </Link>
      </div>
    </div>
  );
}

const SECTION_LIMIT = 8;

function ProductGrid({
  products,
  cat,
  isDefaultSort,
}: {
  products: ReturnType<typeof getProducts>;
  cat?: string;
  isDefaultSort: boolean;
}) {
  // Flat grid when filtered by category, search, price, or explicit sort
  if (cat || !isDefaultSort) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    );
  }

  // Grouped by category with separate Devices & Clothing overarching sections
  const deviceGroups: Record<string, typeof products> = {};
  const clothingGroups: Record<string, typeof products> = {};

  for (const p of products) {
    if (isClothingCategory(p.category)) {
      if (!clothingGroups[p.category]) clothingGroups[p.category] = [];
      clothingGroups[p.category].push(p);
    } else {
      if (!deviceGroups[p.category]) deviceGroups[p.category] = [];
      deviceGroups[p.category].push(p);
    }
  }

  return (
    <div className="space-y-16">
      {/* ── 1. DEVICES & TECH DEPARTMENT ────────────────────────── */}
      {Object.keys(deviceGroups).length > 0 && (
        <section className="space-y-10">
          <div className="flex items-center gap-3.5 pb-4 border-b border-[#D4AF37]/30">
            <div className="w-10 h-10 rounded-2xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#D4AF37] flex items-center justify-center font-bold shrink-0">
              <Smartphone size={20} />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">Devices & Tech Department</h2>
              <p className="text-xs text-gray-400">Smartphones, Smart TVs, Gaming Consoles, Laptops, Appliances & Solar</p>
            </div>
          </div>

          <div className="space-y-10">
            {Object.entries(deviceGroups).map(([category, items]) => (
              <div key={category}>
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <h3 className="text-base font-bold text-white whitespace-nowrap">{category}</h3>
                    <div className="flex-1 h-px bg-[#1F1F1F]" />
                  </div>
                  {items.length > SECTION_LIMIT && (
                    <Link
                      href={`/shop?cat=${encodeURIComponent(category)}`}
                      className="text-xs text-[#D4AF37] hover:underline whitespace-nowrap shrink-0"
                    >
                      See all {items.length} →
                    </Link>
                  )}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                  {items.slice(0, SECTION_LIMIT).map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── 2. CLOTHING & STREETWEAR DEPARTMENT (COMING SOON) ────── */}
      {Object.keys(clothingGroups).length > 0 && (
        <section className="space-y-8 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-gradient-to-r from-[#D4AF37]/15 via-[#141414] to-[#141414] border border-[#D4AF37]/40 shadow-xl shadow-[#D4AF37]/5">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#AA771C] text-black flex items-center justify-center font-bold shrink-0 shadow-lg shadow-[#D4AF37]/20">
                <Shirt size={22} />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">Clothing & Apparel Department</h2>
                  <span className="text-[10px] font-black uppercase tracking-wider bg-[#D4AF37] text-black px-2.5 py-0.5 rounded-full shadow">
                    COMING SOON
                  </span>
                </div>
                <p className="text-xs text-gray-300">Heavyweight hoodies, jackets, streetwear drops, retro kicks & caps</p>
              </div>
            </div>
            <Link
              href="/clothing"
              className="btn-gold px-6 py-3 rounded-xl text-xs font-bold shrink-0 inline-flex items-center gap-2"
            >
              <Sparkles size={14} /> Explore Clothing Drop <ArrowRight size={14} />
            </Link>
          </div>

          <div className="space-y-10">
            {Object.entries(clothingGroups).map(([category, items]) => (
              <div key={category}>
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-white whitespace-nowrap">{category}</h3>
                      <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30">
                        Soon
                      </span>
                    </div>
                    <div className="flex-1 h-px bg-[#1F1F1F]" />
                  </div>
                  {items.length > SECTION_LIMIT && (
                    <Link
                      href={`/shop?cat=${encodeURIComponent(category)}`}
                      className="text-xs text-[#D4AF37] hover:underline whitespace-nowrap shrink-0"
                    >
                      See all {items.length} →
                    </Link>
                  )}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                  {items.slice(0, SECTION_LIMIT).map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function ProductCard({ product }: { product: ReturnType<typeof getProducts>[0] }) {
  const isClothing = isClothingCategory(product.category);

  return (
    <Link
      href={`/shop/${product.id}`}
      className="bg-[#111111] border border-[#1F1F1F] rounded-xl overflow-hidden card-hover flex flex-col group"
    >
      <div className="relative h-40 bg-[#0f0f0f] overflow-hidden">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className={`${isClothing ? "object-cover" : "object-contain"} transition-transform duration-500 group-hover:scale-105`}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package size={32} color="#2a2a2a" strokeWidth={1} />
          </div>
        )}
        {isClothing ? (
          <span className="absolute top-2 right-2 bg-[#D4AF37] text-black text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded shadow">
            COMING SOON
          </span>
        ) : product.featured ? (
          <span className="absolute top-2 left-2 btn-gold text-[9px] font-bold px-2 py-0.5 rounded-full">
            Featured
          </span>
        ) : null}
      </div>
      <div className="p-3 flex flex-col flex-1">
        <p className="font-medium text-white text-xs leading-snug mb-2 flex-1 line-clamp-2">
          {product.name}
        </p>
        <div className="flex items-center gap-1.5 mb-2">
          <p className="text-[#D4AF37] font-bold text-sm">{product.price}</p>
          {product.originalPrice && (
            <p className="text-gray-600 text-xs line-through">{product.originalPrice}</p>
          )}
        </div>
        <AddToEnquiry
          id={product.id}
          name={product.name}
          price={product.price}
          imageUrl={product.imageUrl}
          category={product.category}
        />
      </div>
    </Link>
  );
}
