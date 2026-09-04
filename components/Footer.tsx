"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Home, ShoppingBag, Tag, HelpCircle, Phone } from "lucide-react";

const navItems = [
  { href: "/",               label: "Home",    icon: Home },
  { href: "/shop",           label: "Shop",    icon: ShoppingBag },
  { href: "/special-offers", label: "Offers",  icon: Tag },
  { href: "/faq",            label: "FAQ",     icon: HelpCircle },
  { href: "/contact",        label: "Contact", icon: Phone },
];

function DaisyLogo() {
  return (
    <Image src="/logo.jpg" alt="Daisy Gadgets Co." width={44} height={44} className="rounded-lg" />
  );
}

export default function Footer() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop Footer */}
      <footer className="hidden lg:block" style={{ background: "#0d0d0d", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="max-w-7xl mx-auto px-8 py-14">
          <div className="grid grid-cols-12 gap-10">

            {/* Brand */}
            <div className="col-span-3">
              <div className="flex items-center gap-3 mb-3">
                <DaisyLogo />
                <div>
                  <p style={{ fontFamily: "var(--font-outfit)", fontWeight: 700, fontSize: 15, color: "#D4AF37", lineHeight: 1.2 }}>
                    Daisy Gadgets Co.
                  </p>
                  <p style={{ fontSize: 9, color: "#6B7280", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                    Premium Gadgets
                  </p>
                </div>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed mt-4 max-w-xs">
                Premium gadgets for everyday convenience. Worldwide shipping available. Same-day delivery in South Africa.
              </p>
              <div className="mt-5 p-4 rounded-xl border border-[#1F1F1F] bg-[#111111]">
                <p className="text-[10px] text-gray-600 uppercase tracking-wide mb-2 font-semibold">Bank Details</p>
                <div className="space-y-1">
                  {[
                    ["Bank", "TymeBank / GoTymeBank"],
                    ["Account Holder", "Daisy Gadgets Co."],
                    ["Account Type", "Business Account"],
                    ["Account No.", "51072673949"],
                    ["Branch Code", "678910"],
                    ["Reference", "Name & Surname"],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-2">
                      <span className="text-[10px] text-gray-600">{k}</span>
                      <span className={`text-[10px] font-semibold ${k === "Account No." ? "text-[#D4AF37] font-mono" : "text-gray-300"}`}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Shop */}
            <div className="col-span-2 col-start-5">
              <p className="section-label mb-5">Shop</p>
              <ul className="space-y-2.5">
                {[
                  ["All Products",       "/shop"],
                  ["Clothing & Apparel", "/clothing"],
                  ["Smartphones",        "/shop?cat=Smartphones"],
                  ["Smart TVs",          "/shop?cat=TVs"],
                  ["Gaming Consoles",    "/shop?cat=Gaming%20Consoles"],
                  ["Gaming PCs",         "/shop?cat=Gaming%20PCs"],
                  ["Laptops & MacBooks", "/shop?cat=Laptops%20%26%20MacBooks"],
                  ["Home Appliances",    "/shop?cat=Home%20Appliances"],
                  ["Solar & Power",      "/shop?cat=Solar%20%26%20Power%20Solutions"],
                  ["Special Offers",     "/special-offers"],
                  ["New Arrivals",       "/new-arrivals"],
                ].map(([l, h]) => (
                  <li key={l}>
                    <Link href={h} className="text-gray-500 hover:text-[#D4AF37] transition-colors text-xs"
                      style={{ fontFamily: "var(--font-outfit)", fontWeight: 500 }}>{l}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div className="col-span-2">
              <p className="section-label mb-5">Support</p>
              <ul className="space-y-2.5">
                {[
                  ["Track My Order",    "/track-order"],
                  ["FAQ",               "/faq"],
                  ["Contact Us",        "/contact"],
                  ["Delivery Info",     "/delivery"],
                  ["Payment Options",   "/payment-options"],
                  ["Reviews",           "/reviews"],
                  ["About Us",          "/about"],
                ].map(([l, h]) => (
                  <li key={l}>
                    <Link href={h} className="text-gray-500 hover:text-[#D4AF37] transition-colors text-xs"
                      style={{ fontFamily: "var(--font-outfit)", fontWeight: 500 }}>{l}</Link>
                  </li>
                ))}
              </ul>
              <p className="section-label mt-6 mb-3">Policies</p>
              <ul className="space-y-2.5">
                {[
                  ["Terms & Conditions", "/policies/terms"],
                  ["Privacy Policy",     "/policies/privacy"],
                  ["Refund Policy",      "/policies/refund"],
                  ["Returns Policy",     "/policies/returns"],
                  ["Warranty Policy",    "/policies/warranty"],
                ].map(([l, h]) => (
                  <li key={l}>
                    <Link href={h} className="text-gray-500 hover:text-[#D4AF37] transition-colors text-xs"
                      style={{ fontFamily: "var(--font-outfit)", fontWeight: 500 }}>{l}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact & Social */}
            <div className="col-span-3 col-start-10">
              <p className="section-label mb-5">Contact Us</p>
              <ul className="space-y-3 text-xs text-gray-500 mb-6">
                <li className="flex items-start gap-2.5">
                  <svg className="mt-0.5 shrink-0" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                  <a href="mailto:daisygadgetsco@gmail.com" className="text-white font-medium hover:text-[#D4AF37] transition-colors">
                    daisygadgetsco@gmail.com
                  </a>
                </li>
                <li className="flex items-start gap-2.5">
                  <svg className="mt-0.5 shrink-0" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                  <div>
                    <p className="text-white font-medium">Bellville, Cape Town</p>
                    <p>Unit 7, Eagle Street, Okavango Park</p>
                  </div>
                </li>
              </ul>

              <p className="section-label mb-3">Follow Us</p>
              <div className="flex gap-2.5 mb-5">
                {[
                  { label: "Instagram", href: "https://instagram.com/daisy_gadgets_co",
                    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/></svg> },
                  { label: "TikTok", href: "https://tiktok.com/@daisygadgetsco",
                    icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V9.01a8.16 8.16 0 004.77 1.52V7.07a4.85 4.85 0 01-1.01-.38z"/></svg> },
                  { label: "Facebook", href: "https://facebook.com/daisydgadgetsco",
                    icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg> },
                ].map((s) => (
                  <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}
                    className="w-9 h-9 rounded-full border border-[#2a2a2a] flex items-center justify-center text-gray-400 hover:text-white hover:border-[#D4AF37]/50 transition-all">
                    {s.icon}
                  </a>
                ))}
              </div>

              <div className="flex flex-wrap gap-2">
                {["SSL Secure", "POPIA Compliant", "Secure Payments", "Worldwide Shipping"].map((b) => (
                  <span key={b} className="text-[9px] font-semibold text-gray-600 border border-[#222] rounded-full px-2 py-1">{b}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="gold-divider mt-10 mb-5" />
          <p className="text-center text-gray-600 text-xs">
            &copy; {new Date().getFullYear()} Daisy Gadgets Co. All Rights Reserved. &nbsp;|&nbsp;
            Unit 7, Eagle Street, Okavango Park, Bellville, Cape Town, South Africa
          </p>
        </div>
      </footer>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50"
        style={{ background: "rgba(10,10,10,0.98)", backdropFilter: "blur(20px)", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="grid grid-cols-5 h-16">
          {navItems.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            const IconComponent = item.icon;
            return (
              <Link key={item.href} href={item.href}
                className="flex flex-col items-center justify-center gap-1 transition-colors"
                style={{ color: active ? "#D4AF37" : "#6B7280", fontFamily: "var(--font-outfit)", fontSize: 9, fontWeight: active ? 700 : 500 }}>
                <IconComponent size={21} strokeWidth={active ? 2.2 : 1.8} color={active ? "#D4AF37" : "#6B7280"} />
                {item.label}
              </Link>
            );
          })}
        </div>
        <div className="h-safe-area-inset-bottom" />
      </nav>
    </>
  );
}
