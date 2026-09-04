import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms & Conditions | Daisy Gadgets Co.",
  description: "Read the Terms and Conditions for shopping at Daisy Gadgets Co.",
};

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-5 sm:px-8 py-20">
      <div className="mb-10">
        <p className="section-label mb-3">Legal</p>
        <h1 className="text-4xl font-extrabold text-white mb-2">Terms & <span className="gold-text">Conditions</span></h1>
        <p className="text-gray-500 text-sm">Last updated: August 2025</p>
      </div>

      <div className="prose prose-invert max-w-none space-y-8 text-gray-400 text-sm leading-relaxed">
        {[
          {
            title: "1. Acceptance of Terms",
            body: "By accessing and using the Daisy Gadgets Co. website and placing orders, you accept and agree to be bound by these Terms and Conditions. If you do not agree, please do not use our services.",
          },
          {
            title: "2. Products & Pricing",
            body: "All prices are displayed in South African Rand (ZAR). We reserve the right to change prices without notice. Prices displayed include any applicable discounts (e.g., our August–December 30% special). All products are sold subject to availability.",
          },
          {
            title: "3. Ordering",
            body: "Orders can be placed via our website or directly by email. An order is confirmed only after payment has been received and verified. We reserve the right to cancel any order at our discretion, in which case a full refund will be issued.",
          },
          {
            title: "4. Payment",
            body: "Payment is due at the time of ordering. We accept EFT (bank transfer), PayShap, Visa, and Mastercard. For EFT payments, orders are processed once proof of payment is received and verified. All bank charges are the customer's responsibility.",
          },
          {
            title: "5. Delivery",
            body: "We offer free delivery within South Africa and worldwide. Delivery timeframes are estimates and not guaranteed. Daisy Gadgets Co. is not responsible for delays caused by courier services, customs, or events outside our control.",
          },
          {
            title: "6. Returns & Refunds",
            body: "Returns are accepted within 7 days of delivery for products in original, unopened condition. See our Returns Policy for full details. Refunds are processed within 3–5 business days of receiving the returned item.",
          },
          {
            title: "7. Warranty",
            body: "Products carry the standard manufacturer warranty. Warranty claims must be processed through us. We do not cover damage caused by misuse, accidents, or unauthorised modifications.",
          },
          {
            title: "8. Intellectual Property",
            body: "All content on this website, including logos, images, and text, is the property of Daisy Gadgets Co. and may not be reproduced without written permission.",
          },
          {
            title: "9. Limitation of Liability",
            body: "Daisy Gadgets Co. shall not be liable for any indirect, incidental, or consequential damages arising from the use of our products or services. Our liability is limited to the value of the product purchased.",
          },
          {
            title: "10. Governing Law",
            body: "These Terms and Conditions are governed by the laws of the Republic of South Africa. Any disputes shall be subject to the jurisdiction of South African courts.",
          },
          {
            title: "11. Contact",
            body: "For questions about these Terms, contact us at daisygadgetsco@gmail.com.",
          },
        ].map(({ title, body }) => (
          <div key={title}>
            <h2 style={{ fontFamily: "var(--font-outfit)", fontWeight: 700, fontSize: 16, color: "#fff", marginBottom: 8 }}>{title}</h2>
            <p>{body}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 flex flex-wrap gap-3">
        {[["Privacy Policy", "/policies/privacy"], ["Refund Policy", "/policies/refund"], ["Returns Policy", "/policies/returns"], ["Warranty Policy", "/policies/warranty"]].map(([l, h]) => (
          <Link key={l} href={h} className="text-[#D4AF37] text-sm hover:underline">{l}</Link>
        ))}
      </div>
    </div>
  );
}
