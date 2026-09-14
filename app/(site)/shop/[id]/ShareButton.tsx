"use client";
import { useState } from "react";
import { Share2, Check, Copy } from "lucide-react";

export default function ShareButton({ name, price, url }: { name: string; price: string; url: string }) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: name,
          text: `Check out the ${name} for ${price} at Bevanssons`,
          url,
        });
        return;
      } catch {
        // user cancelled or API failed — fall through to clipboard
      }
    }
    // Clipboard fallback
    await navigator.clipboard.writeText(url).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleShare}
      title="Share this product"
      className="flex items-center gap-2 px-3 py-2 rounded-xl border border-[#2a2a2a] text-gray-400 hover:text-white hover:border-[#D4AF37]/40 transition-all text-sm"
    >
      {copied ? <Check size={15} className="text-green-400" /> : <Share2 size={15} />}
      {copied ? <span className="text-green-400">Copied!</span> : <span>Share</span>}
    </button>
  );
}
