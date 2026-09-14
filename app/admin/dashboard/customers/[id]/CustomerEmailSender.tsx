"use client";
import { useState } from "react";
import { Send } from "lucide-react";

const TEMPLATES = [
  { label: "Follow-up",     subject: "Following up on your order — Bevanssons", body: "Hi {name},\n\nWe just wanted to check in and see how everything is going with your recent order.\n\nIf you have any questions or need support, we're always here to help!" },
  { label: "Sale",          subject: "Exclusive offer just for you — Bevanssons", body: "Hi {name},\n\nWe have an exclusive sale running and thought of you!\n\nShop now and enjoy great savings on our latest products." },
  { label: "Cart reminder", subject: "You left items in your cart — Bevanssons", body: "Hi {name},\n\nYou still have items waiting in your cart. Don't let them slip away — complete your purchase before they sell out!" },
  { label: "Custom",        subject: "", body: "" },
];

type Item = { id: string; name: string; price: string; qty: number; imageUrl?: string };

export default function CustomerEmailSender({
  email, name, lastOrderItems, lastOrderRef, cartItems,
}: {
  email: string;
  name: string;
  lastOrderItems?: Item[];
  lastOrderRef?: string;
  cartItems?: Item[];
}) {
  const [subject, setSubject] = useState(TEMPLATES[0].subject.replace("{name}", name.split(" ")[0]));
  const [body, setBody] = useState(TEMPLATES[0].body.replace("{name}", name.split(" ")[0]));
  const [ctaText, setCtaText] = useState("Shop Now");
  const [ctaUrl, setCtaUrl] = useState("https://gadgets.bevanssons.store/shop");
  const [includeOrderItems, setIncludeOrderItems] = useState(false);
  const [includeCartItems, setIncludeCartItems] = useState(false);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState("");

  function applyTemplate(idx: number) {
    const t = TEMPLATES[idx];
    setSubject(t.subject.replace("{name}", name.split(" ")[0]));
    setBody(t.body.replace("{name}", name.split(" ")[0]));
  }

  async function send() {
    setError(""); setResult(null);
    if (!subject.trim() || !body.trim()) { setError("Subject and body required."); return; }
    setSending(true);
    try {
      const payload: Record<string, unknown> = {
        subject, body, heading: subject,
        ctaText, ctaUrl,
        recipients: "custom",
        customEmail: email,
        includeOrderItems: includeOrderItems && !!lastOrderItems?.length,
      };
      if (includeCartItems && cartItems?.length) {
        payload.cartItems = cartItems;
      }
      const res = await fetch("/api/admin/send-campaign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setResult(`Email sent to ${email}`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Send failed");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="space-y-3">
      {/* Template chips */}
      <div className="flex flex-wrap gap-2">
        {TEMPLATES.map((t, i) => (
          <button key={t.label} onClick={() => applyTemplate(i)}
            className="text-xs px-3 py-1.5 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
            {t.label}
          </button>
        ))}
      </div>

      <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject…"
        className="w-full bg-[#0A0A0A] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#D4AF37]/50" />

      <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={5} placeholder="Message…"
        className="w-full bg-[#0A0A0A] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#D4AF37]/50 resize-none" />

      <div className="grid grid-cols-2 gap-3">
        <input value={ctaText} onChange={(e) => setCtaText(e.target.value)} placeholder="Button text"
          className="w-full bg-[#0A0A0A] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#D4AF37]/50" />
        <input value={ctaUrl} onChange={(e) => setCtaUrl(e.target.value)} placeholder="Button URL"
          className="w-full bg-[#0A0A0A] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#D4AF37]/50" />
      </div>

      {lastOrderItems?.length ? (
        <label className="flex items-center gap-3 p-3 rounded-xl border border-[#1F1F1F] cursor-pointer hover:border-[#2a2a2a] transition-colors">
          <input type="checkbox" checked={includeOrderItems} onChange={(e) => { setIncludeOrderItems(e.target.checked); if (e.target.checked) setIncludeCartItems(false); }}
            className="accent-[#D4AF37]" />
          <div>
            <p className="text-white text-xs font-medium">Include their last order items</p>
            <p className="text-gray-500 text-xs">Shows ordered products with images + a "Complete Your Order" button</p>
          </div>
        </label>
      ) : null}

      {cartItems?.length ? (
        <label className="flex items-center gap-3 p-3 rounded-xl border border-amber-500/20 cursor-pointer hover:border-amber-500/40 transition-colors">
          <input type="checkbox" checked={includeCartItems} onChange={(e) => { setIncludeCartItems(e.target.checked); if (e.target.checked) setIncludeOrderItems(false); }}
            className="accent-amber-400" />
          <div>
            <p className="text-white text-xs font-medium">Include their cart items <span className="text-amber-400">({cartItems.length})</span></p>
            <p className="text-gray-500 text-xs">Shows the products they browsed + a "Shop Now" button</p>
          </div>
        </label>
      ) : null}

      {error && <p className="text-red-400 text-sm">{error}</p>}
      {result && <p className="text-green-400 text-sm">{result}</p>}

      <button onClick={send} disabled={sending}
        className="btn-gold w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 text-sm">
        <Send size={14} />
        {sending ? "Sending…" : `Send to ${email}`}
      </button>
    </div>
  );
}
