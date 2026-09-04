import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Refund Policy | Daisy Gadgets Co.",
  description: "Our refund policy — when and how we issue refunds for orders at Daisy Gadgets Co.",
};

export default function RefundPage() {
  return (
    <div className="max-w-3xl mx-auto px-5 sm:px-8 py-20">
      <div className="mb-10">
        <p className="section-label mb-3">Legal</p>
        <h1 className="text-4xl font-extrabold text-white mb-2"><span className="gold-text">Refund</span> Policy</h1>
        <p className="text-gray-500 text-sm">Last updated: August 2025</p>
      </div>

      <div className="space-y-8 text-gray-400 text-sm leading-relaxed">
        {[
          {
            title: "1. Refund Eligibility",
            body: "You may be eligible for a refund if: the product is faulty or damaged upon arrival; you received the wrong product; or you cancelled your order before it was dispatched.",
          },
          {
            title: "2. Timeframe",
            body: "Refund requests must be submitted within 7 days of receiving your order. Requests submitted after this period will not be accepted unless a warranty claim is applicable.",
          },
          {
            title: "3. Non-Refundable Items",
            body: "We cannot refund products that have been opened (unless faulty), used, damaged by the customer, or missing original packaging and accessories.",
          },
          {
            title: "4. How to Request a Refund",
            body: "Contact us via email (daisygadgetsco@gmail.com) with your order reference, reason for the refund, and photos if the product is damaged.",
          },
          {
            title: "5. Refund Processing",
            body: "Once your return is received and inspected, we will notify you of the approval or rejection of your refund. If approved, your refund will be processed within 3–5 business days via EFT to your bank account.",
          },
          {
            title: "6. Cancelled Orders",
            body: "Orders cancelled before dispatch will receive a full refund within 1–2 business days. Orders cancelled after dispatch are subject to the returns process.",
          },
          {
            title: "7. Contact Us",
            body: "For refund enquiries: daisygadgetsco@gmail.com",
          },
        ].map(({ title, body }) => (
          <div key={title}>
            <h2 style={{ fontFamily: "var(--font-outfit)", fontWeight: 700, fontSize: 16, color: "#fff", marginBottom: 8 }}>{title}</h2>
            <p>{body}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 flex flex-wrap gap-3">
        {[["Terms & Conditions", "/policies/terms"], ["Privacy Policy", "/policies/privacy"], ["Returns Policy", "/policies/returns"], ["Warranty Policy", "/policies/warranty"]].map(([l, h]) => (
          <Link key={l} href={h} className="text-[#D4AF37] text-sm hover:underline">{l}</Link>
        ))}
      </div>
    </div>
  );
}
