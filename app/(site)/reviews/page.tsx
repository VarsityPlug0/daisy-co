import type { Metadata } from "next";
import Link from "next/link";
import { Star } from "lucide-react";

export const metadata: Metadata = {
  title: "Customer Reviews | Daisy Gadgets Co.",
  description: "Read real customer reviews and testimonials for Daisy Gadgets Co. Trusted by hundreds of happy customers across South Africa.",
};

const reviews = [
  { name: "Thabo M.",    location: "Johannesburg",  product: "PlayStation 5",           stars: 5, date: "Dec 2024", text: "Received my PS5 in perfect condition. Delivery was incredibly fast — next day from Cape Town to Joburg. Will definitely be ordering again. The WhatsApp support was excellent throughout." },
  { name: "Sarah K.",    location: "Cape Town",      product: "iPhone 15 Pro Max",       stars: 5, date: "Nov 2024", text: "The iPhone I ordered was exactly as described. Came sealed in original Apple packaging with all accessories. Amazing service and super fast delivery." },
  { name: "Mpho D.",     location: "Durban",         product: "Samsung 65\" QLED TV",   stars: 5, date: "Oct 2024", text: "Ordered a Samsung QLED TV during the August special. Saved over R3,000! TV arrived perfectly packaged. Setup guidance via WhatsApp was a bonus I didn't expect." },
  { name: "Riaan V.",    location: "Pretoria",       product: "5kVA Inverter Bundle",    stars: 5, date: "Sep 2024", text: "The solar inverter system arrived well-packaged and exactly as described. The team guided me through setup on WhatsApp. Load shedding is no longer a problem!" },
  { name: "Naledi B.",   location: "Bloemfontein",   product: "MacBook Pro M3",          stars: 5, date: "Nov 2024", text: "Bought a MacBook Pro for design work. Arrived sealed with full warranty. Price was unbeatable with the 30% discount. Will recommend to everyone." },
  { name: "James T.",    location: "Port Elizabeth", product: "Xbox Series X",           stars: 5, date: "Oct 2024", text: "Smooth transaction from start to finish. Got an Xbox Series X at a great price. EFT payment was straightforward and they confirmed within 2 hours. Fast delivery too!" },
  { name: "Priya N.",    location: "Sandton",        product: "Samsung Galaxy S24 Ultra", stars: 5, date: "Dec 2024", text: "Legitimate sealed Samsung phone. Paid via EFT and uploaded proof — confirmed within the hour. Delivered the next morning. Absolutely brilliant service." },
  { name: "Calvin O.",   location: "Soweto",         product: "LG 55\" OLED TV",         stars: 5, date: "Aug 2024", text: "First time ordering from Daisy Gadgets. Was nervous but they kept me updated every step of the way via WhatsApp. TV arrived perfect. 10/10 experience." },
  { name: "Fatima A.",   location: "Cape Town",      product: "iPhone 14",               stars: 5, date: "Sep 2024", text: "Got an iPhone 14 for my mom as a gift. It arrived gift-wrapped in the original box. She was thrilled! Fast delivery and great prices." },
  { name: "Derek H.",    location: "Polokwane",      product: "Hisense 75\" TV",         stars: 5, date: "Jul 2024", text: "Great experience! Big screen TV delivered to Limpopo without any issues. Well-packaged and arrived in perfect condition. Customer service was top notch." },
  { name: "Zanele M.",   location: "East London",    product: "Dell Gaming Laptop",      stars: 5, date: "Dec 2024", text: "Ordered a gaming laptop for my son as a Christmas gift. Arrived ahead of schedule. Great quality product at a fantastic price with the discount applied." },
  { name: "Kyle P.",     location: "George",         product: "PS5 Controller",          stars: 5, date: "Nov 2024", text: "Quick and efficient. Ordered on WhatsApp, paid via EFT, and got my PS5 controller in 2 days. Will be back for more gadgets for sure!" },
];

const avg = (reviews.reduce((s, r) => s + r.stars, 0) / reviews.length).toFixed(1);

export default function ReviewsPage() {
  return (
    <div className="max-w-6xl mx-auto px-5 sm:px-8 py-20">

      <div className="text-center mb-14">
        <p className="section-label mb-3">Real Customers</p>
        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
          What Customers <span className="gold-text">Say</span>
        </h1>
        <div className="flex items-center justify-center gap-3 mt-4">
          <div className="flex gap-1">
            {[1,2,3,4,5].map(i => <Star key={i} size={22} fill="#D4AF37" color="#D4AF37" />)}
          </div>
          <span className="text-2xl font-extrabold text-white">{avg}</span>
          <span className="text-gray-500 text-sm">({reviews.length} reviews)</span>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-14">
        {reviews.map((r) => (
          <div key={r.name + r.product} className="bg-[#111111] border border-[#1F1F1F] rounded-2xl p-6">
            <div className="flex gap-0.5 mb-3">
              {Array.from({ length: r.stars }).map((_, i) => (
                <Star key={i} size={13} fill="#D4AF37" color="#D4AF37" />
              ))}
            </div>
            <p className="text-gray-300 text-sm leading-relaxed mb-4">&ldquo;{r.text}&rdquo;</p>
            <div className="border-t border-[#1F1F1F] pt-4 flex items-center justify-between">
              <div>
                <p style={{ fontFamily: "var(--font-outfit)", fontWeight: 700, fontSize: 13, color: "#fff" }}>{r.name}</p>
                <p className="text-xs text-gray-600">{r.location} &middot; {r.product}</p>
              </div>
              <span className="text-xs text-gray-600">{r.date}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-[#111111] border border-[#D4AF37]/20 rounded-2xl p-10 text-center">
        <h3 className="text-2xl font-bold text-white mb-3">Join Our Happy Customers</h3>
        <p className="text-gray-400 mb-8 max-w-lg mx-auto">
          Shop with confidence. Premium gadgets, genuine products, and unbeatable prices — backed by real customer experiences.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/shop" className="btn-gold px-10 py-4 rounded-xl font-bold">Shop Now</Link>
          <Link href="/contact" className="btn-outline px-10 py-4 rounded-xl font-bold">Contact Us</Link>
        </div>
      </div>

    </div>
  );
}
