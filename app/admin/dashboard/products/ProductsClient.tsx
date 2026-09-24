"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import DeleteButton from "../DeleteButton";
import dynamic from "next/dynamic";
import { isClothingCategory, isDeviceCategory } from "@/lib/categories";
import { Shirt, Cpu, LayoutGrid, CreditCard } from "lucide-react";

const ImageCropper = dynamic(() => import("@/components/ImageCropper"), { ssr: false });

type Product = {
  id: string; name: string; price: string; originalPrice?: string;
  category: string; description?: string; imageUrl?: string;
  inStock: boolean | number; featured: boolean | number;
};

type InstallmentSettings = {
  active: boolean;
  min_deposit_pct: number;
  eligible_terms: number[];
  monthly_rate: number;
  admin_fee: number;
};

export default function ProductsClient({
  products,
  installmentSettings = {},
}: {
  products: Product[];
  installmentSettings?: Record<string, InstallmentSettings>;
}) {
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState<"all" | "devices" | "clothing">("all");
  const [cat, setCat] = useState("All");
  const [stockFilter, setStockFilter] = useState("All");
  const [cropProduct, setCropProduct] = useState<Product | null>(null);
  const [cropSaving, setCropSaving] = useState(false);
  const [settingsState, setSettingsState] = useState(installmentSettings);
  const [toggleBusyId, setToggleBusyId] = useState<string | null>(null);

  async function toggleInstallment(p: Product) {
    const current = settingsState[p.id];
    const nextActive = !current?.active;
    setToggleBusyId(p.id);
    try {
      const res = await fetch(`/api/admin/installments/settings/${p.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          min_deposit_pct: current?.min_deposit_pct ?? 20,
          eligible_terms: current?.eligible_terms ?? [6, 12, 18, 24],
          monthly_rate: current?.monthly_rate ?? 0,
          admin_fee: current?.admin_fee ?? 0,
          active: nextActive,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setSettingsState((prev) => ({ ...prev, [p.id]: updated }));
      }
    } finally {
      setToggleBusyId(null);
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
        body: JSON.stringify({ file: base64, mimeType: "image/jpeg", filename: "product.jpg" }),
      });
      const { url } = await uploadRes.json();
      if (url) {
        await fetch(`/api/admin/products/${cropProduct.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageUrl: url }),
        });
        // Update local state so the new image shows without a page reload
        cropProduct.imageUrl = url;
      }
    } finally {
      setCropSaving(false);
      setCropProduct(null);
    }
  }

  const clothingCount = useMemo(() => products.filter(p => isClothingCategory(p.category)).length, [products]);
  const deviceCount = useMemo(() => products.filter(p => isDeviceCategory(p.category)).length, [products]);

  const categories = useMemo(() => {
    let source = products;
    if (department === "devices") source = products.filter(p => isDeviceCategory(p.category));
    if (department === "clothing") source = products.filter(p => isClothingCategory(p.category));
    const s = new Set(source.map((p) => p.category));
    return ["All", ...Array.from(s).sort()];
  }, [products, department]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return products.filter((p) => {
      if (department === "devices" && isClothingCategory(p.category)) return false;
      if (department === "clothing" && !isClothingCategory(p.category)) return false;
      if (cat !== "All" && p.category !== cat) return false;
      if (stockFilter === "In Stock" && !p.inStock) return false;
      if (stockFilter === "Out of Stock" && p.inStock) return false;
      if (stockFilter === "Featured" && !p.featured) return false;
      if (q && !p.name.toLowerCase().includes(q) && !p.category.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [products, search, department, cat, stockFilter]);

  return (
    <>
      {/* Department Tabs */}
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => { setDepartment("all"); setCat("All"); }}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            department === "all"
              ? "bg-[#C8B993] text-black shadow-lg shadow-[#C8B993]/20"
              : "bg-[#1D1D1D] border border-[#2A2A2A] text-gray-400 hover:text-white"
          }`}
        >
          <LayoutGrid size={13} />
          <span>All Catalogue ({products.length})</span>
        </button>

        <button
          onClick={() => { setDepartment("devices"); setCat("All"); }}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            department === "devices"
              ? "bg-[#3B82F6] text-white shadow-lg shadow-[#3B82F6]/20"
              : "bg-[#1D1D1D] border border-[#2A2A2A] text-gray-400 hover:text-white"
          }`}
        >
          <Cpu size={13} />
          <span>Devices &amp; Tech ({deviceCount})</span>
        </button>

        <button
          onClick={() => { setDepartment("clothing"); setCat("All"); }}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            department === "clothing"
              ? "bg-[#F43F5E] text-white shadow-lg shadow-[#F43F5E]/20"
              : "bg-[#1D1D1D] border border-[#2A2A2A] text-gray-400 hover:text-white"
          }`}
        >
          <Shirt size={13} />
          <span>Clothing &amp; Apparel ({clothingCount})</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <input
          type="text"
          placeholder="Search products…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-[#1D1D1D] border border-[#2A2A2A] rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#C8B993]/40"
        />
        <select
          value={cat}
          onChange={(e) => setCat(e.target.value)}
          className="bg-[#1D1D1D] border border-[#2A2A2A] rounded-xl px-4 py-2.5 text-sm text-gray-300 focus:outline-none focus:border-[#C8B993]/40"
        >
          {categories.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select
          value={stockFilter}
          onChange={(e) => setStockFilter(e.target.value)}
          className="bg-[#1D1D1D] border border-[#2A2A2A] rounded-xl px-4 py-2.5 text-sm text-gray-300 focus:outline-none focus:border-[#C8B993]/40"
        >
          {["All", "In Stock", "Out of Stock", "Featured"].map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>

      <p className="text-xs text-gray-600 mb-3">{filtered.length} product{filtered.length !== 1 ? "s" : ""}</p>

      {filtered.length === 0 ? (
        <div className="bg-[#1D1D1D] border border-[#2A2A2A] rounded-2xl p-12 text-center">
          <p className="text-gray-500">No products match your filters.</p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block bg-[#1D1D1D] border border-[#2A2A2A] rounded-2xl overflow-hidden">
            <div className="grid grid-cols-[52px_1fr_120px_130px_130px_190px] gap-3 px-5 py-3 border-b border-[#2A2A2A]">
              {["", "Product", "Price", "Category", "Status", "Actions"].map((h) => (
                <p key={h} className="text-[11px] text-gray-500 uppercase tracking-wider font-medium">{h}</p>
              ))}
            </div>
            {filtered.map((p) => (
              <div key={p.id}
                className="grid grid-cols-[52px_1fr_120px_130px_130px_190px] gap-3 items-center px-5 py-3.5 border-b border-[#1A1A1A] last:border-0 hover:bg-white/[0.02] transition-colors">
                <div className="w-11 h-11 rounded-lg overflow-hidden bg-[#111111] shrink-0">
                  {p.imageUrl
                    ? <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-gray-700 text-xs">–</div>}
                </div>
                <div className="min-w-0">
                  <p className="text-white font-medium text-sm truncate">{p.name}</p>
                  {p.description && <p className="text-gray-500 text-xs truncate mt-0.5">{p.description}</p>}
                </div>
                <div>
                  <p className="text-[#C8B993] font-bold text-sm">{p.price}</p>
                  {p.originalPrice && <p className="text-gray-600 text-xs line-through">{p.originalPrice}</p>}
                </div>
                <p className="text-gray-400 text-sm truncate">{p.category}</p>
                <div className="flex gap-1 flex-wrap">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${p.inStock ? "bg-green-400/10 text-green-400" : "bg-red-400/10 text-red-400"}`}>
                    {p.inStock ? "In Stock" : "Out"}
                  </span>
                  {p.featured && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-[#C8B993]/10 text-[#C8B993]">Featured</span>
                  )}
                </div>
                <div className="flex gap-1.5 items-center flex-wrap">
                  <button
                    onClick={() => toggleInstallment(p)}
                    disabled={toggleBusyId === p.id}
                    title={settingsState[p.id]?.active ? "Installments ON — click to disable" : "Installments OFF — click to enable"}
                    className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold transition-colors disabled:opacity-40 ${
                      settingsState[p.id]?.active
                        ? "bg-[#C8B993]/15 text-[#C8B993] hover:bg-[#C8B993]/25"
                        : "bg-white/5 text-gray-500 hover:bg-white/10"
                    }`}
                  >
                    <CreditCard size={11} />
                    {settingsState[p.id]?.active ? "Installments ON" : "Installments OFF"}
                  </button>
                  {p.imageUrl && (
                    <button
                      onClick={() => setCropProduct(p)}
                      title="Crop image"
                      className="px-2 py-1.5 rounded-lg text-xs font-medium text-[#C8B993] bg-[#C8B993]/10 hover:bg-[#C8B993]/20 transition-colors"
                    >
                      ✂
                    </button>
                  )}
                  <Link href={`/admin/dashboard/edit/${p.id}`}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 transition-colors">
                    Edit
                  </Link>
                  <DeleteButton id={p.id} />
                </div>
              </div>
            ))}
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {filtered.map((p) => (
              <div key={p.id} className="bg-[#1D1D1D] border border-[#2A2A2A] rounded-2xl p-4">
                <div className="flex gap-3">
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-[#111111] shrink-0">
                    {p.imageUrl
                      ? <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-gray-700 text-xs">–</div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-sm leading-snug truncate">{p.name}</p>
                    <p className="text-[#C8B993] font-bold text-sm mt-0.5">{p.price}</p>
                    {p.originalPrice && <p className="text-gray-600 text-xs line-through">{p.originalPrice}</p>}
                    <p className="text-gray-500 text-xs mt-0.5 truncate">{p.category}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#1A1A1A]">
                  <div className="flex gap-1.5 flex-wrap">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${p.inStock ? "bg-green-400/10 text-green-400" : "bg-red-400/10 text-red-400"}`}>
                      {p.inStock ? "In Stock" : "Out of Stock"}
                    </span>
                    {p.featured && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-[#C8B993]/10 text-[#C8B993]">Featured</span>
                    )}
                    <button
                      onClick={() => toggleInstallment(p)}
                      disabled={toggleBusyId === p.id}
                      className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold transition-colors disabled:opacity-40 ${
                        settingsState[p.id]?.active
                          ? "bg-[#C8B993]/15 text-[#C8B993]"
                          : "bg-white/5 text-gray-500"
                      }`}
                    >
                      <CreditCard size={10} />
                      {settingsState[p.id]?.active ? "Installments ON" : "Installments OFF"}
                    </button>
                  </div>
                  <div className="flex gap-2">
                    {p.imageUrl && (
                      <button
                        onClick={() => setCropProduct(p)}
                        title="Crop image"
                        className="px-2 py-1.5 rounded-lg text-xs font-medium text-[#C8B993] bg-[#C8B993]/10 hover:bg-[#C8B993]/20 transition-colors"
                      >
                        ✂
                      </button>
                    )}
                    <Link href={`/admin/dashboard/edit/${p.id}`}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 transition-colors">
                      Edit
                    </Link>
                    <DeleteButton id={p.id} />
                  </div>
                </div>
              </div>
            ))}
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
