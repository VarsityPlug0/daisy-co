"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, Send, Headphones, ChevronDown, ChevronRight, ExternalLink } from "lucide-react";

type Action = { label: string; href?: string; action?: string; external?: boolean };
type Message = {
  role: "user" | "assistant";
  content: string;
  actions?: Action[];
};

// ── Guided response library ──────────────────────────────────────────────────
const ORDER_REF_RE = /\b(DC-[A-F0-9]{6}|DGC-[\dA-Z-]+)\b/i;

const STATUS_LABELS: Record<string, string> = {
  pending:         "⏳ Awaiting payment confirmation",
  proof_submitted: "📎 Proof of payment received — being reviewed",
  approved:        "✅ Payment approved",
  processing:      "📦 Being prepared for dispatch",
  shipped:         "🚚 Shipped and on its way to you",
  delivered:       "✅ Delivered",
  rejected:        "❌ Payment rejected — please contact us",
};

async function lookupOrder(ref: string): Promise<Message> {
  try {
    const res = await fetch(`/api/track-order?ref=${encodeURIComponent(ref.toUpperCase())}`);
    if (!res.ok) {
      return {
        role: "assistant",
        content: `I couldn't find order **${ref.toUpperCase()}**. Please double-check your reference from your confirmation email.`,
        actions: [
          { label: "Try Track Order page", href: "/track-order" },
          { label: "Contact us", href: "/contact" },
        ],
      };
    }
    const order = await res.json();
    const status = STATUS_LABELS[order.status] ?? order.status;
    const items = Array.isArray(order.items)
      ? order.items.map((i: { name: string; qty: number }) => `• ${i.name} ×${i.qty}`).join("\n")
      : "";
    return {
      role: "assistant",
      content: `**Order ${order.ref}**\n\nStatus: ${status}\n\n${items ? `Items:\n${items}\n\n` : ""}Total: R ${Number(order.total).toLocaleString()}`,
      actions: [
        { label: "Full tracking page", href: "/track-order" },
        { label: "Email us for help", href: `mailto:daisygadgetsco@gmail.com?subject=Order%20${encodeURIComponent(order.ref)}`, external: true },
      ],
    };
  } catch {
    return {
      role: "assistant",
      content: "I couldn't retrieve that order right now. Please try the track order page or contact us directly.",
      actions: [
        { label: "Track Order", href: "/track-order" },
        { label: "Contact us", href: "/contact" },
      ],
    };
  }
}

// Predefined guided flows — no AI call needed
const GUIDED: Record<string, Message> = {
  "track my order": {
    role: "assistant",
    content: "To track your order, you'll need the reference number from your confirmation message (e.g. **DC-A1B2C3**).\n\nYou can:\n• Paste your order reference here and I'll look it up instantly\n• Or visit our dedicated tracking page",
    actions: [
      { label: "Go to Track Order page", href: "/track-order" },
    ],
  },
  "how do i pay?": {
    role: "assistant",
    content: "We accept the following payment methods:\n\n• **EFT** — TymeBank account 51072673949 (Branch: 678910)\n• **Visa & Mastercard**\n\nFor EFT, simply transfer the amount and upload your proof of payment at checkout. We confirm within 2–4 hours.",
    actions: [
      { label: "View all payment options", href: "/payment-options" },
      { label: "Start shopping", href: "/shop" },
    ],
  },
  "delivery times?": {
    role: "assistant",
    content: "Our delivery timeframes:\n\n• **Same-day** — Cape Town metro & select Joburg (order before 11am)\n• **1–3 business days** — Nationwide SA\n• **7–14 business days** — International\n\nAll orders include **free shipping** worldwide!",
    actions: [
      { label: "Full delivery info", href: "/delivery" },
      { label: "Shop now", href: "/shop" },
    ],
  },
  "return an item": {
    role: "assistant",
    content: "We accept returns within **7 days** of delivery, provided the item is:\n\n• Unused and in original condition\n• In original packaging with all accessories\n\nFor damaged or faulty items, contact us immediately with photos.",
    actions: [
      { label: "View Returns Policy", href: "/policies/returns" },
      { label: "Start a return", href: "/contact" },
    ],
  },
  "current specials": {
    role: "assistant",
    content: "🎉 **30% OFF everything** — August to December Special!\n\nPlus:\n• Orders over **R10,000** get an extra **25% bulk discount**\n• Free worldwide delivery on all orders\n\nThis is the best time to buy!",
    actions: [
      { label: "Shop Special Offers", href: "/special-offers" },
      { label: "Browse all products", href: "/shop" },
    ],
  },
  "contact support": {
    role: "assistant",
    content: "Here's how to reach us:\n\n• **Email** — daisygadgetsco@gmail.com\n• **Address** — Unit 7 Eagle Street, Okavango Park, Bellville, Cape Town\n\nWe're available Mon–Sat 8am–6pm, Sun 9am–3pm.",
    actions: [
      { label: "Send us a message", href: "/contact" },
    ],
  },
};

const MENU_ITEMS = [
  { label: "🔍 Track my order",    key: "track my order" },
  { label: "💳 How do I pay?",     key: "how do i pay?" },
  { label: "🚚 Delivery times?",   key: "delivery times?" },
  { label: "↩️ Return an item",    key: "return an item" },
  { label: "🏷️ Current specials",  key: "current specials" },
  { label: "📞 Contact support",   key: "contact support" },
];

function formatMessage(text: string) {
  return text.split("\n").map((line, li) => {
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    return (
      <span key={li}>
        {parts.map((part, i) =>
          part.startsWith("**") && part.endsWith("**")
            ? <strong key={i} className="text-white font-semibold">{part.slice(2, -2)}</strong>
            : <span key={i}>{part}</span>
        )}
        {li < text.split("\n").length - 1 && <br />}
      </span>
    );
  });
}

export default function AIAssistant() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! 👋 I'm the **Daisy Gadgets** support assistant. What can I help you with today?",
      actions: MENU_ITEMS.map(m => ({ label: m.label, action: m.key })),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 150);
  }, [open]);

  useEffect(() => {
    function handleOpenChat(e: Event) {
      const msg = (e as CustomEvent<{ message?: string }>).detail?.message;
      setOpen(true);
      if (msg) setTimeout(() => send(msg), 200);
    }
    window.addEventListener("openDaisyChat", handleOpenChat);
    return () => window.removeEventListener("openDaisyChat", handleOpenChat);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleAction(a: Action) {
    if (a.action) {
      send(a.action);
    } else if (a.href) {
      if (a.external) {
        window.open(a.href, "_blank", "noopener,noreferrer");
      } else {
        router.push(a.href);
        setOpen(false);
      }
    }
  }

  async function send(text?: string) {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;
    setInput("");
    setShowMenu(false);

    const userMsg: Message = { role: "user", content: msg };
    const next: Message[] = [...messages, userMsg];
    setMessages(next);
    setLoading(true);

    try {
      // 1. Guided flow match
      const key = msg.toLowerCase();
      if (GUIDED[key]) {
        setMessages([...next, GUIDED[key]]);
        setLoading(false);
        return;
      }

      // 2. Order ref detection
      const refMatch = msg.match(ORDER_REF_RE);
      if (refMatch) {
        const result = await lookupOrder(refMatch[0]);
        setMessages([...next, result]);
        setLoading(false);
        return;
      }

      // 3. Intent keywords
      if (/track|order ref|where is my|my order/i.test(msg)) {
        setMessages([...next, {
          ...GUIDED["track my order"],
          content: "I can look up your order! Please share your **order reference number** (e.g. DC-A1B2C3) and I'll check the status for you.",
        }]);
        setLoading(false);
        return;
      }
      if (/pay|payment|eft|bank|payshap|transfer/i.test(msg)) {
        setMessages([...next, GUIDED["how do i pay?"]]);
        setLoading(false);
        return;
      }
      if (/deliver|shipping|ship|how long|when|arrival/i.test(msg)) {
        setMessages([...next, GUIDED["delivery times?"]]);
        setLoading(false);
        return;
      }
      if (/return|refund|exchange|send back/i.test(msg)) {
        setMessages([...next, GUIDED["return an item"]]);
        setLoading(false);
        return;
      }
      if (/special|discount|offer|sale|promo|percent|off/i.test(msg)) {
        setMessages([...next, GUIDED["current specials"]]);
        setLoading(false);
        return;
      }
      if (/contact|call|reach|speak|agent|human/i.test(msg)) {
        setMessages([...next, GUIDED["contact support"]]);
        setLoading(false);
        return;
      }
      if (/warranty|guarantee|broken|faulty|damaged/i.test(msg)) {
        setMessages([...next, {
          role: "assistant",
          content: "All our products carry the **full manufacturer warranty** (12–24 months). If your item arrived faulty or damaged, contact us immediately with photos.",
          actions: [
            { label: "Warranty Policy", href: "/policies/warranty" },
            { label: "Report an issue", href: "/contact" },
          ],
        }]);
        setLoading(false);
        return;
      }
      if (/shop|buy|browse|product|iphone|ps5|tv|laptop|macbook|solar/i.test(msg)) {
        setMessages([...next, {
          role: "assistant",
          content: "We stock a wide range of premium gadgets — iPhones, Smart TVs, PS5, MacBooks, Solar, Appliances and more. Browse by category or search for a specific product.",
          actions: [
            { label: "Browse all products", href: "/shop" },
            { label: "View special offers", href: "/special-offers" },
          ],
        }]);
        setLoading(false);
        return;
      }

      // 4. AI fallback
      const res = await fetch("/api/ai-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const data = await res.json();
      setMessages([...next, {
        role: "assistant",
        content: data.reply ?? "I'm not sure about that. Let me connect you with our team.",
        actions: [
          { label: "Contact page", href: "/contact" },
        ],
      }]);
    } catch {
      setMessages([...next, {
        role: "assistant",
        content: "Something went wrong on my end. Please reach us directly:",
        actions: [
          { label: "Contact us", href: "/contact" },
        ],
      }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Floating button — WhatsApp style */}
      <button
        onClick={() => setOpen(v => !v)}
        className="fixed bottom-20 md:bottom-8 right-5 z-50 w-14 h-14 rounded-full flex items-center justify-center transition-transform hover:scale-110"
        style={{
          background: open ? "#128C7E" : "#25D366",
          boxShadow: "0 4px 24px rgba(37,211,102,0.4)",
        }}
        aria-label="Chat Support"
      >
        {open
          ? <ChevronDown size={24} color="#fff" strokeWidth={2.5} />
          : <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
        }
      </button>

      {/* Chat panel */}
      {open && (
        <div
          className="fixed z-50 flex flex-col rounded-2xl overflow-hidden"
          style={{
            bottom: "calc(5rem + 3.5rem + 12px)",
            right: "clamp(8px, 4vw, 20px)",
            width: "min(385px, calc(100vw - 16px))",
            maxHeight: "74vh",
            background: "#0f0f0f",
            border: "1px solid rgba(255,255,255,0.07)",
            boxShadow: "0 24px 80px rgba(0,0,0,0.75)",
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 shrink-0"
            style={{ background: "linear-gradient(135deg, #C9971C 0%, #D4AF37 60%, #F0CE6A 100%)" }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-black/20 flex items-center justify-center">
                <Headphones size={18} color="#0A0A0A" strokeWidth={2} />
              </div>
              <div>
                <p style={{ fontFamily: "var(--font-outfit)", fontWeight: 800, fontSize: 14, color: "#0A0A0A" }}>
                  Daisy Support
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-800 animate-pulse" />
                  <p style={{ fontSize: 10, color: "#3a2a00", fontWeight: 600 }}>Online — typically replies instantly</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowMenu(v => !v)}
                title="Main menu"
                className="w-7 h-7 rounded-full bg-black/15 hover:bg-black/25 flex items-center justify-center transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0A0A0A" strokeWidth="2.5">
                  <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
                </svg>
              </button>
              <button onClick={() => setOpen(false)} className="w-7 h-7 rounded-full bg-black/15 hover:bg-black/25 flex items-center justify-center transition-colors">
                <X size={14} color="#0A0A0A" />
              </button>
            </div>
          </div>

          {/* Menu overlay */}
          {showMenu && (
            <div className="shrink-0 border-b border-[#1F1F1F] bg-[#111] p-3 space-y-1">
              {MENU_ITEMS.map(m => (
                <button key={m.key} onClick={() => { setShowMenu(false); send(m.key); }}
                  className="w-full text-left px-4 py-2.5 rounded-xl text-sm text-gray-300 hover:bg-white/5 hover:text-[#D4AF37] transition-colors flex items-center justify-between group">
                  <span style={{ fontFamily: "var(--font-outfit)", fontWeight: 500 }}>{m.label}</span>
                  <ChevronRight size={13} className="text-gray-600 group-hover:text-[#D4AF37] transition-colors" />
                </button>
              ))}
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ minHeight: 0 }}>
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                {m.role === "assistant" && (
                  <div className="w-7 h-7 rounded-full shrink-0 mt-1 flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg, #C9971C, #D4AF37)" }}>
                    <Headphones size={12} color="#0A0A0A" strokeWidth={2.2} />
                  </div>
                )}
                <div className="flex flex-col gap-2 max-w-[84%]">
                  {/* Bubble */}
                  <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    m.role === "user"
                      ? "bg-[#D4AF37] text-black font-medium rounded-br-sm self-end"
                      : "bg-[#1a1a1a] text-gray-300 rounded-bl-sm border border-[#222]"
                  }`}>
                    {m.role === "assistant" ? formatMessage(m.content) : m.content}
                  </div>

                  {/* Action buttons */}
                  {m.role === "assistant" && m.actions && m.actions.length > 0 && (
                    <div className="flex flex-col gap-1.5 pl-0">
                      {m.actions.map((a, ai) => (
                        <button key={ai} onClick={() => handleAction(a)}
                          className="flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl text-left transition-all group"
                          style={{
                            background: "rgba(212,175,55,0.06)",
                            border: "1px solid rgba(212,175,55,0.2)",
                          }}
                          onMouseEnter={e => (e.currentTarget.style.background = "rgba(212,175,55,0.12)")}
                          onMouseLeave={e => (e.currentTarget.style.background = "rgba(212,175,55,0.06)")}
                        >
                          <span style={{ fontFamily: "var(--font-outfit)", fontWeight: 600, fontSize: 12, color: "#D4AF37" }}>
                            {a.label}
                          </span>
                          {a.external
                            ? <ExternalLink size={11} color="#D4AF37" className="shrink-0 opacity-70" />
                            : a.action
                              ? <ChevronRight size={12} color="#D4AF37" className="shrink-0 opacity-70" />
                              : <ChevronRight size={12} color="#D4AF37" className="shrink-0 opacity-70" />
                          }
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-2 justify-start">
                <div className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, #C9971C, #D4AF37)" }}>
                  <Headphones size={12} color="#0A0A0A" strokeWidth={2.2} />
                </div>
                <div className="bg-[#1a1a1a] border border-[#222] rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="w-1.5 h-1.5 rounded-full bg-gray-600 animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-[#1F1F1F] flex gap-2 shrink-0 bg-[#0f0f0f]">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && send()}
              placeholder="Ask a question or paste order ref…"
              className="flex-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-white text-xs placeholder-gray-600 focus:outline-none focus:border-[#D4AF37]/40 transition-colors"
            />
            <button onClick={() => send()} disabled={!input.trim() || loading}
              className="w-10 h-10 rounded-xl flex items-center justify-center disabled:opacity-40 transition-all hover:scale-105 shrink-0"
              style={{ background: "linear-gradient(135deg, #C9971C, #D4AF37)" }}>
              <Send size={14} color="#0A0A0A" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
