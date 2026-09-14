"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle } from "lucide-react";
import { useCart } from "@/components/CartContext";

interface OrderSummary {
  ref: string;
  status: string;
  name: string;
  items: { name: string; price: string; qty: number }[];
  total: number;
}

function parsePrice(p: string): number {
  return parseFloat(p.replace(/[^0-9.]/g, "")) || 0;
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <CheckoutSuccessContent />
    </Suspense>
  );
}

function CheckoutSuccessContent() {
  const params = useSearchParams();
  const router = useRouter();
  const { clear } = useCart();
  const ref = params.get("ref");
  const [order, setOrder] = useState<OrderSummary | null>(null);
  const [loading, setLoading] = useState(true);

  // Reaching this page only happens via PayFast's return_url after an
  // actual payment attempt (a cancelled payment goes back to /checkout
  // instead) — safe to clear the cart here rather than before redirecting
  // to PayFast, so a cancelled payment doesn't lose the customer's cart.
  useEffect(() => {
    if (ref) clear();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref]);

  useEffect(() => {
    if (!ref) {
      setLoading(false);
      return;
    }
    fetch(`/api/track-order?ref=${encodeURIComponent(ref)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then(setOrder)
      .finally(() => setLoading(false));
  }, [ref]);

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-16">
      <div className="max-w-lg w-full text-center">
        <div className="w-20 h-20 rounded-full bg-[#C8B993]/10 border border-[#C8B993]/30 flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={36} className="text-[#C8B993]" />
        </div>
        <h1 className="text-3xl font-extrabold text-white mb-3">Payment Received!</h1>
        <p className="text-gray-400 mb-8 leading-relaxed">
          Thank you{order?.name ? ` ${order.name.split(" ")[0]}` : ""}. Your PayFast payment went through
          {ref && (
            <>
              {" "}for order <span className="text-[#C8B993] font-semibold">{ref}</span>
            </>
          )}
          . We&apos;re confirming it now — you&apos;ll get an email confirmation within a few minutes.
        </p>

        {loading && <div className="h-32 bg-[#1D1D1D] rounded-2xl animate-pulse mb-8" />}

        {!loading && order && (
          <div className="bg-[#1D1D1D] border border-[#2A2A2A] rounded-2xl p-6 text-left mb-8">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-3">Order Summary</p>
            <div className="space-y-2 mb-4">
              {order.items.map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-gray-300">{item.name} × {item.qty}</span>
                  <span className="text-gray-400">R {(parsePrice(item.price) * item.qty).toLocaleString()}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-[#2A2A2A] pt-3 flex justify-between">
              <span className="text-gray-400 text-sm font-medium">Total Paid</span>
              <span className="text-white font-bold">R {order.total.toLocaleString()}</span>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button onClick={() => router.push("/shop")} className="btn-gold px-8 py-3.5 rounded-xl font-bold">
            Continue Shopping
          </button>
          <button onClick={() => router.push("/")} className="btn-outline px-8 py-3.5 rounded-xl">
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
