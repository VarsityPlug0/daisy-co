import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | Daisy Gadgets Co.",
  description: "Our Privacy Policy explains how we collect, use, and protect your personal information in compliance with POPIA.",
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-5 sm:px-8 py-20">
      <div className="mb-10">
        <p className="section-label mb-3">Legal</p>
        <h1 className="text-4xl font-extrabold text-white mb-2"><span className="gold-text">Privacy</span> Policy</h1>
        <p className="text-gray-500 text-sm">Last updated: August 2025 &middot; POPIA Compliant</p>
      </div>

      <div className="space-y-8 text-gray-400 text-sm leading-relaxed">
        {[
          {
            title: "1. Introduction",
            body: "Daisy Gadgets Co. is committed to protecting your privacy. This policy explains what personal information we collect, how we use it, and your rights under the Protection of Personal Information Act (POPIA).",
          },
          {
            title: "2. Information We Collect",
            body: "We collect: your name, email address, phone number, and delivery address when you place an order; payment proof uploads; messages sent via our contact form; and website usage data via analytics.",
          },
          {
            title: "3. How We Use Your Information",
            body: "Your information is used to: process and fulfill your orders; communicate order updates via email; respond to enquiries; improve our products and services; and comply with legal obligations.",
          },
          {
            title: "4. Data Sharing",
            body: "We do not sell your personal information to third parties. We share data only with: delivery partners (for shipping purposes); payment processors; and as required by law.",
          },
          {
            title: "5. Data Security",
            body: "We implement reasonable security measures to protect your data. However, no method of internet transmission is 100% secure. We use SSL encryption on our website and secure storage for all personal data.",
          },
          {
            title: "6. Data Retention",
            body: "We retain your personal information for as long as necessary to fulfill the purposes for which it was collected, including legal and accounting requirements — typically 5 years.",
          },
          {
            title: "7. Your Rights (POPIA)",
            body: "Under POPIA, you have the right to: access your personal information; correct inaccurate data; request deletion of your data; object to processing of your data; and lodge a complaint with the Information Regulator.",
          },
          {
            title: "8. Cookies",
            body: "Our website uses essential cookies for functionality (e.g., shopping cart). We do not use third-party tracking cookies.",
          },
          {
            title: "9. Contact",
            body: "To exercise your rights or for privacy questions, contact: daisygadgetsco@gmail.com.",
          },
        ].map(({ title, body }) => (
          <div key={title}>
            <h2 style={{ fontFamily: "var(--font-outfit)", fontWeight: 700, fontSize: 16, color: "#fff", marginBottom: 8 }}>{title}</h2>
            <p>{body}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 flex flex-wrap gap-3">
        {[["Terms & Conditions", "/policies/terms"], ["Refund Policy", "/policies/refund"], ["Returns Policy", "/policies/returns"], ["Warranty Policy", "/policies/warranty"]].map(([l, h]) => (
          <Link key={l} href={h} className="text-[#D4AF37] text-sm hover:underline">{l}</Link>
        ))}
      </div>
    </div>
  );
}
