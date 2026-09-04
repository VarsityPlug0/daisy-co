"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, X, Tag, Sparkles } from "lucide-react";
import { CartButton } from "@/components/CartContext";

const deviceLinks = [
  { label: "Smartphones",         href: "/shop?cat=Smartphones",                      desc: "iPhones & Android devices" },
  { label: "Smart TVs",           href: "/shop?cat=TVs",                              desc: "Samsung, Hisense, LG & more" },
  { label: "Gaming Consoles",     href: "/shop?cat=Gaming%20Consoles",                desc: "PS5, Xbox & accessories" },
  { label: "Gaming PCs",          href: "/shop?cat=Gaming%20PCs",                     desc: "High-performance gaming rigs" },
  { label: "Laptops & MacBooks",  href: "/shop?cat=Laptops%20%26%20MacBooks",         desc: "Windows laptops & Apple MacBooks" },
  { label: "Tablets & Watches",   href: "/shop?cat=Tablets%20%26%20Watches",          desc: "iPads & Apple Watches" },
  { label: "Home Appliances",     href: "/shop?cat=Home%20Appliances",                desc: "Fridges, washers & tech" },
  { label: "Solar & Power",       href: "/shop?cat=Solar%20%26%20Power%20Solutions",  desc: "Inverters, batteries & solar panels" },
  { label: "Browse All Devices",  href: "/shop",                                      desc: "Explore full gadgets catalog" },
];

const clothingLinks = [
  { label: "Clothing Drop Hub",   href: "/clothing",                                  desc: "Official streetwear drop (Coming Soon)" },
  { label: "Hoodies & Drops",     href: "/shop?cat=Hoodies%20%26%20Streetwear",       desc: "Heavyweight oversized hoodies" },
  { label: "Men's Wear",          href: "/shop?cat=Men%27s%20Wear",                   desc: "Jackets, denim & everyday fits" },
  { label: "Women's Fashion",     href: "/shop?cat=Women%27s%20Fashion",              desc: "Sets, knitwear & chic apparel" },
  { label: "Sneakers & Kicks",    href: "/shop?cat=Sneakers%20%26%20Shoes",           desc: "Retro & lifestyle footwear" },
  { label: "Caps & Accessories",  href: "/shop?cat=Caps%20%26%20Accessories",         desc: "Snapbacks, beanies & bags" },
];

function DaisyLogo() {
  return (
    <Image src="/logo.jpg" alt="Daisy Gadgets Co." width={44} height={44} className="rounded-lg" />
  );
}

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const shopRef = useRef<HTMLDivElement>(null);
  const tickerRef = useRef<HTMLDivElement>(null);
  const posRef = useRef(0);
  const rafRef = useRef<number>(0);
  const pathname = usePathname();

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (shopRef.current && !shopRef.current.contains(e.target as Node)) setShopOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => { setMobileOpen(false); setShopOpen(false); }, [pathname]);

  // JS-based ticker — works on all mobile browsers
  useEffect(() => {
    const el = tickerRef.current;
    if (!el) return;
    let last = 0;
    function step(ts: number) {
      if (last) {
        posRef.current -= (ts - last) * 0.04; // ~2.4px per frame at 60fps
        const half = el!.scrollWidth / 2;
        if (Math.abs(posRef.current) >= half) posRef.current = 0;
        el!.style.transform = `translateX(${posRef.current}px)`;
      }
      last = ts;
      rafRef.current = requestAnimationFrame(step);
    }
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const isActive = (href: string) => href === "/" ? pathname === "/" : pathname.startsWith(href.split("?")[0]);

  const tickerItems = [
    "30% OFF — August to December Special",
    "Free Worldwide Delivery",
    "Orders Over R10,000 Get 25% Discount",
    "Same-Day Delivery in South Africa",
    "100% Authentic Products",
    "Real Human Support — Fast Email Response",
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* Announcement Bar — JS-driven ticker */}
      <div style={{ overflow: "hidden", display: "flex", alignItems: "center",
        background: "linear-gradient(90deg, #C9971C, #D4AF37, #F0CE6A, #D4AF37, #C9971C)",
        color: "#0A0A0A", height: 44 }}>
        <div ref={tickerRef} style={{ display: "flex", flexShrink: 0, whiteSpace: "nowrap", willChange: "transform" }}>
          {[0, 1].map((copy) => (
            <span key={copy} style={{ display: "inline-flex", alignItems: "center" }}>
              {tickerItems.map((item, i) => (
                <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 6, paddingRight: 48,
                  fontFamily: "var(--font-outfit)", fontWeight: 700, fontSize: 11, letterSpacing: "0.03em" }}>
                  <Tag size={10} strokeWidth={2.5} style={{ flexShrink: 0 }} />
                  {item}
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* Main Nav */}
      <div style={{ background: "rgba(10,10,10,0.97)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8 h-[72px] flex items-center justify-between gap-4">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0" onClick={() => setMobileOpen(false)}>
            <DaisyLogo />
            <div>
              <p style={{ fontFamily: "var(--font-outfit)", fontWeight: 700, fontSize: 15, color: "#D4AF37", lineHeight: 1.2 }}>
                Daisy Gadgets Co.
              </p>
              <p style={{ fontSize: 9, color: "#6B7280", letterSpacing: "0.1em", textTransform: "uppercase" }}>Premium Gadgets</p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-0.5">
            <Link href="/" className={`nav-link px-3 py-2 rounded-lg${isActive("/") ? " active" : ""}`}>Home</Link>

            <div className="relative" ref={shopRef}>
              <button onClick={() => setShopOpen((v) => !v)}
                className={`nav-link px-3 py-2 rounded-lg flex items-center gap-1.5${isActive("/shop") ? " active" : ""}`}>
                Shop
                <ChevronDown size={12} strokeWidth={2.5}
                  style={{ transition: "transform 0.2s", transform: shopOpen ? "rotate(180deg)" : "rotate(0deg)" }} />
              </button>
              {shopOpen && (
                <div className="absolute top-full left-0 mt-2 w-[420px] rounded-3xl overflow-hidden shadow-2xl"
                  style={{ background: "#141414", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 20px 60px rgba(0,0,0,0.6)" }}>
                  <div className="p-3 max-h-[80vh] overflow-y-auto space-y-3">
                    {/* Section 1: Devices */}
                    <div>
                      <div className="px-3 py-1.5 flex items-center justify-between text-[11px] font-bold text-[#D4AF37] uppercase tracking-wider border-b border-[#222]">
                        <span>📱 Devices & Gadgets</span>
                        <Link href="/shop" onClick={() => setShopOpen(false)} className="text-[10px] text-gray-400 hover:text-white normal-case">
                          View All →
                        </Link>
                      </div>
                      <div className="grid grid-cols-2 gap-1 pt-1.5">
                        {deviceLinks.map((item) => (
                          <Link key={item.label} href={item.href} onClick={() => setShopOpen(false)}
                            className="flex flex-col px-3 py-2 rounded-xl hover:bg-white/5 transition-colors group">
                            <span style={{ fontFamily: "var(--font-outfit)", fontWeight: 600, fontSize: 12, color: "#F0F0F0" }}
                              className="group-hover:text-[#D4AF37] transition-colors">{item.label}</span>
                            <span style={{ fontSize: 10, color: "#6B7280" }}>{item.desc}</span>
                          </Link>
                        ))}
                      </div>
                    </div>

                    {/* Section 2: Clothing */}
                    <div className="pt-2 border-t border-[#222]">
                      <div className="px-3 py-1.5 flex items-center justify-between text-[11px] font-bold text-white uppercase tracking-wider border-b border-[#222]">
                        <span className="flex items-center gap-1.5">
                          👕 Clothing & Drops
                          <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-[#D4AF37] text-black">
                            SOON
                          </span>
                        </span>
                        <Link href="/clothing" onClick={() => setShopOpen(false)} className="text-[10px] text-[#D4AF37] hover:underline normal-case">
                          Hub →
                        </Link>
                      </div>
                      <div className="grid grid-cols-2 gap-1 pt-1.5">
                        {clothingLinks.map((item) => (
                          <Link key={item.label} href={item.href} onClick={() => setShopOpen(false)}
                            className="flex flex-col px-3 py-2 rounded-xl hover:bg-white/5 transition-colors group">
                            <span style={{ fontFamily: "var(--font-outfit)", fontWeight: 600, fontSize: 12, color: "#F0F0F0" }}
                              className="group-hover:text-[#D4AF37] transition-colors">{item.label}</span>
                            <span style={{ fontSize: 10, color: "#6B7280" }}>{item.desc}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Link href="/clothing" className={`nav-link px-3 py-2 rounded-lg flex items-center gap-1${isActive("/clothing") ? " active" : ""}`}>
              Clothing <span className="text-[9px] font-bold text-[#0A0A0A] bg-[#D4AF37] rounded-full px-1.5 py-0.5 leading-none">Soon</span>
            </Link>
            <Link href="/special-offers" className={`nav-link px-3 py-2 rounded-lg flex items-center gap-1${isActive("/special-offers") ? " active" : ""}`}>
              Offers <span className="text-[9px] font-bold text-[#0A0A0A] bg-[#D4AF37] rounded-full px-1.5 py-0.5 leading-none">30%</span>
            </Link>
            <Link href="/new-arrivals" className={`nav-link px-3 py-2 rounded-lg${isActive("/new-arrivals") ? " active" : ""}`}>New</Link>
            <Link href="/faq"          className={`nav-link px-3 py-2 rounded-lg${isActive("/faq") ? " active" : ""}`}>FAQ</Link>
            <Link href="/about"        className={`nav-link px-3 py-2 rounded-lg${isActive("/about") ? " active" : ""}`}>About</Link>
            <Link href="/contact"      className={`nav-link px-3 py-2 rounded-lg${isActive("/contact") ? " active" : ""}`}>Contact</Link>
          </nav>

          {/* Desktop CTAs */}
          <div className="hidden lg:flex items-center gap-2">
            <CartButton />
            <Link href="/track-order" className="btn-outline rounded-xl" style={{ fontSize: 12, padding: "9px 14px" }}>
              Track Order
            </Link>
          </div>

          {/* Mobile right */}
          <div className="lg:hidden flex items-center gap-2">
            <CartButton />
            <button onClick={() => setMobileOpen((v) => !v)}
              className="w-10 h-10 flex items-center justify-center rounded-xl text-gray-300 hover:text-white hover:bg-white/6 transition-all"
              aria-label="Menu">
              {mobileOpen ? <X size={20} strokeWidth={2.2} /> : <Menu size={20} strokeWidth={2.2} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden" style={{ background: "#0f0f0f", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="max-w-7xl mx-auto px-5 py-4 flex flex-col gap-1">
            {[
              { label: "Home",             href: "/" },
              { label: "Clothing & Apparel", href: "/clothing" },
              { label: "Shop All",         href: "/shop" },
              { label: "Special Offers",   href: "/special-offers" },
              { label: "New Arrivals",     href: "/new-arrivals" },
              { label: "Track My Order",   href: "/track-order" },
              { label: "FAQ",              href: "/faq" },
              { label: "About Us",         href: "/about" },
              { label: "Contact Us",       href: "/contact" },
              { label: "Delivery Info",    href: "/delivery" },
              { label: "Payment Options",  href: "/payment-options" },
            ].map((item) => {
              const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
                <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-between px-4 py-3 rounded-xl transition-colors"
                  style={{ fontFamily: "var(--font-outfit)", fontWeight: 500, fontSize: 14,
                    color: active ? "#D4AF37" : "#D1D5DB", background: active ? "rgba(212,175,55,0.06)" : "transparent" }}>
                  {item.label}
                  {active && <ChevronDown size={15} color="#D4AF37" style={{ transform: "rotate(-90deg)" }} />}
                </Link>
              );
            })}
            <div className="pt-3 pb-1 flex flex-col gap-2.5">
              <Link href="/special-offers" onClick={() => setMobileOpen(false)}
                className="btn-outline w-full py-3 rounded-xl text-sm flex items-center justify-center gap-1.5">
                <Sparkles size={14} /> View Special Offers
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
