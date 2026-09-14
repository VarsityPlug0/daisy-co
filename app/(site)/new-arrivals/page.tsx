import { getProducts } from "@/lib/products";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Package, Sparkles } from "lucide-react";
import AddToEnquiry from "@/app/(site)/shop/AddToEnquiry";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "New Arrivals | Bevanssons",
  description: "Shop the latest gadgets just added to our store. New smartphones, TVs, gaming consoles, laptops and more.",
};

export default async function NewArrivalsPage() {
  const all = getProducts().filter((p) => p.inStock);
  const products = [...all].reverse().slice(0, 32);

  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-8 py-16">

      <div className="mb-12">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={16} color="#D4AF37" />
          <p className="text-[#D4AF37] text-sm uppercase tracking-widest font-bold">Just Landed</p>
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
          New <span className="gold-text">Arrivals</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-xl">
          The latest additions to our store. Fresh stock across all categories.
        </p>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-16">
          <Package size={48} color="#2a2a2a" strokeWidth={1} className="mx-auto mb-4" />
          <p className="text-gray-500">Check back soon for new arrivals!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {products.map((p) => (
            <Link key={p.id} href={`/shop/${p.id}`}
              className="bg-[#111111] border border-[#1F1F1F] rounded-2xl overflow-hidden card-hover flex flex-col group">
              <div className="relative h-64 bg-[#0f0f0f] overflow-hidden">
                {p.imageUrl ? (
                  <Image src={p.imageUrl} alt={p.name} fill
                    className="object-contain transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package size={40} color="#2a2a2a" strokeWidth={1} />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#111111]/60 to-transparent" />
                <span className="absolute top-3 left-3 bg-[#111] border border-[#D4AF37]/40 text-[#D4AF37] text-[10px] font-bold px-2.5 py-1 rounded-full">New</span>
              </div>
              <div className="p-5 flex flex-col flex-1">
                <p className="text-[10px] text-[#D4AF37] uppercase tracking-wider mb-1.5">{p.category}</p>
                <p className="font-semibold text-white text-sm leading-snug mb-2 flex-1 line-clamp-2">{p.name}</p>
                <p className="text-[#D4AF37] font-bold text-lg mb-3">{p.price}</p>
                <AddToEnquiry id={p.id} name={p.name} price={p.price} imageUrl={p.imageUrl} category={p.category} />
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="mt-12 text-center">
        <Link href="/shop" className="btn-outline px-10 py-4 rounded-xl font-bold">Browse All Products</Link>
      </div>
    </div>
  );
}
