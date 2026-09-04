"use client";
import { useEffect, useState } from "react";
import { Tag, Zap } from "lucide-react";

const VISITOR_KEY   = "daisy_visitor_id";
const CAPTURED_KEY  = "daisy_lead_captured";
const DISMISSED_KEY = "daisy_lead_dismissed";
const DELAY_MS      = 5000;
const SUPPRESS_DAYS = 30;

function getVisitorId(): string {
  let id = localStorage.getItem(VISITOR_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(VISITOR_KEY, id);
  }
  return id;
}

function isSuppressed(): boolean {
  const ts = localStorage.getItem(CAPTURED_KEY) ?? localStorage.getItem(DISMISSED_KEY);
  if (!ts) return false;
  return Date.now() - parseInt(ts, 10) < SUPPRESS_DAYS * 864e5;
}

type Step = "offer" | "form" | "done";

export default function LeadCapturePopup() {
  const [step, setStep] = useState<Step | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isSuppressed()) return;
    const t = setTimeout(() => setStep("offer"), DELAY_MS);
    return () => clearTimeout(t);
  }, []);

  function decline() {
    localStorage.setItem(DISMISSED_KEY, String(Date.now()));
    setStep(null);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!phone && !email) return;
    setLoading(true);
    const visitorId = getVisitorId();
    try {
      await fetch("/api/track/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visitorId, name, phone, email }),
      });
      localStorage.setItem(CAPTURED_KEY, String(Date.now()));
      localStorage.setItem("daisy_visitor_name", name);
      localStorage.setItem("daisy_visitor_phone", phone);
      localStorage.setItem("daisy_visitor_email", email);
    } catch { /* non-fatal */ }
    setLoading(false);
    setStep("done");
    setTimeout(() => setStep(null), 3000);
  }

  if (!step) return null;

  return (
    <div
      className="fixed inset-0 z-[500] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.88)", backdropFilter: "blur(6px)" }}
    >
      <div
        className="relative w-full max-w-lg rounded-3xl overflow-hidden"
        style={{
          background: "linear-gradient(160deg, #111 0%, #0a0a0a 100%)",
          border: "1px solid rgba(212,175,55,0.35)",
          boxShadow: "0 0 0 1px rgba(212,175,55,0.08), 0 40px 80px rgba(0,0,0,0.9)",
        }}
      >
        <div style={{ height: 3, background: "linear-gradient(90deg, transparent, #D4AF37, #f5d76e, #D4AF37, transparent)" }} />

        {step === "offer" && (
          <div className="px-8 py-10 text-center">
            <div
              className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center"
              style={{ background: "rgba(212,175,55,0.12)", border: "1px solid rgba(212,175,55,0.3)" }}
            >
              <Tag size={28} color="#D4AF37" />
            </div>
            <p className="text-xs font-bold tracking-[0.2em] text-[#D4AF37] uppercase mb-3">Limited Offer</p>
            <h2 className="text-white font-black text-3xl leading-tight mb-3">
              Claim <span style={{ color: "#D4AF37" }}>25% OFF</span><br />your first order
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed mb-8 max-w-xs mx-auto">
              Enter your details and we will send you an exclusive discount code right now.
            </p>
            <button
              onClick={() => setStep("form")}
              className="w-full py-4 rounded-2xl font-black text-base text-[#0A0A0A] mb-3 transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{ background: "linear-gradient(135deg, #D4AF37 0%, #f5d76e 50%, #D4AF37 100%)", boxShadow: "0 8px 24px rgba(212,175,55,0.35)" }}
            >
              <Zap size={16} className="inline mr-2 mb-0.5" />
              Yes! Claim my 25% off
            </button>
            <button onClick={decline} className="w-full py-2 text-xs text-gray-700 hover:text-gray-500 transition-colors">
              No thanks, I will pay full price
            </button>
          </div>
        )}

        {step === "form" && (
          <div className="px-8 py-9">
            <div className="text-center mb-6">
              <p className="text-xs font-bold tracking-[0.2em] text-[#D4AF37] uppercase mb-2">Almost there</p>
              <h2 className="text-white font-black text-2xl">Where do we send your code?</h2>
              <p className="text-gray-500 text-sm mt-2">Your 25% discount will be sent straight to you.</p>
            </div>
            <form onSubmit={submit} className="space-y-3">
              <input
                type="text"
                placeholder="Your name (optional)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#161616] border border-[#2a2a2a] rounded-xl px-4 py-3.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#D4AF37] transition-colors"
              />
              <input
                type="tel"
                placeholder="Phone number *"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                autoFocus
                className="w-full bg-[#161616] border border-[#2a2a2a] rounded-xl px-4 py-3.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#D4AF37] transition-colors"
              />
              <input
                type="email"
                placeholder="Email address (optional)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#161616] border border-[#2a2a2a] rounded-xl px-4 py-3.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#D4AF37] transition-colors"
              />
              <button
                type="submit"
                disabled={loading || !phone}
                className="w-full py-4 rounded-2xl font-black text-base text-[#0A0A0A] disabled:opacity-40 transition-all hover:scale-[1.02] active:scale-[0.98] mt-1"
                style={{ background: "linear-gradient(135deg, #D4AF37 0%, #f5d76e 50%, #D4AF37 100%)", boxShadow: "0 8px 24px rgba(212,175,55,0.3)" }}
              >
                {loading ? "Sending..." : "Send my 25% discount code"}
              </button>
              <button type="button" onClick={decline} className="w-full py-2 text-xs text-gray-700 hover:text-gray-500 transition-colors">
                No thanks, I will pay full price
              </button>
            </form>
          </div>
        )}

        {step === "done" && (
          <div className="px-8 py-12 text-center">
            <div className="text-5xl mb-5">🎉</div>
            <h2 className="text-white font-black text-2xl mb-2">
              You are in{name ? `, ${name.split(" ")[0]}` : ""}!
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              Your 25% discount code is on its way. Happy shopping!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
