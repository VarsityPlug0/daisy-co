import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getSiteImages } from "@/lib/siteImages";
import ChatButton from "@/components/ChatButton";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Electronics Store — Smart TVs, Gaming & More | Daisy & Co.",
  description: "Shop smart TVs, PlayStation 5, Xbox, laptops, Bluetooth speakers and accessories at competitive prices. Fast delivery across South Africa.",
};

const categoryDefs = [
  { name: "Smart TVs",    items: [
    { name: '43" 4K Smart TV',   price: "From R5,499",  imgKey: "elec.tv_1" },
    { name: '55" QLED Smart TV', price: "From R7,999",  imgKey: "elec.tv_2" },
    { name: '65" 4K Android TV', price: "From R10,999", imgKey: "elec.tv_3" },
    { name: '75" Premium 4K TV', price: "From R18,500", imgKey: "elec.tv_4" },
  ]},
  { name: "Gaming",       items: [
    { name: "PlayStation 5 Console", price: "From R12,999", imgKey: "elec.game_1" },
    { name: "Xbox Series X",         price: "From R11,499", imgKey: "elec.game_2" },
    { name: "Gaming Controllers",    price: "From R899",    imgKey: "elec.game_3" },
    { name: "Gaming Headsets",       price: "From R699",    imgKey: "elec.game_4" },
  ]},
  { name: "Home & Office", items: [
    { name: "Laptop Computers",            price: "From R6,999", imgKey: "elec.office_1" },
    { name: "Wireless Keyboards & Mice",   price: "From R499",   imgKey: "elec.office_2" },
    { name: "Portable Bluetooth Speakers", price: "From R899",   imgKey: "elec.office_3" },
    { name: "USB Hubs & Accessories",      price: "From R299",   imgKey: "elec.office_4" },
  ]},
  { name: "Accessories",  items: [
    { name: "HDMI Cables & Adapters",  price: "From R149", imgKey: "elec.acc_1" },
    { name: "Phone Charging Cables",   price: "From R99",  imgKey: "elec.acc_2" },
    { name: "Power Banks",             price: "From R499", imgKey: "elec.acc_3" },
    { name: "Cable Management",        price: "From R199", imgKey: "elec.acc_4" },
  ]},
];

export default function Electronics() {
  const allKeys = categoryDefs.flatMap(c => c.items.map(i => i.imgKey));
  const imgs = getSiteImages(allKeys);
  const categories = categoryDefs.map(c => ({ ...c, items: c.items.map(i => ({ ...i, img: imgs[i.imgKey] })) }));
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12">

      {/* Header */}
      <div className="text-center mb-10">
        <p className="text-[#D4AF37] text-sm uppercase tracking-widest mb-3">Gadgets & Gear</p>
        <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-3">
          Electronics <span className="gold-text">Store</span>
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto text-base leading-relaxed">
          Smart TVs, gaming consoles, home and office electronics — all at competitive prices with delivery across South Africa.
        </p>
      </div>

      <div className="space-y-12">
        {categories.map((cat) => (
          <div key={cat.name}>
            {/* Category heading */}
            <div className="flex items-center gap-5 mb-8">
              <h2 className="text-2xl font-bold text-white whitespace-nowrap">{cat.name}</h2>
              <div className="flex-1 h-px bg-[#1F1F1F]" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {cat.items.map((item) => (
                <div key={item.name} className="bg-[#111111] border border-[#1F1F1F] rounded-2xl overflow-hidden card-hover flex flex-col group">
                  {/* Image */}
                  <div className="relative h-64 bg-[#0f0f0f] overflow-hidden">
                    <Image
                      src={item.img}
                      alt={item.name}
                      fill
                      className="object-contain transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#111111]/70 to-transparent" />
                  </div>

                  {/* Text */}
                  <div className="p-4 flex flex-col flex-1">
                    <p className="text-xs text-[#D4AF37] uppercase tracking-wider mb-1.5">{cat.name}</p>
                    <p className="font-semibold text-white text-sm leading-snug mb-2 flex-1">{item.name}</p>
                    <div className="flex items-center gap-2 mb-3">
                      <p className="text-[#D4AF37] font-bold text-lg">{item.price}</p>
                      <p className="text-gray-600 text-sm line-through">From R {Math.round((parseFloat(item.price.replace(/[^0-9.]/g, "")) || 0) / 0.7).toLocaleString()}</p>
                    </div>
                    <ChatButton
                      message={`Hi, I'm interested in the ${item.name} (${item.price}). Can you help me?`}
                      className="btn-gold w-full py-3 rounded-xl text-sm font-bold"
                    >
                      Chat with Us
                    </ChatButton>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="mt-12 bg-[#111111] border border-[#1F1F1F] rounded-2xl p-7 text-center">
        <h3 className="text-xl font-bold text-white mb-3">Don&apos;t see what you&apos;re looking for?</h3>
        <p className="text-gray-400 text-base mb-5 max-w-lg mx-auto leading-relaxed">
          We source a wide range of electronics. Contact us and we will find it for you.
        </p>
        <Link href="/contact" className="btn-gold px-10 py-4 rounded-xl font-bold text-base">
          Contact Us
        </Link>
      </div>
    </div>
  );
}
