import { getProducts } from "@/lib/products";
import { isClothingCategory, CLOTHING_CATEGORIES } from "@/lib/categories";
import Link from "next/link";
import ClothingClient from "./ClothingClient";
import { Shirt, Plus, Eye, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

export default function AdminClothingPage() {
  const allProducts = getProducts();
  const clothingProducts = allProducts.filter((p) => isClothingCategory(p.category));

  const total = clothingProducts.length;
  const inStock = clothingProducts.filter((p) => p.inStock).length;
  const outStock = clothingProducts.filter((p) => !p.inStock).length;
  const featured = clothingProducts.filter((p) => p.featured).length;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-[#F43F5E]/15 flex items-center justify-center text-[#F43F5E]">
              <Shirt size={18} />
            </div>
            <h1 className="text-xl font-bold text-white">Clothing &amp; Apparel</h1>
          </div>
          <p className="text-gray-500 text-sm">
            Manage streetwear, hoodies, footwear, caps, and seasonal drops.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/clothing"
            target="_blank"
            className="btn-outline px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 text-gray-300 hover:text-white"
          >
            <Eye size={14} />
            <span>View Live</span>
          </Link>
          <Link
            href={`/admin/dashboard/new?category=${encodeURIComponent(CLOTHING_CATEGORIES[0])}`}
            className="btn-gold px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-1.5"
          >
            <Plus size={16} />
            <span>Add Clothing</span>
          </Link>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total Items",    value: total,    color: "text-white" },
          { label: "In Stock",       value: inStock,  color: "text-green-400" },
          { label: "Out of Stock",   value: outStock, color: outStock > 0 ? "text-red-400" : "text-gray-500" },
          { label: "Featured Drops", value: featured, color: "text-[#C8B993]" },
        ].map((s) => (
          <div key={s.label} className="bg-[#1D1D1D] border border-[#2A2A2A] rounded-xl p-4 text-center">
            <p className={`text-2xl font-bold mb-0.5 ${s.color}`}>{s.value}</p>
            <p className="text-gray-500 text-xs">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Main Interactive Client */}
      <ClothingClient initialProducts={clothingProducts} />
    </div>
  );
}
