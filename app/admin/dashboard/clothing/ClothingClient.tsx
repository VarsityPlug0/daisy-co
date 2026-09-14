"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import DeleteButton from "../DeleteButton";
import dynamic from "next/dynamic";
import { CLOTHING_CATEGORIES } from "@/lib/categories";
import { Plus, Scissors, Shirt, Sparkles, Flame, Footprints, Tag, Eye } from "lucide-react";

const ImageCropper = dynamic(() => import("@/components/ImageCropper"), { ssr: false });

type Product = {
  id: string;
  name: string;
  price: string;
  originalPrice?: string;
  category: string;
  description?: string;
  imageUrl?: string;
  inStock: boolean | number;
  featured: boolean | number;
};

const CAT_ICONS: Record<string, React.ElementType> = {
  "Hoodies & Streetwear": Flame,
  "Men's Wear":           Shirt,
  "Women's Fashion":      Sparkles,
  "Sneakers & Shoes":     Footprints,
  "Caps & Accessories":   Tag,
  "Clothing & Apparel":   Shirt,
};

export default function ClothingClient({ initialProducts }: { initialProducts: Product[] }) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState("All");
  const [stockFilter, setStockFilter] = useState("All");
  const [cropProduct, setCropProduct] = useState<Product | null>(null);
  const [cropSaving, setCropSaving] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Quick toggle in-stock / out of stock
  async function toggleStock(product: Product) {
    const nextState = !product.inStock;
    setUpdatingId(product.id);
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inStock: nextState }),
      });
      if (res.ok) {
        setProducts((prev) =>
          prev.map((p) => (p.id === product.id ? { ...p, inStock: nextState } : p))
        );
      }
    } finally {
      setUpdatingId(null);
    }
  }

  // Quick toggle featured
  async function toggleFeatured(product: Product) {
    const nextState = !product.featured;
    setUpdatingId(product.id);
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featured: nextState }),
      });
      if (res.ok) {
        setProducts((prev) =>
          prev.map((p) => (p.id === product.id ? { ...p, featured: nextState } : p))
        );
      }
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleCropDone(blob: Blob) {
    if (!cropProduct) return;
    setCropSaving(true);
    try {
      const arrayBuffer = await blob.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      let binary = "";
      for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
      const base64 = btoa(binary);
      const uploadRes = await fetch("/api/admin/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file: base64, mimeType: "image/jpeg", filename: "clothing-crop.jpg" }),
      });
      const { url } = await uploadRes.json();
      if (url) {
        await fetch(`/api/admin/products/${cropProduct.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageUrl: url }),
        });
        setProducts((prev) =>
          prev.map((p) => (p.id === cropProduct.id ? { ...p, imageUrl: url } : p))
        );
      }
    } finally {
      setCropSaving(false);
      setCropProduct(null);
    }
  }

  const catCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of products) {
      counts[p.category] = (counts[p.category] ?? 0) + 1;
    }
    return counts;
  }, [products]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return products.filter((p) => {
      if (selectedCat !== "All" && p.category !== selectedCat) return false;
      if (stockFilter === "In Stock" && !p.inStock) return false;
      if (stockFilter === "Out of Stock" && p.inStock) return false;
      if (stockFilter === "Featured" && !p.featured) return false;
      if (q && !p.name.toLowerCase().includes(q) && !p.category.toLowerCase().includes(q) && !(p.description || "").toLowerCase().includes(q)) {
        return false;
      }
      return true;
    });
  }, [products, search, selectedCat, stockFilter]);

  return (
    <>
      {/* Category Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-5 no-scrollbar">
        <button
          onClick={() => setSelectedCat("All")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            selectedCat === "All"
              ? "bg-[#C8B993] text-black shadow-lg shadow-[#C8B993]/20"
              : "bg-[#1D1D1D] border border-[#2A2A2A] text-gray-400 hover:text-white hover:border-[#C8B993]/40"
          }`}
        >
          <span>All Clothing</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
            selectedCat === "All" ? "bg-black/20 text-black" : "bg-white/10 text-gray-400"
          }`}>
            {products.length}
          </span>
        </button>

        {CLOTHING_CATEGORIES.map((c) => {
          const Icon = CAT_ICONS[c] || Shirt;
          const count = catCounts[c] ?? 0;
          const active = selectedCat === c;
          return (
            <button
              key={c}
              onClick={() => setSelectedCat(c)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                active
                  ? "bg-[#C8B993] text-black shadow-lg shadow-[#C8B993]/20"
                  : "bg-[#1D1D1D] border border-[#2A2A2A] text-gray-400 hover:text-white hover:border-[#C8B993]/40"
              }`}
            >
              <Icon size={14} className={active ? "text-black" : "text-[#C8B993]"} />
              <span>{c}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                active ? "bg-black/20 text-black" : "bg-white/10 text-gray-400"
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filter Row */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <input
          type="text"
          placeholder="Search streetwear, hoodies, shoes…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-[#1D1D1D] border border-[#2A2A2A] rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#C8B993]/40"
        />

        <select
          value={stockFilter}
          onChange={(e) => setStockFilter(e.target.value)}
          className="bg-[#1D1D1D] border border-[#2A2A2A] rounded-xl px-4 py-2.5 text-sm text-gray-300 focus:outline-none focus:border-[#C8B993]/40"
        >
          {["All", "In Stock", "Out of Stock", "Featured"].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <Link
          href={`/admin/dashboard/new?category=${encodeURIComponent(selectedCat !== "All" ? selectedCat : "Hoodies & Streetwear")}`}
          className="btn-gold px-5 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shrink-0"
        >
          <Plus size={16} />
          <span>Add Clothing Item</span>
        </Link>
      </div>

      {/* Count */}
      <div className="flex items-center justify-between mb-3 text-xs text-gray-500">
        <p>Showing {filtered.length} item{filtered.length !== 1 ? "s" : ""}</p>
        <Link href="/clothing" target="_blank" className="flex items-center gap-1 text-[#C8B993] hover:underline">
          <Eye size={13} />
          <span>View Public Clothing Store</span>
        </Link>
      </div>

      {/* Table / Grid */}
      {filtered.length === 0 ? (
        <div className="bg-[#1D1D1D] border border-[#2A2A2A] rounded-2xl p-12 text-center">
          <Shirt size={36} className="mx-auto text-gray-600 mb-3" />
          <p className="text-gray-400 font-semibold mb-1">No clothing items match your search or filter.</p>
          <p className="text-gray-600 text-xs mb-5">Try changing the category or adding a new clothing product.</p>
          <Link
            href={`/admin/dashboard/new?category=${encodeURIComponent(selectedCat !== "All" ? selectedCat : "Hoodies & Streetwear")}`}
            className="btn-gold px-4 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5"
          >
            <Plus size={14} />
            <span>Create Clothing Item</span>
          </Link>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block bg-[#1D1D1D] border border-[#2A2A2A] rounded-2xl overflow-hidden shadow-xl">
            <div className="grid grid-cols-[60px_1fr_130px_160px_150px_130px] gap-3 px-5 py-3.5 border-b border-[#2A2A2A] bg-[#141414]">
              {["Image", "Item Name", "Price", "Category", "Availability", "Actions"].map((h) => (
                <p key={h} className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold">{h}</p>
              ))}
            </div>

            <div className="divide-y divide-[#1A1A1A]">
              {filtered.map((p) => {
                const Icon = CAT_ICONS[p.category] || Shirt;
                const isUpdating = updatingId === p.id;

                return (
                  <div
                    key={p.id}
                    className="grid grid-cols-[60px_1fr_130px_160px_150px_130px] gap-3 items-center px-5 py-3.5 hover:bg-white/[0.02] transition-colors"
                  >
                    {/* Image */}
                    <div className="w-12 h-14 rounded-lg overflow-hidden bg-[#111111] border border-[#2A2A2A] shrink-0 relative group/img">
                      {p.imageUrl ? (
                        <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-700 text-xs">
                          <Shirt size={18} />
                        </div>
                      )}
                    </div>

                    {/* Title & Desc */}
                    <div className="min-w-0 pr-2">
                      <p className="text-white font-medium text-sm truncate">{p.name}</p>
                      <p className="text-gray-500 text-xs truncate mt-0.5">
                        {p.description || "No description set"}
                      </p>
                    </div>

                    {/* Price */}
                    <div>
                      <p className="text-[#C8B993] font-extrabold text-sm">{p.price}</p>
                      {p.originalPrice && (
                        <p className="text-gray-600 text-xs line-through">{p.originalPrice}</p>
                      )}
                    </div>

                    {/* Category Pill */}
                    <div>
                      <span className="inline-flex items-center gap-1.5 text-xs bg-white/5 border border-white/10 text-gray-300 rounded-lg px-2.5 py-1">
                        <Icon size={12} className="text-[#C8B993]" />
                        <span className="truncate max-w-[120px]">{p.category}</span>
                      </span>
                    </div>

                    {/* Stock & Featured Toggles */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleStock(p)}
                        disabled={isUpdating}
                        className={`text-[10px] px-2.5 py-1 rounded-full font-bold transition-all ${
                          p.inStock
                            ? "bg-green-500/15 text-green-400 border border-green-500/30 hover:bg-green-500/25"
                            : "bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/25"
                        }`}
                        title="Click to toggle In Stock / Out of Stock"
                      >
                        {p.inStock ? "In Stock" : "Out of Stock"}
                      </button>

                      <button
                        onClick={() => toggleFeatured(p)}
                        disabled={isUpdating}
                        className={`text-[10px] px-2.5 py-1 rounded-full font-bold transition-all ${
                          p.featured
                            ? "bg-[#C8B993]/20 text-[#C8B993] border border-[#C8B993]/40"
                            : "bg-white/5 text-gray-500 border border-white/5 hover:text-gray-300"
                        }`}
                        title="Click to toggle Featured"
                      >
                        {p.featured ? "★ Featured" : "☆ Feature"}
                      </button>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5">
                      {p.imageUrl && (
                        <button
                          onClick={() => setCropProduct(p)}
                          title="Crop image"
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-xs text-[#C8B993] bg-[#C8B993]/10 hover:bg-[#C8B993]/20 transition-colors"
                        >
                          <Scissors size={13} />
                        </button>
                      )}
                      <Link
                        href={`/admin/dashboard/edit/${p.id}`}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
                      >
                        Edit
                      </Link>
                      <DeleteButton id={p.id} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {filtered.map((p) => {
              const Icon = CAT_ICONS[p.category] || Shirt;
              const isUpdating = updatingId === p.id;

              return (
                <div key={p.id} className="bg-[#1D1D1D] border border-[#2A2A2A] rounded-2xl p-4 shadow-lg">
                  <div className="flex gap-3">
                    <div className="w-16 h-20 rounded-xl overflow-hidden bg-[#111111] border border-[#2A2A2A] shrink-0">
                      {p.imageUrl ? (
                        <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-700 text-xs">
                          <Shirt size={22} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold text-sm leading-snug truncate">{p.name}</p>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-[#C8B993] font-extrabold text-sm">{p.price}</span>
                        {p.originalPrice && (
                          <span className="text-gray-600 text-xs line-through">{p.originalPrice}</span>
                        )}
                      </div>
                      <div className="mt-2">
                        <span className="inline-flex items-center gap-1 text-[10px] bg-white/5 border border-white/10 text-gray-300 rounded-md px-2 py-0.5">
                          <Icon size={11} className="text-[#C8B993]" />
                          <span>{p.category}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#1A1A1A]">
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => toggleStock(p)}
                        disabled={isUpdating}
                        className={`text-[10px] px-2.5 py-1 rounded-full font-bold ${
                          p.inStock ? "bg-green-500/15 text-green-400" : "bg-red-500/15 text-red-400"
                        }`}
                      >
                        {p.inStock ? "In Stock" : "Out of Stock"}
                      </button>

                      {p.featured && (
                        <span className="text-[10px] px-2 py-1 rounded-full font-bold bg-[#C8B993]/15 text-[#C8B993]">
                          Featured
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {p.imageUrl && (
                        <button
                          onClick={() => setCropProduct(p)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-xs text-[#C8B993] bg-[#C8B993]/10"
                        >
                          <Scissors size={13} />
                        </button>
                      )}
                      <Link
                        href={`/admin/dashboard/edit/${p.id}`}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-300 bg-white/5"
                      >
                        Edit
                      </Link>
                      <DeleteButton id={p.id} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {cropProduct?.imageUrl && (
        <ImageCropper
          src={cropProduct.imageUrl}
          onDone={handleCropDone}
          onCancel={() => setCropProduct(null)}
        />
      )}

      {cropSaving && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-2 border-[#C8B993] border-t-transparent rounded-full animate-spin" />
            <p className="text-white text-sm">Saving cropped image…</p>
          </div>
        </div>
      )}
    </>
  );
}
