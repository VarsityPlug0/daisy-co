import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "FAQ — Frequently Asked Questions | Daisy Gadgets Co.",
  description: "Answers to common questions about ordering, delivery, payment, warranties, returns and more at Daisy Gadgets Co.",
};

const sections = [
  {
    title: "Orders & Shopping",
    items: [
      {
        q: "How do I place an order?",
        a: "Browse our shop, add items to your cart, and proceed to checkout. You can also email us directly with the product name and we'll assist you through the process.",
      },
      {
        q: "Can I order by email?",
        a: "Yes! Many customers prefer to order directly by messaging us. Send us the product name and your delivery address via our Contact page and we'll create an order for you.",
      },
      {
        q: "Do you offer bulk or business pricing?",
        a: "Yes. Orders over R10,000 automatically qualify for a 25% discount. For larger business orders, contact us to discuss custom pricing.",
      },
      {
        q: "What is the 30% August–December Special?",
        a: "From August to December, selected product categories (Home Appliances, Tablets, and Watches) are discounted by 30%. This is applied automatically. No coupon code needed.",
      },
    ],
  },
  {
    title: "Payment",
    items: [
      {
        q: "What payment methods do you accept?",
        a: "We accept EFT (bank transfer), Visa, and Mastercard. Our bank details are: TymeBank, Account: 51072673949, Branch: 678910.",
      },
      {
        q: "Is it safe to pay via EFT?",
        a: "Yes. All EFT payments go directly to our verified TymeBank business account. You will receive an order reference to use as your payment reference.",
      },
      {
        q: "When do I upload proof of payment?",
        a: "After placing your order online, you'll be shown our bank details and prompted to upload your proof of payment. Once verified (usually within 2–4 hours), your order is confirmed.",
      },
      {
        q: "How long does payment verification take?",
        a: "Typically 2–4 hours during business hours. We'll send you a confirmation email once your payment is verified.",
      },
    ],
  },
  {
    title: "Delivery & Shipping",
    items: [
      {
        q: "Do you offer same-day delivery?",
        a: "Yes, same-day delivery is available within the Cape Town metro area and select Johannesburg areas, depending on stock location. Orders must be placed before 11am. Contact us to confirm availability.",
      },
      {
        q: "Do you ship internationally?",
        a: "Yes! We ship worldwide. International shipping rates and timelines vary by country. Contact us by email for a shipping quote.",
      },
      {
        q: "How long does delivery take in South Africa?",
        a: "Most deliveries within South Africa take 1–3 business days. Remote areas may take 3–5 business days. Same-day delivery is available in select areas.",
      },
      {
        q: "How do I track my order?",
        a: "Visit our Track Order page and enter your order reference number. You can also email us with your order reference for a status update.",
      },
    ],
  },
  {
    title: "Products & Warranty",
    items: [
      {
        q: "Are your products genuine / authentic?",
        a: "Yes, 100%. All our products are sourced from authorised distributors and come with original manufacturer packaging and warranty documentation.",
      },
      {
        q: "What warranty do products come with?",
        a: "Most products come with the standard manufacturer warranty (typically 12–24 months). Specific warranty details are listed on each product page. See our Warranty Policy for full details.",
      },
      {
        q: "What if my product arrives damaged?",
        a: "Contact us immediately via email with photos of the damage. We will arrange a replacement or refund as per our returns policy.",
      },
      {
        q: "Can I request a product not listed on your site?",
        a: "Absolutely. We source a wide range of products. Send us the product name and model by email and we'll check availability and pricing for you.",
      },
    ],
  },
  {
    title: "Returns & Refunds",
    items: [
      {
        q: "What is your return policy?",
        a: "We accept returns within 7 days of delivery for products in their original, unopened condition. See our Returns Policy page for full details.",
      },
      {
        q: "How do I initiate a return?",
        a: "Email us with your order reference and reason for return. Our team will guide you through the process.",
      },
      {
        q: "How long do refunds take?",
        a: "Once your return is received and inspected, refunds are processed within 3–5 business days back to your original payment method.",
      },
    ],
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: sections.flatMap((s) =>
    s.items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    }))
  ),
};

export default function FAQPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
    <div className="max-w-4xl mx-auto px-5 sm:px-8 py-20">

      <div className="text-center mb-14">
        <p className="section-label mb-3">Help Centre</p>
        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
          Frequently Asked <span className="gold-text">Questions</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-xl mx-auto">
          Can&apos;t find your answer? Email us and we&apos;ll help immediately.
        </p>
      </div>

      <div className="space-y-10">
        {sections.map((section) => (
          <div key={section.title}>
            <h2 className="text-xl font-bold text-white mb-5 flex items-center gap-3">
              <span className="text-[#D4AF37]">/</span> {section.title}
            </h2>
            <div className="space-y-3">
              {section.items.map((item) => (
                <details key={item.q} className="group bg-[#111111] border border-[#1F1F1F] rounded-2xl overflow-hidden">
                  <summary className="flex items-center justify-between px-6 py-5 cursor-pointer select-none list-none">
                    <span style={{ fontFamily: "var(--font-outfit)", fontWeight: 600, fontSize: 15, color: "#F0F0F0" }}>{item.q}</span>
                    <svg className="shrink-0 ml-3 transition-transform duration-200 group-open:rotate-180" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="2.5"><path d="M6 9l6 6 6-6" /></svg>
                  </summary>
                  <div className="px-6 pb-5 text-gray-400 text-sm leading-relaxed border-t border-[#1F1F1F] pt-4">
                    {item.a}
                  </div>
                </details>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-14 bg-[#111111] border border-[#D4AF37]/20 rounded-2xl p-8 text-center">
        <h3 className="text-xl font-bold text-white mb-3">Still have questions?</h3>
        <p className="text-gray-400 mb-6 text-sm">Our team is ready to help. Send us a message and we'll get back to you quickly.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/contact" className="btn-gold px-8 py-3.5 rounded-xl font-bold">Send a Message</Link>
        </div>
      </div>

    </div>
    </>
  );
}
