import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Returns Policy | Daisy Gadgets Co.",
  description: "Our returns policy — how to return a product and what to expect at Daisy Gadgets Co.",
};

export default function ReturnsPage() {
  return (
    <div className="max-w-3xl mx-auto px-5 sm:px-8 py-20">
      <div className="mb-10">
        <p className="section-label mb-3">Legal</p>
        <h1 className="text-4xl font-extrabold text-white mb-2"><span className="gold-text">Returns</span> Policy</h1>
        <p className="text-gray-500 text-sm">Last updated: August 2025</p>
      </div>

      <div className="space-y-8 text-gray-400 text-sm leading-relaxed">
        {[
          {
            title: "1. Return Window",
            body: "You have 7 days from the date of delivery to initiate a return. After 7 days, returns will only be accepted for warranty-related defects.",
          },
          {
            title: "2. Conditions for Return",
            body: "Items must be: in their original, unused condition; in original packaging with all accessories, manuals, and documentation; accompanied by your order reference number.",
          },
          {
            title: "3. Non-Returnable Items",
            body: "The following cannot be returned unless faulty: opened software or digital goods; items that have been used, damaged, or modified by the customer; items missing original packaging.",
          },
          {
            title: "4. How to Return",
            body: "Step 1: Contact us via email with your order reference and reason for return. Step 2: We will provide return shipping instructions. Step 3: Package the item securely and ship it to us. Step 4: Once received and inspected, we process your refund or exchange.",
          },
          {
            title: "5. Return Shipping",
            body: "If the product is faulty or incorrectly sent, we will cover return shipping costs. For change-of-mind returns, the customer is responsible for return shipping.",
          },
          {
            title: "6. Exchanges",
            body: "We offer exchanges for faulty products or where the wrong item was sent. Contact us to arrange an exchange.",
          },
          {
            title: "7. Damaged on Arrival",
            body: "If your product arrives damaged, contact us immediately via email with photos of the damage and packaging. We will arrange a replacement or full refund.",
          },
          {
            title: "8. Contact",
            body: "Returns enquiries: daisygadgetsco@gmail.com",
          },
        ].map(({ title, body }) => (
          <div key={title}>
            <h2 style={{ fontFamily: "var(--font-outfit)", fontWeight: 700, fontSize: 16, color: "#fff", marginBottom: 8 }}>{title}</h2>
            <p>{body}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 flex flex-wrap gap-3">
        {[["Terms & Conditions", "/policies/terms"], ["Privacy Policy", "/policies/privacy"], ["Refund Policy", "/policies/refund"], ["Warranty Policy", "/policies/warranty"]].map(([l, h]) => (
          <Link key={l} href={h} className="text-[#D4AF37] text-sm hover:underline">{l}</Link>
        ))}
      </div>
    </div>
  );
}
