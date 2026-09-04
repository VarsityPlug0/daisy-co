"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DEVICE_CATEGORIES, CLOTHING_CATEGORIES, isClothingCategory, isDeviceCategory } from "@/lib/categories";
import {
  Search, X, LayoutGrid, ChevronDown,
  Smartphone, Tv, Gamepad2, Monitor, Tablet, Sofa,
  WashingMachine, ChefHat, Zap, Car, Printer, Laptop,
  Shirt, Sparkles, Flame, Footprints, Tag, Layers,
} from "lucide-react";

const CAT_META: Record<string, { icon: React.ElementType; color: string }> = {
  "Smartphones":             { icon: Smartphone,     color: "#3B82F6" },
  "TVs":                     { icon: Tv,             color: "#8B5CF6" },
  "Gaming Consoles":         { icon: Gamepad2,       color: "#EF4444" },
  "Gaming PCs":              { icon: Monitor,        color: "#F59E0B" },
  "Tablets & Watches":       { icon: Tablet,         color: "#06B6D4" },
  "Laptops & MacBooks":      { icon: Laptop,         color: "#10B981" },
  "Clothing & Apparel":      { icon: Shirt,          color: "#F43F5E" },
  "Men's Wear":              { icon: Shirt,          color: "#3B82F6" },
  "Women's Fashion":         { icon: Sparkles,       color: "#EC4899" },
  "Hoodies & Streetwear":    { icon: Flame,          color: "#F97316" },
  "Sneakers & Shoes":        { icon: Footprints,     color: "#10B981" },
  "Caps & Accessories":      { icon: Tag,            color: "#A855F7" },
  "Furniture":               { icon: Sofa,           color: "#A78BFA" },
  "Home Appliances":         { icon: WashingMachine, color: "#60A5FA" },
  "Solar & Power Solutions": { icon: Zap,            color: "#D4AF37" },
  "Electric Ride-On Cars":   { icon: Car,            color: "#F97316" },
  "Kitchen Appliances":      { icon: ChefHat,        color: "#EC4899" },
  "Office Equipment":        { icon: Printer,        color: "#6B7280" },
};

const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "price_asc", label: "Price: Low → High" },
  { value: "price_desc", label: "Price: High → Low" },
  { value: "newest", label: "Newest" },
];

const PRICE_RANGES = [
  { value: "", label: "All prices" },
  { value: "under5", label: "< R5k" },
  { value: "5to15", label: "R5k–R15k" },
  { value: "15to30", label: "R15k–R30k" },
  { value: "over30", label: "R30k+" },
];

export default function ShopFilters({ total }: { total: number }) {
  const router = useRouter();
  const params = useSearchParams();
  const cat   = params.get("cat")   ?? "";
  const q     = params.get("q")     ?? "";
  const sort  = params.get("sort")  ?? "featured";
  const price = params.get("price") ?? "";

  const [searchVal, setSearchVal] = useState(q);
  const [department, setDepartment] = useState<"all" | "devices" | "clothing">(() => {
    if (cat && isClothingCategory(cat)) return "clothing";
    if (cat && isDeviceCategory(cat)) return "devices";
    return "all";
  });

  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const scrollRef   = useRef<HTMLDivElement>(null);

  const push = useCallback(
    (next: { cat?: string; q?: string; sort?: string; price?: string }) => {
      const sp       = new URLSearchParams();
      const newCat   = next.cat   !== undefined ? next.cat   : cat;
      const newQ     = next.q     !== undefined ? next.q     : q;
      const newSort  = next.sort  !== undefined ? next.sort  : sort;
      const newPrice = next.price !== undefined ? next.price : price;
      if (newCat)                            sp.set("cat",   newCat);
      if (newQ)                              sp.set("q",     newQ);
      if (newSort && newSort !== "featured") sp.set("sort",  newSort);
      if (newPrice)                          sp.set("price", newPrice);
      router.push(`/shop${sp.toString() ? `?${sp}` : ""}`);
    },
    [router, cat, q, sort, price],
  );

  function handleSearch(val: string) {
    setSearchVal(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => push({ q: val }), 400);
  }

  function scrollBy(dir: number) {
    scrollRef.current?.scrollBy({ left: dir * 200, behavior: "smooth" });
  }

  function handleDepartmentChange(dept: "all" | "devices" | "clothing") {
    setDepartment(dept);
    if (dept === "devices" && cat && isClothingCategory(cat)) {
      push({ cat: "" });
    } else if (dept === "clothing" && cat && isDeviceCategory(cat)) {
      push({ cat: "" });
    }
  }

  // Determine active category list based on department
  const activeCatList =
    department === "devices"
      ? DEVICE_CATEGORIES
      : department === "clothing"
      ? CLOTHING_CATEGORIES
      : [...DEVICE_CATEGORIES, ...CLOTHING_CATEGORIES];

  const visibleCats = [
    { id: "", label: department === "all" ? "All Categories" : department === "devices" ? "All Devices" : "All Clothing", icon: LayoutGrid, color: "#D4AF37" },
    ...activeCatList.map(c => ({
      id: c,
      label: c,
      icon: CAT_META[c]?.icon ?? LayoutGrid,
      color: CAT_META[c]?.color ?? "#6B7280",
    })),
  ];

  return (
    <div className="mb-6 space-y-4">
      {/* ── Main Department Switcher Tabs ─────────────────────── */}
      <div className="flex items-center gap-2 p-1.5 bg-[#111111] border border-[#1F1F1F] rounded-2xl w-full overflow-x-auto">
        <button
          type="button"
          onClick={() => handleDepartmentChange("all")}
          className={`flex-1 min-w-[130px] flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold transition-all ${
            department === "all"
              ? "bg-[#1E1E1E] text-white border border-white/10 shadow-lg"
              : "text-gray-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <Layers size={15} className={department === "all" ? "text-[#D4AF37]" : "text-gray-500"} />
          <span>All Store</span>
        </button>

        <button
          type="button"
          onClick={() => handleDepartmentChange("devices")}
          className={`flex-1 min-w-[160px] flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold transition-all ${
            department === "devices"
              ? "bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/40 shadow-lg shadow-[#D4AF37]/10"
              : "text-gray-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <Smartphone size={15} />
          <span>Devices & Tech</span>
        </button>

        <button
          type="button"
          onClick={() => handleDepartmentChange("clothing")}
          className={`flex-1 min-w-[180px] flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold transition-all ${
            department === "clothing"
              ? "bg-gradient-to-r from-[#D4AF37] to-[#AA771C] text-black shadow-lg shadow-[#D4AF37]/20 font-black"
              : "text-gray-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <Shirt size={15} />
          <span>Clothing</span>
          <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-black/40 text-[#F3E5AB]">
            Coming Soon
          </span>
        </button>
      </div>

      {/* Department Notice for Clothing */}
      {department === "clothing" && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-[#D4AF37]/15 via-[#141414] to-[#141414] border border-[#D4AF37]/30">
          <div className="flex items-center gap-2.5">
            <Sparkles size={18} className="text-[#D4AF37] shrink-0" />
            <div>
              <p className="text-xs font-bold text-white">Official Clothing & Streetwear Drop — Coming Soon</p>
              <p className="text-[11px] text-gray-400">Email us to get launch-day priority.</p>
            </div>
          </div>
          <a
            href="mailto:daisygadgetsco@gmail.com?subject=Clothing%20drop%20enquiry"
            className="btn-gold px-4 py-2 rounded-xl text-xs font-bold shrink-0"
          >
            Pre-Order Enquiry
          </a>
        </div>
      )}

      {/* Search + sort */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search size={14} color="#6B7280" className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            inputMode="search"
            placeholder={department === "clothing" ? "Search hoodies, jackets, sneakers, caps…" : "Search smartphones, TVs, laptops, solar…"}
            value={searchVal}
            onChange={e => handleSearch(e.target.value)}
            className="w-full bg-[#111111] border border-[#1F1F1F] rounded-xl pl-9 pr-8 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#D4AF37]/50 transition-colors"
          />
          {searchVal && (
            <button
              onClick={() => { setSearchVal(""); push({ q: "" }); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
            >
              <X size={13} />
            </button>
          )}
        </div>

        <div className="relative">
          <select
            value={sort}
            onChange={e => push({ sort: e.target.value })}
            className="appearance-none bg-[#111111] border border-[#1F1F1F] rounded-xl pl-3 pr-8 py-2.5 text-sm text-gray-300 focus:outline-none focus:border-[#D4AF37]/50 transition-colors cursor-pointer"
          >
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <ChevronDown size={13} color="#6B7280" className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Price range + count */}
      <div className="flex items-center gap-2 flex-wrap">
        {PRICE_RANGES.map(r => (
          <button
            key={r.value}
            onClick={() => push({ price: r.value })}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              price === r.value
                ? "bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/40"
                : "bg-[#111111] border border-[#1F1F1F] text-gray-400 hover:border-[#D4AF37]/30 hover:text-gray-200"
            }`}
          >
            {r.label}
          </button>
        ))}
        <span className="ml-auto text-xs text-gray-600 shrink-0">
          {total} product{total !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Category strip */}
      <div className="relative">
        <button
          onClick={() => scrollBy(-1)}
          aria-label="Scroll left"
          className="hidden md:flex absolute left-0 top-0 bottom-0 z-10 items-center pr-4 pl-1"
          style={{ background: "linear-gradient(to right, #0A0A0A 55%, transparent)" }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="2.5"><path d="M15 18l-6-6 6-6"/></svg>
        </button>

        <div
          ref={scrollRef}
          className="no-scrollbar flex gap-2 overflow-x-auto py-1 px-0.5 md:px-8"
          style={{ WebkitOverflowScrolling: "touch", scrollSnapType: "x proximity" }}
        >
          {visibleCats.map(({ id, label, icon: Icon, color }) => {
            const active = id === "" ? !cat : cat === id;
            return (
              <button
                key={id}
                onClick={() => push({ cat: id === "" ? "" : cat === id ? "" : id })}
                style={{ scrollSnapAlign: "start" }}
                className="flex flex-col items-center gap-1.5 shrink-0 rounded-xl px-3 py-2 transition-all duration-200 active:scale-95"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200"
                  style={{
                    background: active ? "#D4AF37" : `${color}18`,
                    border: active ? "1px solid #D4AF37" : "1px solid rgba(255,255,255,0.06)",
                    boxShadow: active ? "0 4px 14px rgba(212,175,55,0.3)" : "none",
                  }}
                >
                  <Icon size={17} color={active ? "#0A0A0A" : color} strokeWidth={active ? 2.5 : 1.8} />
                </div>
                <span
                  style={{
                    fontSize: 11,
                    fontFamily: "var(--font-outfit)",
                    fontWeight: active ? 700 : 500,
                    color: active ? "#D4AF37" : "#6B7280",
                    whiteSpace: "nowrap",
                  }}
                >
                  {label}
                </span>
              </button>
            );
          })}
        </div>

        <button
          onClick={() => scrollBy(1)}
          aria-label="Scroll right"
          className="hidden md:flex absolute right-0 top-0 bottom-0 z-10 items-center pl-4 pr-1 justify-end"
          style={{ background: "linear-gradient(to left, #0A0A0A 55%, transparent)" }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>
        </button>
      </div>

      {/* Active filter chips */}
      {(cat || price || (sort && sort !== "featured") || q) && (
        <div className="flex items-center gap-2 flex-wrap pt-1">
          {cat && (
            <span
              className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full"
              style={{
                background: `${CAT_META[cat]?.color ?? "#D4AF37"}15`,
                color: CAT_META[cat]?.color ?? "#D4AF37",
                border: `1px solid ${CAT_META[cat]?.color ?? "#D4AF37"}30`,
              }}
            >
              {cat}
              <button onClick={() => push({ cat: "" })}><X size={9} /></button>
            </span>
          )}
          {price && (
            <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/25">
              {PRICE_RANGES.find(r => r.value === price)?.label}
              <button onClick={() => push({ price: "" })}><X size={9} /></button>
            </span>
          )}
          {sort !== "featured" && (
            <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-white/5 text-gray-400 border border-white/10">
              {SORT_OPTIONS.find(o => o.value === sort)?.label}
              <button onClick={() => push({ sort: "featured" })}><X size={9} /></button>
            </span>
          )}
          <button
            onClick={() => { setSearchVal(""); push({ cat: "", q: "", sort: "featured", price: "" }); }}
            className="text-xs text-gray-600 hover:text-gray-400 transition-colors ml-1"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}
