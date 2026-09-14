"use client";
import { useState } from "react";
import { Send, ChevronDown } from "lucide-react";

const STATUSES = ["new", "reviewing", "quoted", "approved", "declined"];

interface Props {
  id: string;
  quoteRef: string;
  currentStatus: string;
  hasEmail: boolean;
  recommendedPackage: string;
  estimatedPrice: string;
}

export default function QuoteActions({ id, quoteRef, currentStatus, hasEmail, recommendedPackage, estimatedPrice }: Props) {
  const [status, setStatus] = useState(currentStatus);
  const [showReply, setShowReply] = useState(false);
  const [pkg, setPkg] = useState(recommendedPackage);
  const [price, setPrice] = useState(estimatedPrice);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  async function updateStatus(newStatus: string) {
    setStatus(newStatus);
    await fetch(`/api/admin/quotes/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ packageName: pkg, price, message, statusOnly: true }),
    }).catch(() => {});
    // Lightweight status-only update via a simple fetch to the status field
    // We'll just optimistically update the UI
  }

  async function sendReply(e: React.FormEvent) {
    e.preventDefault();
    if (!price) return;
    setSending(true);
    const res = await fetch(`/api/admin/quotes/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ packageName: pkg, price, message }),
    });
    setSending(false);
    if (res.ok) {
      setSent(true);
      setShowReply(false);
      setStatus("quoted");
    }
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Status selector */}
      <div className="relative">
        <select
          value={status}
          onChange={(e) => updateStatus(e.target.value)}
          className="appearance-none bg-[#1a1a1a] border border-[#2a2a2a] text-gray-300 text-xs rounded-lg pl-3 pr-7 py-1.5 focus:outline-none focus:border-[#C8B993] cursor-pointer"
        >
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
      </div>

      {/* Reply button */}
      {hasEmail && (
        <button
          onClick={() => setShowReply(v => !v)}
          className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#C8B993] bg-[#C8B993]/8 hover:bg-[#C8B993]/15 transition-colors flex items-center gap-1.5"
        >
          <Send size={11} />
          {sent ? "Sent ✓" : "Send Quote"}
        </button>
      )}

      {/* Reply form — inline below */}
      {showReply && (
        <div className="w-full mt-3 p-4 bg-[#0f0f0f] border border-[#C8B993]/20 rounded-xl">
          <p className="text-xs font-bold text-[#C8B993] uppercase tracking-wider mb-3">
            Send Quote Email to Customer — {quoteRef}
          </p>
          <form onSubmit={sendReply} className="space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Package name"
                value={pkg}
                onChange={e => setPkg(e.target.value)}
                className="flex-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#C8B993] transition-colors"
              />
              <input
                type="text"
                placeholder="Price (e.g. R 24,999) *"
                value={price}
                onChange={e => setPrice(e.target.value)}
                required
                className="flex-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#C8B993] transition-colors"
              />
            </div>
            <textarea
              placeholder="Message to customer (optional)"
              value={message}
              onChange={e => setMessage(e.target.value)}
              rows={3}
              className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#C8B993] transition-colors resize-none"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={sending || !price}
                className="px-5 py-2 rounded-lg text-sm font-bold text-[#111111] disabled:opacity-40 transition-opacity"
                style={{ background: "linear-gradient(135deg,#C8B993,#f5d76e)" }}
              >
                {sending ? "Sending..." : "Send to Customer"}
              </button>
              <button type="button" onClick={() => setShowReply(false)} className="px-4 py-2 rounded-lg text-sm text-gray-500 hover:text-white transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
