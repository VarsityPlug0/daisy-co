import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Warranty Policy | Daisy Gadgets Co.",
  description: "Our warranty policy — what is covered and how to claim warranty on products purchased from Daisy Gadgets Co.",
};

export default function WarrantyPage() {
  return (
    <div className="max-w-3xl mx-auto px-5 sm:px-8 py-20">
      <div className="mb-10">
        <p className="section-label mb-3">Legal</p>
        <h1 className="text-4xl font-extrabold text-white mb-2"><span className="gold-text">Warranty</span> Policy</h1>
        <p className="text-gray-500 text-sm">Last updated: August 2025</p>
      </div>

      <div className="space-y-8 text-gray-400 text-sm leading-relaxed">
        {[
          {
            title: "1. Warranty Coverage",
            body: "All products sold by Daisy Gadgets Co. come with the standard manufacturer warranty. Most products carry a 12–24 month warranty. Specific warranty periods are listed on each product page.",
          },
          {
            title: "2. What Is Covered",
            body: "Warranty covers manufacturing defects, component failures under normal use, and factory faults. We sell 100% authentic products from authorised suppliers, ensuring valid manufacturer warranties.",
          },
          {
            title: "3. What Is Not Covered",
            body: "Warranty does not cover: physical damage caused by the customer; water or liquid damage; damage from misuse, accidents, or unauthorised repairs; cosmetic damage (scratches, dents); and normal wear and tear.",
          },
          {
            title: "4. How to Claim Warranty",
            body: "Step 1: Contact us via email with your order reference and a description of the issue. Step 2: Provide photos or a video demonstrating the fault. Step 3: We will assess the claim and advise on the next steps — this may include repair, replacement, or refund depending on the situation.",
          },
          {
            title: "5. Warranty Processing Time",
            body: "Warranty assessments typically take 3–7 business days. Repairs or replacements may take additional time depending on the manufacturer and product availability.",
          },
          {
            title: "6. Replacement vs Repair",
            body: "Where possible, we offer a direct replacement for faulty items. If a replacement is not available, we will arrange a repair or issue a store credit or refund.",
          },
          {
            title: "7. International Warranty",
            body: "For customers outside South Africa, warranty is handled through us directly. You do not need to send items back to the manufacturer. Contact us and we will guide the process.",
          },
          {
            title: "8. Contact",
            body: "Warranty claims: daisygadgetsco@gmail.com",
          },
        ].map(({ title, body }) => (
          <div key={title}>
            <h2 style={{ fontFamily: "var(--font-outfit)", fontWeight: 700, fontSize: 16, color: "#fff", marginBottom: 8 }}>{title}</h2>
            <p>{body}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 flex flex-wrap gap-3">
        {[["Terms & Conditions", "/policies/terms"], ["Privacy Policy", "/policies/privacy"], ["Refund Policy", "/policies/refund"], ["Returns Policy", "/policies/returns"]].map(([l, h]) => (
          <Link key={l} href={h} className="text-[#D4AF37] text-sm hover:underline">{l}</Link>
        ))}
      </div>
    </div>
  );
}
