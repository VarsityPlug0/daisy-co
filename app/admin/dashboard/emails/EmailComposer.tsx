"use client";
import { useState, useMemo } from "react";
import { Send, X, Search } from "lucide-react";

type Product = { id: string; name: string; price: string; imageUrl: string; category: string };

const TEMPLATES = [
  {
    id: "sale",
    label: "Sale Announcement",
    subject: "🔥 Exclusive Sale — Up to 25% Off at Daisy Gadgets Co.",
    heading: "Exclusive Sale — Limited Time",
    body: "Hi there,\n\nWe have an exclusive sale running right now — up to 25% off on selected products!\n\nDon't miss out. Shop now and get the best deals on TVs, Gaming Consoles, Laptops, MacBooks, and more.\n\nOffer ends soon.",
    ctaText: "Shop the Sale",
    ctaUrl: "https://daisygadgetsco.com/shop",
  },
  {
    id: "cart",
    label: "Cart Reminder",
    subject: "You left something behind — come back and complete your order",
    heading: "You left something in your cart",
    body: "Hi there,\n\nYou visited our store recently but didn't complete your order.\n\nYour items are waiting for you. Come back and complete your purchase before they sell out!",
    ctaText: "Return to Shop",
    ctaUrl: "https://daisygadgetsco.com/shop",
  },
  {
    id: "followup",
    label: "Order Follow-up",
    subject: "How is your order from Daisy Gadgets Co.?",
    heading: "How's everything going?",
    body: "Hi there,\n\nWe hope you're enjoying your recent purchase from Daisy Gadgets Co.!\n\nIf you have any questions or need any support, we're always here to help. Feel free to reach out anytime.",
    ctaText: "Contact Us",
    ctaUrl: "https://daisygadgetsco.com/contact",
  },
  {
    id: "new_arrivals",
    label: "New Arrivals",
    subject: "New arrivals just dropped at Daisy Gadgets Co. 🚀",
    heading: "Fresh Stock Just Arrived",
    body: "Hi there,\n\nWe've just added exciting new products to our store — from the latest smartphones and MacBooks to gaming consoles and smart TVs.\n\nBe the first to grab what's new!",
    ctaText: "See New Arrivals",
    ctaUrl: "https://daisygadgetsco.com/shop",
  },
  {
    id: "custom",
    label: "Custom Message",
    subject: "",
    heading: "",
    body: "",
    ctaText: "",
    ctaUrl: "",
  },
];

export default function EmailComposer({
  customerCount,
  pendingCount,
  products,
}: {
  customerCount: number;
  pendingCount: number;
  products: Product[];
}) {
  const [template, setTemplate] = useState(TEMPLATES[0]);
  const [subject, setSubject] = useState(TEMPLATES[0].subject);
  const [heading, setHeading] = useState(TEMPLATES[0].heading);
  const [body, setBody] = useState(TEMPLATES[0].body);
  const [ctaText, setCtaText] = useState(TEMPLATES[0].ctaText);
  const [ctaUrl, setCtaUrl] = useState(TEMPLATES[0].ctaUrl);
  const [recipients, setRecipients] = useState("all");
  const [customEmail, setCustomEmail] = useState("");

  // Product picker
  const [includeOrderItems, setIncludeOrderItems] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);

  const filteredProducts = useMemo(() => {
    const q = productSearch.toLowerCase();
    return products.filter(
      (p) =>
        !selectedProducts.find((s) => s.id === p.id) &&
        (p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q))
    );
  }, [products, productSearch, selectedProducts]);

  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ sent: number; total: number } | null>(null);
  const [error, setError] = useState("");

  function applyTemplate(id: string) {
    const t = TEMPLATES.find((t) => t.id === id)!;
    setTemplate(t);
    setSubject(t.subject);
    setHeading(t.heading);
    setBody(t.body);
    setCtaText(t.ctaText);
    setCtaUrl(t.ctaUrl);
  }

  function addProduct(p: Product) {
    if (selectedProducts.length >= 4) return;
    setSelectedProducts((prev) => [...prev, p]);
    setProductSearch("");
  }

  function removeProduct(id: string) {
    setSelectedProducts((prev) => prev.filter((p) => p.id !== id));
  }

  const recipientLabel =
    recipients === "all" ? `All customers (${customerCount})` :
    recipients === "pending" ? `Pending orders (${pendingCount})` :
    "Specific email";

  async function send() {
    setError("");
    setResult(null);
    if (!subject.trim() || !heading.trim() || !body.trim()) {
      setError("Subject, heading and body are required.");
      return;
    }
    setSending(true);
    try {
      const res = await fetch("/api/admin/send-campaign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject, heading, body, ctaText, ctaUrl,
          recipients, customEmail,
          includeOrderItems,
          featuredProducts: includeOrderItems ? [] : selectedProducts,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Send failed");
      setResult(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Send failed");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="grid lg:grid-cols-5 gap-6">

      {/* Composer */}
      <div className="lg:col-span-3 space-y-4">

        {/* Template picker */}
        <div className="bg-[#111111] border border-[#1F1F1F] rounded-2xl p-5">
          <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-3">Template</p>
          <div className="flex flex-wrap gap-2">
            {TEMPLATES.map((t) => (
              <button
                key={t.id}
                onClick={() => applyTemplate(t.id)}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  template.id === t.id
                    ? "bg-[#D4AF37] text-black"
                    : "bg-white/5 text-gray-400 hover:text-white"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Fields */}
        <div className="bg-[#111111] border border-[#1F1F1F] rounded-2xl p-5 space-y-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Subject line</label>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Email subject…"
              className="w-full bg-[#0A0A0A] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#D4AF37]/50"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Heading</label>
            <input
              value={heading}
              onChange={(e) => setHeading(e.target.value)}
              placeholder="Email heading…"
              className="w-full bg-[#0A0A0A] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#D4AF37]/50"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Body</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={6}
              placeholder="Write your message…"
              className="w-full bg-[#0A0A0A] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#D4AF37]/50 resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Button text (optional)</label>
              <input
                value={ctaText}
                onChange={(e) => setCtaText(e.target.value)}
                placeholder="Shop Now"
                className="w-full bg-[#0A0A0A] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#D4AF37]/50"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Button URL (optional)</label>
              <input
                value={ctaUrl}
                onChange={(e) => setCtaUrl(e.target.value)}
                placeholder="https://…"
                className="w-full bg-[#0A0A0A] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#D4AF37]/50"
              />
            </div>
          </div>
        </div>

        {/* Product section */}
        <div className="bg-[#111111] border border-[#1F1F1F] rounded-2xl p-5">
          <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-3">Products in Email</p>

          {/* Toggle: order items vs manual pick */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => { setIncludeOrderItems(true); setSelectedProducts([]); setPickerOpen(false); }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-semibold border transition-colors ${
                includeOrderItems
                  ? "bg-[#D4AF37]/10 border-[#D4AF37]/40 text-[#D4AF37]"
                  : "bg-white/5 border-[#1F1F1F] text-gray-400 hover:text-white"
              }`}
            >
              Customer's last order
            </button>
            <button
              onClick={() => setIncludeOrderItems(false)}
              className={`flex-1 py-2.5 rounded-xl text-xs font-semibold border transition-colors ${
                !includeOrderItems
                  ? "bg-[#D4AF37]/10 border-[#D4AF37]/40 text-[#D4AF37]"
                  : "bg-white/5 border-[#1F1F1F] text-gray-400 hover:text-white"
              }`}
            >
              Pick products manually
            </button>
          </div>

          {/* Order items mode */}
          {includeOrderItems ? (
            <div className="bg-[#0A0A0A] border border-[#D4AF37]/20 rounded-xl p-4">
              <p className="text-white text-xs font-semibold mb-1">Personalised per customer</p>
              <p className="text-gray-500 text-xs leading-relaxed">
                Each customer will receive an email showing the exact items from their last order — with product images, names, quantities, and prices. Their order reference is included too.
              </p>
            </div>
          ) : (
            <>
              {/* Manual product picker */}
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-gray-600">Pick up to 4 products to show in the email</p>
                {selectedProducts.length < 4 && (
                  <button
                    onClick={() => setPickerOpen((o) => !o)}
                    className="text-xs px-3 py-1.5 rounded-lg bg-white/5 text-gray-400 hover:text-white transition-colors"
                  >
                    + Add product
                  </button>
                )}
              </div>

              {selectedProducts.length > 0 && (
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {selectedProducts.map((p) => (
                    <div key={p.id} className="flex items-center gap-2 bg-[#0A0A0A] border border-[#2a2a2a] rounded-xl p-2">
                      {p.imageUrl ? (
                        <img src={p.imageUrl} alt={p.name} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-[#1F1F1F] shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-xs font-medium truncate">{p.name}</p>
                        <p className="text-[#D4AF37] text-xs">{p.price}</p>
                      </div>
                      <button onClick={() => removeProduct(p.id)} className="text-gray-600 hover:text-red-400 transition-colors shrink-0">
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {pickerOpen && selectedProducts.length < 4 && (
                <div>
                  <div className="relative mb-2">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
                    <input
                      autoFocus
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      placeholder="Search products…"
                      className="w-full bg-[#0A0A0A] border border-[#2a2a2a] rounded-xl pl-9 pr-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#D4AF37]/50"
                    />
                  </div>
                  <div className="max-h-52 overflow-y-auto rounded-xl border border-[#2a2a2a] divide-y divide-[#1a1a1a]">
                    {filteredProducts.slice(0, 30).map((p) => (
                      <button
                        key={p.id}
                        onClick={() => { addProduct(p); if (selectedProducts.length + 1 >= 4) setPickerOpen(false); }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 transition-colors text-left"
                      >
                        {p.imageUrl ? (
                          <img src={p.imageUrl} alt={p.name} className="w-9 h-9 rounded-lg object-cover shrink-0" />
                        ) : (
                          <div className="w-9 h-9 rounded-lg bg-[#1F1F1F] shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-xs font-medium truncate">{p.name}</p>
                          <p className="text-gray-500 text-xs">{p.category}</p>
                        </div>
                        <p className="text-[#D4AF37] text-xs font-bold shrink-0">{p.price}</p>
                      </button>
                    ))}
                    {filteredProducts.length === 0 && (
                      <p className="text-gray-600 text-xs text-center py-4">No products found</p>
                    )}
                  </div>
                </div>
              )}

              {selectedProducts.length === 0 && !pickerOpen && (
                <p className="text-gray-600 text-xs">No products selected — email will be sent without product images.</p>
              )}
            </>
          )}
        </div>
      </div>

      {/* Send panel */}
      <div className="lg:col-span-2 space-y-4">
        <div className="bg-[#111111] border border-[#1F1F1F] rounded-2xl p-5 space-y-4">
          <p className="text-sm font-semibold text-white">Send to</p>

          <div className="space-y-2">
            {[
              { value: "all",     label: "All customers",    sub: `${customerCount} unique emails` },
              { value: "pending", label: "Pending orders",   sub: `${pendingCount} customers` },
              { value: "custom",  label: "Specific email",   sub: "One person" },
            ].map((opt) => (
              <label key={opt.value} className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer border transition-colors ${
                recipients === opt.value
                  ? "border-[#D4AF37]/40 bg-[#D4AF37]/5"
                  : "border-[#1F1F1F] hover:border-[#2a2a2a]"
              }`}>
                <input
                  type="radio"
                  name="recipients"
                  value={opt.value}
                  checked={recipients === opt.value}
                  onChange={() => setRecipients(opt.value)}
                  className="mt-0.5 accent-[#D4AF37]"
                />
                <div>
                  <p className="text-white text-sm font-medium">{opt.label}</p>
                  <p className="text-gray-500 text-xs">{opt.sub}</p>
                </div>
              </label>
            ))}
          </div>

          {recipients === "custom" && (
            <input
              value={customEmail}
              onChange={(e) => setCustomEmail(e.target.value)}
              placeholder="recipient@email.com"
              type="email"
              className="w-full bg-[#0A0A0A] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#D4AF37]/50"
            />
          )}

          {error && <p className="text-red-400 text-sm">{error}</p>}

          {result && (
            <div className="bg-green-400/10 border border-green-400/20 rounded-xl p-4 text-center">
              <p className="text-green-400 font-bold text-lg">{result.sent}</p>
              <p className="text-gray-400 text-xs mt-0.5">emails sent of {result.total} recipients</p>
            </div>
          )}

          <button
            onClick={send}
            disabled={sending}
            className="btn-gold w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Send size={15} />
            {sending ? "Sending…" : `Send to ${recipientLabel}`}
          </button>
        </div>

        <div className="bg-[#111111] border border-[#1F1F1F] rounded-2xl p-5">
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-3">Automatic emails</p>
          <div className="space-y-2 text-xs text-gray-400">
            {[
              "Order placed → clear cart reminder with product images",
              "Proof uploaded → confirmation email",
              "Order approved / shipped / delivered → status updates",
            ].map((t) => (
              <div key={t} className="flex gap-2 items-start">
                <span className="w-2 h-2 rounded-full bg-green-400 mt-1 shrink-0" />
                <span>{t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
