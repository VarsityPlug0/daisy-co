"use client";
import { useState } from "react";
import { Search, Package, CheckCircle, Truck, Clock } from "lucide-react";
import Link from "next/link";

type OrderStatus = {
  ref: string;
  status: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  items: Array<{ name: string; qty: number; price: string }>;
  total: number;
};

const STATUS_STEPS: Record<string, number> = {
  pending: 0,
  payment_received: 1,
  processing: 2,
  shipped: 3,
  delivered: 4,
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Awaiting Payment",
  payment_received: "Payment Confirmed",
  processing: "Being Prepared",
  shipped: "Shipped & On Its Way",
  delivered: "Delivered",
};

export default function TrackOrderPage() {
  const [ref, setRef] = useState("");
  const [order, setOrder] = useState<OrderStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function search(e: React.FormEvent) {
    e.preventDefault();
    if (!ref.trim()) return;
    setLoading(true);
    setError("");
    setOrder(null);
    try {
      const res = await fetch(`/api/track-order?ref=${encodeURIComponent(ref.trim())}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Order not found");
      setOrder(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Order not found. Check your reference number.");
    } finally {
      setLoading(false);
    }
  }

  const step = order ? (STATUS_STEPS[order.status] ?? 0) : 0;

  return (
    <div className="max-w-2xl mx-auto px-5 sm:px-8 py-20">

      <div className="text-center mb-14">
        <p className="section-label mb-3">Order Tracking</p>
        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
          Track My <span className="gold-text">Order</span>
        </h1>
        <p className="text-gray-400 text-lg">Enter your order reference number to see the current status.</p>
      </div>

      <form onSubmit={search} className="flex gap-3 mb-8">
        <input
          type="text"
          value={ref}
          onChange={e => setRef(e.target.value)}
          placeholder="e.g. DGC-2025-0001"
          className="flex-1 bg-[#111111] border border-[#2a2a2a] rounded-xl px-5 py-4 text-white placeholder-gray-600 text-sm"
        />
        <button type="submit" disabled={loading || !ref.trim()}
          className="btn-gold px-6 py-4 rounded-xl font-bold flex items-center gap-2 disabled:opacity-50">
          <Search size={16} />
          {loading ? "…" : "Track"}
        </button>
      </form>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-5 py-4 text-red-400 text-sm mb-6">{error}</div>
      )}

      {order && (
        <div className="space-y-5">
          {/* Status */}
          <div className="bg-[#111111] border border-[#1F1F1F] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Order Reference</p>
                <p className="text-[#D4AF37] font-mono font-bold text-xl">{order.ref}</p>
              </div>
              <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20">
                {STATUS_LABELS[order.status] ?? order.status}
              </span>
            </div>

            {/* Progress steps */}
            <div className="flex items-center gap-0">
              {["Placed", "Paid", "Preparing", "Shipped", "Delivered"].map((label, i) => (
                <div key={label} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                      i <= step ? "bg-[#D4AF37] text-black" : "bg-[#1F1F1F] text-gray-600"
                    }`}>
                      {i < step ? <CheckCircle size={14} /> : i + 1}
                    </div>
                    <p className="text-[9px] text-gray-600 mt-1 text-center leading-tight max-w-12">{label}</p>
                  </div>
                  {i < 4 && <div className={`flex-1 h-0.5 mb-5 ${i < step ? "bg-[#D4AF37]" : "bg-[#1F1F1F]"}`} />}
                </div>
              ))}
            </div>
          </div>

          {/* Order details */}
          <div className="bg-[#111111] border border-[#1F1F1F] rounded-2xl p-6">
            <h3 className="text-base font-semibold text-white mb-4">Order Details</h3>
            <div className="space-y-3 mb-4">
              {order.items?.map((item, i) => (
                <div key={i} className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-white font-medium">{item.name}</p>
                    <p className="text-xs text-gray-500">Qty: {item.qty}</p>
                  </div>
                  <p className="text-sm text-[#D4AF37] font-semibold">{item.price}</p>
                </div>
              ))}
            </div>
            <div className="border-t border-[#1F1F1F] pt-3 flex justify-between">
              <span className="text-gray-400 text-sm">Total</span>
              <span className="text-white font-bold">R {order.total?.toLocaleString()}</span>
            </div>
          </div>

          <div className="bg-[#111111] border border-[#1F1F1F] rounded-2xl p-5 text-center">
            <p className="text-gray-400 text-sm mb-3">Need help with your order? Email us with your reference number.</p>
            <a href={`mailto:daisygadgetsco@gmail.com?subject=Order%20${encodeURIComponent(order.ref)}`}
              className="btn-gold px-8 py-3 rounded-xl font-bold text-sm">
              Email Us
            </a>
          </div>
        </div>
      )}

      {!order && !error && (
        <div className="bg-[#111111] border border-[#1F1F1F] rounded-2xl p-8 text-center">
          <Package size={40} color="#2a2a2a" strokeWidth={1} className="mx-auto mb-3" />
          <p className="text-gray-500 text-sm mb-4">Your order reference is in your confirmation email.</p>
          <a href="mailto:daisygadgetsco@gmail.com"
            className="text-[#D4AF37] text-sm font-semibold hover:underline">
            Can&apos;t find your reference? Email us
          </a>
        </div>
      )}
    </div>
  );
}
