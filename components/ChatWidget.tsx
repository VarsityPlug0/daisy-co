"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { X, Send, MessageCircle, ChevronDown } from "lucide-react";

const VISITOR_KEY = "daisy_visitor_id";
const SESSION_KEY = "daisy_chat_session";

function getVisitorId(): string {
  let id = localStorage.getItem(VISITOR_KEY);
  if (!id) { id = crypto.randomUUID(); localStorage.setItem(VISITOR_KEY, id); }
  return id;
}

type Msg = { id: string; sender: "customer" | "admin"; body: string; createdAt: string };

const GOLD = "#D4AF37";

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [unread, setUnread] = useState(0);
  const [step, setStep] = useState<"intro" | "form" | "chat">("intro");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [starting, setStarting] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const lastCreatedAt = useRef<string>("");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Restore session from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(SESSION_KEY);
    const savedName = localStorage.getItem("daisy_visitor_name") || "";
    const savedPhone = localStorage.getItem("daisy_visitor_phone") || "";
    if (savedName) setName(savedName);
    if (savedPhone) setPhone(savedPhone);
    if (saved) {
      setSessionId(saved);
      setStep("chat");
    }
  }, []);

  // Listen for global open event (from cart, etc.)
  useEffect(() => {
    function handler(e: Event) {
      const detail = (e as CustomEvent).detail as { message?: string } | undefined;
      setOpen(true);
      if (detail?.message && sessionId) {
        sendMessage(detail.message);
      } else if (detail?.message) {
        setInput(detail.message);
        if (step === "intro") setStep("form");
      }
    }
    window.addEventListener("openDaisyChat", handler);
    return () => window.removeEventListener("openDaisyChat", handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, step]);

  const fetchMessages = useCallback(async (sid: string, initial = false) => {
    const after = initial ? "" : lastCreatedAt.current;
    const url = `/api/chat/messages?sessionId=${sid}${after ? `&after=${encodeURIComponent(after)}` : ""}`;
    const res = await fetch(url).catch(() => null);
    if (!res?.ok) return;
    const data = await res.json();
    const msgs: Msg[] = data.messages ?? [];
    if (msgs.length) {
      setMessages(prev => {
        const existing = new Set(prev.map(m => m.id));
        const newMsgs = msgs.filter(m => !existing.has(m.id));
        if (!newMsgs.length) return prev;
        lastCreatedAt.current = newMsgs[newMsgs.length - 1].createdAt;
        if (!open) setUnread(u => u + newMsgs.filter(m => m.sender === "admin").length);
        return [...prev, ...newMsgs];
      });
    }
  }, [open]);

  // Start polling when we have a session
  useEffect(() => {
    if (!sessionId) return;
    fetchMessages(sessionId, true);
    pollRef.current = setInterval(() => fetchMessages(sessionId), 3000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [sessionId, fetchMessages]);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  // Clear unread when opened
  useEffect(() => {
    if (open) setUnread(0);
  }, [open]);

  async function startChat() {
    if (!phone.trim() && !name.trim()) return;
    setStarting(true);
    const visitorId = getVisitorId();
    if (name) localStorage.setItem("daisy_visitor_name", name);
    if (phone) localStorage.setItem("daisy_visitor_phone", phone);
    const res = await fetch("/api/chat/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visitorId, name, phone }),
    });
    const data = await res.json();
    setSessionId(data.sessionId);
    localStorage.setItem(SESSION_KEY, data.sessionId);
    setStep("chat");
    setStarting(false);
    // Send initial input if any
    if (input.trim()) {
      await doSend(data.sessionId, input.trim());
      setInput("");
    }
  }

  async function doSend(sid: string, text: string) {
    const res = await fetch("/api/chat/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId: sid, body: text }),
    });
    const data = await res.json();
    if (data.ok) {
      const now = new Date().toISOString();
      const newMsg: Msg = { id: data.id, sender: "customer", body: text, createdAt: now };
      setMessages(prev => [...prev, newMsg]);
      lastCreatedAt.current = now;
    }
  }

  async function sendMessage(text?: string) {
    const body = (text ?? input).trim();
    if (!body || !sessionId || sending) return;
    setSending(true);
    setInput("");
    await doSend(sessionId, body);
    setSending(false);
  }

  function formatTime(iso: string) {
    return new Date(iso).toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" });
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-5 right-5 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110"
        style={{ background: GOLD, boxShadow: "0 4px 24px rgba(212,175,55,0.45)" }}
        aria-label="Chat with us"
      >
        {open
          ? <ChevronDown size={24} color="#000" />
          : <>
              <MessageCircle size={26} color="#000" />
              {unread > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {unread}
                </span>
              )}
            </>
        }
      </button>

      {/* Chat panel */}
      {open && (
        <div
          className="fixed bottom-24 right-5 z-50 flex flex-col rounded-2xl overflow-hidden"
          style={{
            width: "min(380px, calc(100vw - 40px))",
            height: "min(520px, calc(100vh - 140px))",
            background: "#111",
            border: "1px solid #1F1F1F",
            boxShadow: "0 20px 60px rgba(0,0,0,0.8)",
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 shrink-0" style={{ background: "#0A0A0A", borderBottom: "1px solid #1F1F1F" }}>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: `${GOLD}22`, border: `1px solid ${GOLD}44` }}>
                <MessageCircle size={15} color={GOLD} />
              </div>
              <div>
                <p className="text-white text-sm font-bold leading-none">Daisy Gadgets Co.</p>
                <p className="text-green-400 text-[10px] mt-0.5">Online — we reply fast</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-gray-600 hover:text-white transition-colors">
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">

            {/* Intro step */}
            {step === "intro" && (
              <div className="flex flex-col items-center text-center pt-6">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: `${GOLD}15`, border: `1px solid ${GOLD}33` }}>
                  <MessageCircle size={32} color={GOLD} />
                </div>
                <h3 className="text-white font-bold text-lg mb-2">Hi there! 👋</h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-6">
                  Got a question about a product? Need help with your order? Chat with us — we reply within minutes.
                </p>
                <button
                  onClick={() => setStep("form")}
                  className="w-full py-3 rounded-xl font-bold text-sm text-black"
                  style={{ background: GOLD }}
                >
                  Start chatting
                </button>
              </div>
            )}

            {/* Form step */}
            {step === "form" && (
              <div className="space-y-3 pt-2">
                <p className="text-gray-400 text-sm text-center mb-4">Just a few details so we know who we are talking to:</p>
                <input
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#D4AF37] transition-colors"
                />
                <input
                  type="tel"
                  placeholder="Phone number *"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  required
                  className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#D4AF37] transition-colors"
                />
                {input && (
                  <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-3">
                    <p className="text-gray-500 text-xs mb-1">Your message:</p>
                    <p className="text-gray-300 text-sm">{input}</p>
                  </div>
                )}
                <button
                  onClick={startChat}
                  disabled={starting || !phone.trim()}
                  className="w-full py-3 rounded-xl font-bold text-sm text-black disabled:opacity-40 transition-all"
                  style={{ background: GOLD }}
                >
                  {starting ? "Starting..." : "Start chat"}
                </button>
              </div>
            )}

            {/* Chat step */}
            {step === "chat" && (
              <>
                {messages.length === 0 && (
                  <div className="text-center py-6">
                    <p className="text-gray-500 text-sm">Send us a message — we reply fast!</p>
                  </div>
                )}
                {messages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.sender === "customer" ? "justify-end" : "justify-start"}`}>
                    <div
                      className="max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed"
                      style={msg.sender === "customer"
                        ? { background: GOLD, color: "#000", borderBottomRightRadius: 4 }
                        : { background: "#1a1a1a", color: "#e5e7eb", borderBottomLeftRadius: 4, border: "1px solid #2a2a2a" }
                      }
                    >
                      {msg.sender === "admin" && (
                        <p className="text-[10px] font-bold mb-1" style={{ color: GOLD }}>Daisy Support</p>
                      )}
                      <p>{msg.body}</p>
                      <p className="text-[10px] mt-1 opacity-60 text-right">{formatTime(msg.createdAt)}</p>
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </>
            )}
          </div>

          {/* Input */}
          {step === "chat" && (
            <div className="px-3 py-3 shrink-0" style={{ borderTop: "1px solid #1F1F1F" }}>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
                  className="flex-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#D4AF37] transition-colors"
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || sending}
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 disabled:opacity-30 transition-all hover:scale-105"
                  style={{ background: GOLD }}
                >
                  <Send size={16} color="#000" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
