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

// Clothing now lives on the sister store (bevanssons.store). These link
// out to the live clothing storefront instead of an internal "coming soon"
// hub, so customers move straight between the two Bevans Sons stores.
const CLOTHING_STORE_URL = "https://bevanssons.store";
const clothingLinks = [
  { label: "Shop the Clothing Store", href: CLOTHING_STORE_URL, desc: "Hoodies, streetwear & apparel" },
  { label: "Hoodies & Streetwear",    href: CLOTHING_STORE_URL, desc: "Heavyweight oversized hoodies" },
  { label: "Men's Wear",              href: CLOTHING_STORE_URL, desc: "Jackets, denim & everyday fits" },
  { label: "Women's Fashion",         href: CLOTHING_STORE_URL, desc: "Sets, knitwear & chic apparel" },
  { label: "Sneakers & Kicks",        href: CLOTHING_STORE_URL, desc: "Retro & lifestyle footwear" },
  { label: "Caps & Accessories",      href: CLOTHING_STORE_URL, desc: "Snapbacks, beanies & bags" },
];

// Same light, sharp-edged, uppercase-tracked nav language as the real
// Bevans Sons client Navbar (client/src/components/layout/Navbar.tsx) —
// white bar, border-brand-mid, brand-black/brand-gold text, no rounded
// glow buttons. Adapted here to Daisy's own nav structure (mega-menu,
// promo ticker, cart) rather than Bevans' account/wishlist system, which
// doesn't exist on this platform.
function BevansLogo() {
  // Real Bevans Sons logo (pulled from the Bevans client app) is white
  // artwork on black — same inversion trick their own white Navbar uses
  // to make it read on a light background.
  return (
    <Image src="/logo-mark.jpg" alt="Bevanssons" width={36} height={38}
      className="shrink-0" style={{ filter: "invert(1)" }} />
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
        background: "#111111",
        color: "#C8B993", height: 36 }}>
        <div ref={tickerRef} style={{ display: "flex", flexShrink: 0, whiteSpace: "nowrap", willChange: "transform" }}>
          {[0, 1].map((copy) => (
            <span key={copy} style={{ display: "inline-flex", alignItems: "center" }}>
              {tickerItems.map((item, i) => (
                <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 6, paddingRight: 48,
                  fontFamily: "var(--font-outfit)", fontWeight: 700, fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  <Tag size={9} strokeWidth={2.5} style={{ flexShrink: 0 }} />
                  {item}
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* Main Nav — light, sharp, matches the real Bevans Sons Navbar */}
      <div className="bg-white border-b border-[#DADADA]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between gap-4">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0" onClick={() => setMobileOpen(false)}>
            <BevansLogo />
            <div>
              <p style={{ fontFamily: "var(--font-outfit)", fontWeight: 700, fontSize: 15, color: "#111111", lineHeight: 1.2 }}>
                Bevanssons
              </p>
              <p style={{ fontSize: 9, color: "#A7A7AA", letterSpacing: "0.1em", textTransform: "uppercase" }}>Premium Gadgets</p>
            </div>
          </Link>

          {/* Desktop Nav — uppercase, wide-tracked, like the real Bevans nav */}
          <nav className="hidden lg:flex items-center gap-6 text-[11px] font-semibold tracking-[0.12em] uppercase">
            <Link href="/" className={isActive("/") ? "text-[#C8B993]" : "text-[#111111] hover:text-[#C8B993] transition-colors"}>Home</Link>

            <div className="relative" ref={shopRef}>
              <button onClick={() => setShopOpen((v) => !v)}
                className={`flex items-center gap-1.5 ${isActive("/shop") ? "text-[#C8B993]" : "text-[#111111] hover:text-[#C8B993] transition-colors"}`}>
                Shop
                <ChevronDown size={11} strokeWidth={2.5}
                  style={{ transition: "transform 0.2s", transform: shopOpen ? "rotate(180deg)" : "rotate(0deg)" }} />
              </button>
              {shopOpen && (
                <div className="absolute top-full left-0 mt-3 w-[420px] shadow-lg"
                  style={{ background: "#FFFFFF", border: "1px solid #DADADA" }}>
                  <div className="p-3 max-h-[80vh] overflow-y-auto space-y-3 normal-case tracking-normal">
                    {/* Section 1: Devices */}
                    <div>
                      <div className="px-3 py-1.5 flex items-center justify-between text-[11px] font-bold text-[#111111] uppercase tracking-wider border-b border-[#DADADA]">
                        <span>Devices & Gadgets</span>
                        <Link href="/shop" onClick={() => setShopOpen(false)} className="text-[10px] text-[#A7A7AA] hover:text-[#111111] normal-case">
                          View All &rarr;
                        </Link>
                      </div>
                      <div className="grid grid-cols-2 gap-1 pt-1.5">
                        {deviceLinks.map((item) => (
                          <Link key={item.label} href={item.href} onClick={() => setShopOpen(false)}
                            className="flex flex-col px-3 py-2 hover:bg-[#F5F5F5] transition-colors group">
                            <span style={{ fontFamily: "var(--font-outfit)", fontWeight: 600, fontSize: 12, color: "#111111" }}
                              className="group-hover:text-[#C8B993] transition-colors">{item.label}</span>
                            <span style={{ fontSize: 10, color: "#A7A7AA" }}>{item.desc}</span>
                          </Link>
                        ))}
                      </div>
                    </div>

                    {/* Section 2: Clothing */}
                    <div className="pt-2 border-t border-[#DADADA]">
                      <div className="px-3 py-1.5 flex items-center justify-between text-[11px] font-bold text-[#111111] uppercase tracking-wider border-b border-[#DADADA]">
                        <span className="flex items-center gap-1.5">
                          Clothing & Apparel
                        </span>
                        <a href={CLOTHING_STORE_URL} className="text-[10px] text-[#9C8F72] hover:underline normal-case">
                          Visit Store &rarr;
                        </a>
                      </div>
                      <div className="grid grid-cols-2 gap-1 pt-1.5">
                        {clothingLinks.map((item) => (
                          <Link key={item.label} href={item.href} onClick={() => setShopOpen(false)}
                            className="flex flex-col px-3 py-2 hover:bg-[#F5F5F5] transition-colors group">
                            <span style={{ fontFamily: "var(--font-outfit)", fontWeight: 600, fontSize: 12, color: "#111111" }}
                              className="group-hover:text-[#C8B993] transition-colors">{item.label}</span>
                            <span style={{ fontSize: 10, color: "#A7A7AA" }}>{item.desc}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <a href={CLOTHING_STORE_URL} className="text-[#111111] hover:text-[#C8B993] transition-colors">
              Clothing
            </a>
            <Link href="/special-offers" className={`flex items-center gap-1 ${isActive("/special-offers") ? "text-[#C8B993]" : "text-[#111111] hover:text-[#C8B993] transition-colors"}`}>
              Offers <span className="text-[9px] font-bold text-[#111111] bg-[#C8B993] px-1.5 py-0.5 leading-none normal-case">30%</span>
            </Link>
            <Link href="/new-arrivals" className={isActive("/new-arrivals") ? "text-[#C8B993]" : "text-[#111111] hover:text-[#C8B993] transition-colors"}>New</Link>
            <Link href="/faq"          className={isActive("/faq") ? "text-[#C8B993]" : "text-[#111111] hover:text-[#C8B993] transition-colors"}>FAQ</Link>
            <Link href="/about"        className={isActive("/about") ? "text-[#C8B993]" : "text-[#111111] hover:text-[#C8B993] transition-colors"}>About</Link>
            <Link href="/contact"      className={isActive("/contact") ? "text-[#C8B993]" : "text-[#111111] hover:text-[#C8B993] transition-colors"}>Contact</Link>
          </nav>

          {/* Desktop CTAs */}
          <div className="hidden lg:flex items-center gap-3">
            <CartButton />
            <Link href="/track-order"
              className="text-[11px] font-semibold tracking-[0.1em] uppercase text-[#111111] border border-[#111111] px-4 py-2.5 hover:bg-[#111111] hover:text-white transition-colors">
              Track Order
            </Link>
          </div>

          {/* Mobile right */}
          <div className="lg:hidden flex items-center gap-2">
            <CartButton />
            <button onClick={() => setMobileOpen((v) => !v)}
              className="w-10 h-10 flex items-center justify-center text-[#111111]"
              aria-label="Menu">
              {mobileOpen ? <X size={20} strokeWidth={2.2} /> : <Menu size={20} strokeWidth={2.2} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-white border-t border-[#DADADA]">
          <div className="max-w-7xl mx-auto px-5 py-4 flex flex-col gap-0.5">
            {[
              { label: "Home",             href: "/" },
              { label: "Clothing Store", href: CLOTHING_STORE_URL },
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
                  className="flex items-center justify-between px-4 py-3 border-b border-[#F0F0F0] transition-colors"
                  style={{ fontFamily: "var(--font-outfit)", fontWeight: 700, fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase",
                    color: active ? "#C8B993" : "#111111" }}>
                  {item.label}
                  {active && <ChevronDown size={15} color="#C8B993" style={{ transform: "rotate(-90deg)" }} />}
                </Link>
              );
            })}
            <div className="pt-4 pb-1 flex flex-col gap-2.5">
              <Link href="/special-offers" onClick={() => setMobileOpen(false)}
                className="w-full py-3 text-[11px] font-semibold tracking-[0.1em] uppercase text-[#111111] border border-[#111111] flex items-center justify-center gap-1.5">
                <Sparkles size={14} /> View Special Offers
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
