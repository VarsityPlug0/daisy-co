"use client";
import { useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CATEGORIES, DEVICE_CATEGORIES, CLOTHING_CATEGORIES } from "@/lib/categories";
import type { Product } from "@/lib/products";
import { Upload, X, Scissors } from "lucide-react";
import dynamic from "next/dynamic";

const ImageCropper = dynamic(() => import("@/components/ImageCropper"), { ssr: false });

interface Props {
  product?: Product;
}

export default function ProductForm({ product }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || product?.category || CATEGORIES[0];
  const fileRef = useRef<HTMLInputElement>(null);
  const isEdit = !!product;

  const [form, setForm] = useState({
    name: product?.name ?? "",
    price: product?.price ?? "",
    originalPrice: product?.originalPrice ?? "",
    category: initialCategory,
    description: product?.description ?? "",
    imageUrl: product?.imageUrl ?? "",
    inStock: product?.inStock !== false,
    featured: product?.featured ?? false,
  });

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [cropSrc, setCropSrc] = useState<string | null>(null);

  function set(key: string, value: string | boolean) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setUploadError("");
    const objectUrl = URL.createObjectURL(file);
    setCropSrc(objectUrl);
  }

  async function uploadBlob(blob: Blob) {
    setUploading(true);
    setCropSrc(null);
    try {
      const arrayBuffer = await blob.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      let binary = "";
      for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
      const base64 = btoa(binary);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file: base64, mimeType: "image/jpeg", filename: "product.jpg" }),
      });
      const data = await res.json();
      if (res.ok) {
        set("imageUrl", data.url);
      } else {
        setUploadError(data.error ?? "Upload failed");
      }
    } catch {
      setUploadError("Upload failed. Try again.");
    }
    setUploading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.price || !form.category) {
      setError("Name, price and category are required.");
      return;
    }
    setSaving(true);
    setError("");

    const url = isEdit ? `/api/admin/products/${product!.id}` : "/api/admin/products";
    const method = isEdit ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      router.push("/admin/dashboard");
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error ?? "Something went wrong.");
      setSaving(false);
    }
  }

  return (
    <>
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-400/10 border border-red-400/30 rounded-xl px-5 py-3 text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left column */}
        <div className="space-y-5">
          {/* Name */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Product Name *</label>
            <input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder='e.g. 55" Samsung QLED TV'
              className="w-full bg-[#111111] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none"
            />
          </div>

          {/* Selling Price */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Selling Price *</label>
            <input
              value={form.price}
              onChange={(e) => set("price", e.target.value)}
              placeholder="e.g. R7,999"
              className="w-full bg-[#111111] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none"
            />
          </div>

          {/* Original Price */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Original Price <span className="text-gray-600 font-normal">(shown with strikethrough)</span></label>
            <input
              value={form.originalPrice}
              onChange={(e) => set("originalPrice", e.target.value)}
              placeholder="e.g. R11,999"
              className="w-full bg-[#111111] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Category *</label>
            <select
              value={form.category}
              onChange={(e) => set("category", e.target.value)}
              className="w-full bg-[#111111] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white text-sm focus:outline-none"
            >
              <optgroup label="── Clothing & Streetwear ──">
                {CLOTHING_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </optgroup>
              <optgroup label="── Electronics & Gadgets ──">
                {DEVICE_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              rows={4}
              placeholder="Brief product description..."
              className="w-full bg-[#111111] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none resize-none"
            />
          </div>

          {/* Toggles */}
          <div className="flex gap-8">
            <label className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={() => set("inStock", !form.inStock)}
                className={`w-10 h-6 rounded-full transition-colors relative ${form.inStock ? "bg-green-500" : "bg-[#2a2a2a]"}`}>
                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${form.inStock ? "left-5" : "left-1"}`} />
              </div>
              <span className="text-sm text-gray-300">In Stock</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={() => set("featured", !form.featured)}
                className={`w-10 h-6 rounded-full transition-colors relative ${form.featured ? "bg-[#C8B993]" : "bg-[#2a2a2a]"}`}>
                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${form.featured ? "left-5" : "left-1"}`} />
              </div>
              <span className="text-sm text-gray-300">Featured</span>
            </label>
          </div>
        </div>

        {/* Right column — image */}
        <div>
          <label className="block text-sm text-gray-400 mb-2">Product Image</label>

          {/* Upload zone */}
          <div
            onClick={() => fileRef.current?.click()}
            className="relative border-2 border-dashed border-[#2a2a2a] hover:border-[#C8B993]/50 rounded-2xl overflow-hidden cursor-pointer transition-colors group"
            style={{ minHeight: 260 }}
          >
            {form.imageUrl ? (
              <>
                <img src={form.imageUrl} alt="Preview" className="w-full h-64 object-cover" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <p className="text-white text-sm font-medium">Click to change image</p>
                </div>
                {/* Crop button */}
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setCropSrc(form.imageUrl); }}
                  className="absolute top-3 left-3 w-8 h-8 bg-black/70 rounded-full flex items-center justify-center text-[#C8B993] hover:bg-[#C8B993] hover:text-black transition-colors"
                  title="Crop image"
                >
                  <Scissors size={14} />
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); set("imageUrl", ""); }}
                  className="absolute top-3 right-3 w-8 h-8 bg-black/70 rounded-full flex items-center justify-center text-white hover:bg-red-500 transition-colors"
                >
                  <X size={14} />
                </button>
              </>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center gap-3 text-gray-600">
                {uploading ? (
                  <div className="w-8 h-8 border-2 border-[#C8B993] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Upload size={32} strokeWidth={1.5} />
                    <div className="text-center">
                      <p className="text-sm text-gray-400">Click to upload image</p>
                      <p className="text-xs mt-1">JPEG, PNG, WebP — max 5MB</p>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />

          {uploadError && (
            <p className="text-red-400 text-xs mt-2">{uploadError}</p>
          )}

          {/* Or paste URL */}
          <div className="mt-4">
            <label className="block text-xs text-gray-600 mb-1.5">Or paste an image URL</label>
            <input
              value={form.imageUrl}
              onChange={(e) => set("imageUrl", e.target.value)}
              placeholder="https://..."
              className="w-full bg-[#111111] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Submit */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button type="submit" disabled={saving || uploading}
          className="btn-gold flex-1 sm:flex-none sm:px-10 py-3.5 rounded-xl font-bold text-sm disabled:opacity-60">
          {saving ? "Saving…" : isEdit ? "Save Changes" : "Add Product"}
        </button>
        <button type="button" onClick={() => router.back()}
          className="btn-outline flex-1 sm:flex-none sm:px-8 py-3.5 rounded-xl text-sm">
          Cancel
        </button>
      </div>
    </form>

    {cropSrc && (
      <ImageCropper
        src={cropSrc}
        onDone={(blob) => {
          URL.revokeObjectURL(cropSrc);
          uploadBlob(blob);
        }}
        onCancel={() => {
          URL.revokeObjectURL(cropSrc);
          setCropSrc(null);
        }}
      />
    )}
    </>
  );
}
