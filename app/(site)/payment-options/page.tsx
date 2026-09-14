import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Payment Options | Daisy Gadgets Co.",
  description: "We accept secure instant payments via PayFast — card, Instant EFT, and more. No manual bank transfers or proof of payment needed.",
};

export default function PaymentOptionsPage() {
  return (
    <div className="max-w-4xl mx-auto px-5 sm:px-8 py-20">

      <div className="text-center mb-14">
        <p className="section-label mb-3">How to Pay</p>
        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
          Payment <span className="gold-text">Options</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-xl mx-auto">
          All payments are processed instantly and securely through PayFast — no manual bank transfers, no waiting for verification.
        </p>
      </div>

      {/* Payment methods */}
      <div className="grid sm:grid-cols-2 gap-5 mb-12">
        {[
          { title: "Card Payments", desc: "Visa & Mastercard, processed securely through PayFast. Your order confirms the instant payment clears.", badge: "Instant" },
          { title: "Instant EFT", desc: "Pay directly from your bank account via PayFast's Instant EFT — no need to manually enter our banking details.", badge: null },
          { title: "All Major SA Banks", desc: "PayFast supports Standard Bank, ABSA, Nedbank, Capitec, FNB and more, all from the same secure checkout.", badge: null },
        ].map(({ title, desc, badge }) => (
          <div key={title} className="bg-[#111111] border border-[#1F1F1F] rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <h3 style={{ fontFamily: "var(--font-outfit)", fontWeight: 700, fontSize: 15, color: "#fff" }}>{title}</h3>
              {badge && <span className="text-[9px] font-bold text-[#0A0A0A] bg-[#D4AF37] rounded-full px-2 py-0.5">{badge}</span>}
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>

      {/* How to pay steps */}
      <div className="mb-12">
        <h2 className="text-xl font-bold text-white mb-6">How to Pay</h2>
        <div className="space-y-4">
          {[
            ["Add to Cart",   "Browse our shop and add products to your cart."],
            ["Checkout",      "Enter your details and click through to payment."],
            ["Pay via PayFast", "Choose card, Instant EFT, or another PayFast-supported method and complete payment securely."],
            ["Instant Confirmation", "Your order is confirmed automatically the moment PayFast verifies your payment — no waiting, no proof to upload."],
          ].map(([step, desc], i) => (
            <div key={step as string} className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-full bg-[#D4AF37] text-black font-extrabold text-sm flex items-center justify-center shrink-0">{i + 1}</div>
              <div className="bg-[#111111] border border-[#1F1F1F] rounded-xl px-5 py-4 flex-1">
                <p style={{ fontFamily: "var(--font-outfit)", fontWeight: 700, fontSize: 14, color: "#fff", marginBottom: 4 }}>{step as string}</p>
                <p className="text-gray-400 text-sm">{desc as string}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-[#111111] border border-[#1F1F1F] rounded-2xl p-8 text-center">
        <h3 className="text-xl font-bold text-white mb-3">Questions about payment?</h3>
        <p className="text-gray-400 text-sm mb-6">Our team is happy to help you through the payment process.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/contact" className="btn-gold px-8 py-3.5 rounded-xl font-bold">Contact Us</Link>
          <Link href="/shop" className="btn-outline px-8 py-3.5 rounded-xl font-bold">Start Shopping</Link>
        </div>
      </div>

    </div>
  );
}
