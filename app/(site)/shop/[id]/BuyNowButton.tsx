"use client";
import { useCart } from "@/components/CartContext";
import { useRouter } from "next/navigation";
import { ShoppingCart, Ruler, Check } from "lucide-react";
import { useState } from "react";
import { isClothingCategory } from "@/lib/categories";

interface Props {
  product: { id: string; name: string; price: string; originalPrice?: string; imageUrl: string; category: string };
}

const APPAREL_SIZES = ["XS", "S", "M", "L", "XL", "2XL"];
const SHOE_SIZES = ["UK 6", "UK 7", "UK 8", "UK 9", "UK 10", "UK 11"];
const CAP_SIZES = ["One Size (Adjustable)"];

const DEFAULT_COLORS = [
  { name: "Onyx Black", hex: "#171717" },
  { name: "Vintage White", hex: "#f3f4f6" },
  { name: "Heather Grey", hex: "#6b7280" },
  { name: "Midnight Navy", hex: "#1e293b" },
];

export default function BuyNowButton({ product }: Props) {
  const { add, openCart } = useCart();
  const router = useRouter();
  const isClothing = isClothingCategory(product.category);

  const isShoe = product.category.toLowerCase().includes("shoes") || product.category.toLowerCase().includes("sneaker");
  const isCap = product.category.toLowerCase().includes("cap") || product.category.toLowerCase().includes("accessories");

  const availableSizes = isCap ? CAP_SIZES : isShoe ? SHOE_SIZES : APPAREL_SIZES;

  const [selectedSize, setSelectedSize] = useState<string>(availableSizes[isCap ? 0 : isShoe ? 2 : 2]); // default to M or UK 8
  const [selectedColor, setSelectedColor] = useState<string>(DEFAULT_COLORS[0].name);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [added, setAdded] = useState(false);

  function getFormattedProduct() {
    if (!isClothing) return product;
    const variantTag = `(${selectedSize}${selectedColor ? `, ${selectedColor}` : ""})`;
    return {
      ...product,
      id: `${product.id}-${selectedSize.replace(/\s+/g, "_")}`,
      name: `${product.name} ${variantTag}`,
    };
  }

  function handleBuyNow() {
    add(getFormattedProduct());
    router.push("/checkout");
  }

  function handleAddToCart() {
    add(getFormattedProduct());
    setAdded(true);
    openCart();
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="space-y-5 w-full">
      {isClothing && (
        <div className="space-y-4 pt-2 border-t border-[#2A2A2A]">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C8B993]/15 border border-[#C8B993]/40 text-[#C8B993] text-xs font-bold uppercase tracking-wider">
            ✨ Coming Soon — Apparel Drop
          </div>
          {/* Size picker */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
                Select Size: <strong className="text-[#C8B993] font-bold">{selectedSize}</strong>
              </span>
              <button
                type="button"
                onClick={() => setShowSizeGuide(true)}
                className="text-xs text-gray-400 hover:text-[#C8B993] flex items-center gap-1 transition-colors"
              >
                <Ruler size={12} /> Size Guide
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {availableSizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setSelectedSize(size)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                    selectedSize === size
                      ? "bg-[#C8B993] text-black border-[#C8B993] shadow-lg shadow-[#C8B993]/20"
                      : "bg-[#141414] text-gray-300 border-[#262626] hover:border-gray-500 hover:text-white"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Color picker */}
          {!isCap && (
            <div>
              <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider block mb-2">
                Color: <strong className="text-white font-medium">{selectedColor}</strong>
              </span>
              <div className="flex items-center gap-3">
                {DEFAULT_COLORS.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    title={c.name}
                    onClick={() => setSelectedColor(c.name)}
                    className={`w-7 h-7 rounded-full border-2 transition-all flex items-center justify-center ${
                      selectedColor === c.name ? "border-[#C8B993] scale-110 shadow-md shadow-[#C8B993]/30" : "border-transparent hover:scale-105 opacity-80 hover:opacity-100"
                    }`}
                    style={{ backgroundColor: c.hex }}
                  >
                    {selectedColor === c.name && (
                      <Check size={12} color={c.hex === "#f3f4f6" ? "#000" : "#fff"} strokeWidth={3} />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Buttons */}
      <div className="flex gap-3 w-full">
        <button
          onClick={handleBuyNow}
          className="btn-gold flex-1 py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2.5"
        >
          Buy Now
        </button>
        <button
          onClick={handleAddToCart}
          className="w-14 h-14 rounded-xl border border-[#2a2a2a] flex items-center justify-center text-gray-400 hover:text-white hover:border-[#C8B993]/50 transition-colors shrink-0"
          title="Add to Cart"
        >
          {added ? <Check size={20} className="text-[#C8B993]" /> : <ShoppingCart size={20} />}
        </button>
      </div>

      {/* Size Guide Modal */}
      {showSizeGuide && (
        <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setShowSizeGuide(false)}>
          <div className="bg-[#1D1D1D] border border-[#262626] rounded-2xl max-w-md w-full p-6 text-white space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-[#222] pb-3">
              <h3 className="font-bold text-base text-[#C8B993] flex items-center gap-2">
                <Ruler size={18} /> Standard Size Chart
              </h3>
              <button onClick={() => setShowSizeGuide(false)} className="text-gray-400 hover:text-white text-lg font-bold">×</button>
            </div>
            <p className="text-xs text-gray-400">Measurements in centimeters (cm). If between sizes, we recommend sizing up for a relaxed fit.</p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-[#262626] text-gray-400">
                    <th className="py-2">Size</th>
                    <th className="py-2">Chest (cm)</th>
                    <th className="py-2">Waist (cm)</th>
                    <th className="py-2">Length (cm)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2A2A2A] text-gray-300">
                  <tr><td className="py-2 font-bold text-white">XS</td><td>86–91</td><td>71–76</td><td>68</td></tr>
                  <tr><td className="py-2 font-bold text-white">S</td><td>91–96</td><td>76–81</td><td>70</td></tr>
                  <tr><td className="py-2 font-bold text-white">M</td><td>96–101</td><td>81–86</td><td>72</td></tr>
                  <tr><td className="py-2 font-bold text-white">L</td><td>101–106</td><td>86–91</td><td>74</td></tr>
                  <tr><td className="py-2 font-bold text-white">XL</td><td>106–111</td><td>91–96</td><td>76</td></tr>
                  <tr><td className="py-2 font-bold text-white">2XL</td><td>111–116</td><td>96–101</td><td>78</td></tr>
                </tbody>
              </table>
            </div>
            <div className="pt-2 border-t border-[#222] flex justify-end">
              <button onClick={() => setShowSizeGuide(false)} className="btn-gold px-4 py-2 rounded-xl text-xs font-bold">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

