import { getProducts } from "@/lib/products";
import Link from "next/link";
import ProductsClient from "./ProductsClient";

export const dynamic = "force-dynamic";

export default function ProductsPage() {
  const products = getProducts();

  const total     = products.length;
  const inStock   = products.filter((p) => p.inStock).length;
  const outStock  = products.filter((p) => !p.inStock).length;
  const featured  = products.filter((p) => p.featured).length;

  const catCounts = products.reduce<Record<string, number>>((acc, p) => {
    acc[p.category] = (acc[p.category] ?? 0) + 1;
    return acc;
  }, {});
  const categoriesSorted = Object.entries(catCounts).sort((a, b) => b[1] - a[1]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">Products</h1>
          <p className="text-gray-500 text-sm mt-0.5">{total} products across {categoriesSorted.length} categories</p>
        </div>
        <Link href="/admin/dashboard/new" className="btn-gold px-4 py-2.5 rounded-xl text-sm font-bold">
          + Add Product
        </Link>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total",        value: total,    color: "text-white" },
          { label: "In Stock",     value: inStock,  color: "text-green-400" },
          { label: "Out of Stock", value: outStock, color: outStock > 0 ? "text-red-400" : "text-gray-500" },
          { label: "Featured",     value: featured, color: "text-[#C8B993]" },
        ].map((s) => (
          <div key={s.label} className="bg-[#1D1D1D] border border-[#2A2A2A] rounded-xl p-4 text-center">
            <p className={`text-2xl font-bold mb-0.5 ${s.color}`}>{s.value}</p>
            <p className="text-gray-500 text-xs">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Category breakdown */}
      <div className="bg-[#1D1D1D] border border-[#2A2A2A] rounded-xl px-4 py-3 mb-6 flex flex-wrap gap-2">
        {categoriesSorted.map(([name, count]) => (
          <span key={name} className="flex items-center gap-1.5 text-xs bg-white/5 rounded-lg px-3 py-1.5">
            <span className="text-gray-400">{name}</span>
            <span className="font-bold text-[#C8B993]">{count}</span>
          </span>
        ))}
      </div>

      {/* Searchable / filterable table */}
      <ProductsClient products={products} />
    </div>
  );
}
