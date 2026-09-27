"use client";
import Link from "next/link";
import Image from "next/image";

function BrandLogo() {
  // White-on-black mark — works as-is on this dark footer, no inversion
  // needed (same as the real Bevans Sons footer).
  return (
    <Image src="/logo-mark.jpg" alt="Bevanssons" width={40} height={42} />
  );
}

export default function Footer() {
  return (
    <>
      {/* Desktop Footer */}
      <footer className="block" style={{ background: "#111111", borderTop: "1px solid #1D1D1D" }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10 lg:py-14">
          <div className="grid grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">

            {/* Brand */}
            <div className="col-span-2 lg:col-span-3">
              <div className="flex items-center gap-3 mb-3">
                <BrandLogo />
                <div>
                  <p style={{ fontFamily: "var(--font-outfit)", fontWeight: 700, fontSize: 15, color: "#C8B993", lineHeight: 1.2 }}>
                    Bevanssons
                  </p>
                  <p style={{ fontSize: 9, color: "#6B7280", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                    Premium Gadgets
                  </p>
                </div>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed mt-4 max-w-xs">
                Premium gadgets for everyday convenience. Worldwide shipping available. Same-day delivery in South Africa.
              </p>
              <div className="mt-5 p-4 border border-[#1D1D1D] bg-[#0A0A0A]">
                <p className="text-[10px] text-gray-600 uppercase tracking-wide mb-2 font-semibold">Payment Methods</p>
                <div className="space-y-1">
                  {[
                    ["Payment Partner", "PayFast Secure"],
                    ["Cards Accepted", "Visa & Mastercard"],
                    ["Instant EFT", "All Major SA Banks"],
                    ["Verification", "Instant & Automatic"],
                    ["Encryption", "256-Bit SSL"],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-2">
                      <span className="text-[10px] text-gray-600">{k}</span>
                      <span className={`text-[10px] font-semibold ${k === "Payment Partner" ? "text-[#C8B993]" : "text-gray-300"}`}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Shop */}
            <div className="col-span-1 lg:col-span-2 lg:col-start-5">
              <p className="section-label mb-5">Shop</p>
              <ul className="space-y-2.5">
                {[
                  ["All Products",       "/shop"],
                  ["Clothing Store", "https://shop.bevanssons.store"],
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
                    <Link href={h} className="text-gray-500 hover:text-[#C8B993] transition-colors text-xs"
                      style={{ fontFamily: "var(--font-outfit)", fontWeight: 500 }}>{l}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div className="col-span-1 lg:col-span-2">
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
                    <Link href={h} className="text-gray-500 hover:text-[#C8B993] transition-colors text-xs"
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
                    <Link href={h} className="text-gray-500 hover:text-[#C8B993] transition-colors text-xs"
                      style={{ fontFamily: "var(--font-outfit)", fontWeight: 500 }}>{l}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact & Social */}
            <div className="col-span-2 lg:col-span-3 lg:col-start-10">
              <p className="section-label mb-5">Contact Us</p>
              <ul className="space-y-3 text-xs text-gray-500 mb-6">
                <li className="flex items-start gap-2.5">
                  <svg className="mt-0.5 shrink-0" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#C8B993" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                  <a href="mailto:support@bevanssons.store" className="text-white font-medium hover:text-[#C8B993] transition-colors">
                    support@bevanssons.store
                  </a>
                </li>
                <li className="flex items-start gap-2.5">
                  <svg className="mt-0.5 shrink-0" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#C8B993" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                  <div>
                    <p className="text-white font-medium">City Deep, Johannesburg</p>
                    <p>36 Houer Road</p>
                  </div>
                </li>
              </ul>

              <p className="section-label mb-3">Follow Us</p>
              <div className="flex gap-2.5 mb-5">
                {[
                  { label: "Instagram", href: "https://instagram.com/bevansons",
                    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/></svg> },
                  // TikTok/Facebook removed 2026-09-14 — no confirmed real
                  // Bevanssons handle for either; better to show one real
                  // link than two pointing at Daisy's old accounts.
                ].map((s) => (
                  <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}
                    className="w-9 h-9 border border-[#1D1D1D] flex items-center justify-center text-[#A7A7AA] hover:text-white hover:border-[#C8B993]/50 transition-all">
                    {s.icon}
                  </a>
                ))}
              </div>

              <div className="flex flex-wrap gap-2">
                {["SSL Secure", "POPIA Compliant", "Secure Payments", "Worldwide Shipping"].map((b) => (
                  <span key={b} className="text-[9px] font-semibold text-[#A7A7AA] border border-[#1D1D1D] px-2 py-1">{b}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="gold-divider mt-10 mb-5" />
          <p className="text-center text-gray-600 text-xs">
            &copy; {new Date().getFullYear()} Bevanssons. All Rights Reserved. &nbsp;|&nbsp; Reg: 2023/116995/07 &nbsp;|&nbsp;
            36 Houer Road, City Deep, Johannesburg, 2197, South Africa
          </p>
        </div>
      </footer>
    </>
  );
}
