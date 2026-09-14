"use client";
import { useState } from "react";
import { useCart } from "@/components/CartContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Upload, CheckCircle, Copy } from "lucide-react";
import type { BankDetails } from "@/lib/bankDetails";

function parsePrice(p: string): number {
  return parseFloat(p.replace(/[^0-9.]/g, "")) || 0;
}

export default function CheckoutPage() {
  const { items, clear } = useCart();
  const cartTotal = items.reduce((s, i) => s + parsePrice(i.price) * i.qty, 0);
  const router = useRouter();

  const [step, setStep] = useState<"details" | "payment" | "done">("details");
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [addr, setAddr] = useState({ line1: "", line2: "", suburb: "", city: "", province: "", postal: "" });
  const [order, setOrder] = useState<{ id: string; ref: string; total: number } | null>(null);
  const [selectedBank, setSelectedBank] = useState<BankDetails | null>(null);
  const [proof, setProof] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [payfastLoading, setPayfastLoading] = useState(false);

  const cartItems = items.map(i => ({ id: i.id, name: i.name, price: i.price, qty: i.qty, imageUrl: i.imageUrl }));

  if (items.length === 0 && step === "details") {
    return (
      <div className="min-h-screen flex items-center justify-center text-center px-6">
        <div>
          <p className="text-gray-400 mb-6">Your cart is empty.</p>
          <button onClick={() => router.push("/shop")} className="btn-gold px-8 py-3 rounded-xl">
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  async function submitOrder() {
    setSubmitting(true);
    setError("");
    try {
      const addressParts = [addr.line1, addr.line2, addr.suburb, addr.city, addr.province, addr.postal].filter(Boolean);
      const address = addressParts.join(", ");
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, address, items: cartItems, total: cartTotal }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Order failed");
      setOrder({ id: data.id, ref: data.ref, total: data.total });
      setSelectedBank(data.bank);
      setStep("payment");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  async function payWithPayfast() {
    if (!order) return;
    setPayfastLoading(true);
    setError("");
    try {
      const res = await fetch("/api/checkout/payfast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "PayFast is unavailable right now");

      // PayFast expects a real form POST, not a redirect — build one
      // dynamically and submit it, same pattern as any standard PayFast
      // integration (see lib/payfast.ts for how these fields are signed).
      const payForm = document.createElement("form");
      payForm.method = "POST";
      payForm.action = data.url;
      for (const [key, value] of Object.entries(data.fields as Record<string, string>)) {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = value;
        payForm.appendChild(input);
      }
      document.body.appendChild(payForm);
      payForm.submit();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setPayfastLoading(false);
    }
  }

  async function submitProof() {
    if (!proof || !order) return;
    setUploading(true);
    setError("");
    try {
      const arrayBuffer = await proof.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      let binary = "";
      for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
      const base64 = btoa(binary);
      const res = await fetch("/api/upload-proof", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          file: base64,
          mimeType: proof.type,
          filename: proof.name,
          orderId: order.id,
          ref: order.ref,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      clear();
      setStep("done");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setProof(file);
    if (file.type.startsWith("image/")) {
      setProofPreview(URL.createObjectURL(file));
    } else {
      setProofPreview(null);
    }
  }

  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }

  const discount = cartTotal >= 10000 ? cartTotal * 0.25 : 0;
  const finalTotal = cartTotal - discount;

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">

        {/* Step indicator */}
        <div className="flex items-center gap-3 mb-10">
          {["details", "payment", "done"].map((s, i) => (
            <div key={s} className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                step === s ? "bg-[#D4AF37] text-black" :
                (["details","payment","done"].indexOf(step) > i) ? "bg-[#D4AF37]/30 text-[#D4AF37]" :
                "bg-[#1F1F1F] text-gray-500"
              }`}>
                {i + 1}
              </div>
              <span className={`hidden sm:inline text-sm font-medium ${step === s ? "text-white" : "text-gray-500"}`}>
                {s === "details" ? "Your Details" : s === "payment" ? "Pay via EFT" : "Confirmed"}
              </span>
              {i < 2 && <div className="w-8 sm:w-12 h-px bg-[#1F1F1F]" />}
            </div>
          ))}
        </div>

        {/* ── Step 1: Customer Details ─────────────────────────── */}
        {step === "details" && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3 bg-[#111111] border border-[#1F1F1F] rounded-2xl p-7">
              <h2 className="text-xl font-bold text-white mb-6">Your Details</h2>
              <div className="space-y-4">
                {[
                  { key: "name",  label: "Full Name",     type: "text",  placeholder: "John Smith" },
                  { key: "email", label: "Email Address", type: "email", placeholder: "john@example.com" },
                  { key: "phone", label: "Phone Number",  type: "tel",   placeholder: "082 000 0000" },
                ].map(({ key, label, type, placeholder }) => (
                  <div key={key}>
                    <label className="block text-sm text-gray-400 mb-1.5">{label}</label>
                    <input
                      type={type}
                      value={form[key as keyof typeof form]}
                      onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                      placeholder={placeholder}
                      className="w-full bg-[#0A0A0A] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#D4AF37] transition-colors"
                    />
                  </div>
                ))}

                {/* Delivery Address */}
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Delivery Address</label>
                  <div className="space-y-2">
                    <input type="text" placeholder="Street address or PO Box *" value={addr.line1}
                      onChange={e => setAddr(a => ({ ...a, line1: e.target.value }))}
                      className="w-full bg-[#0A0A0A] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#D4AF37] transition-colors" />
                    <input type="text" placeholder="Apartment, unit, complex (optional)" value={addr.line2}
                      onChange={e => setAddr(a => ({ ...a, line2: e.target.value }))}
                      className="w-full bg-[#0A0A0A] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#D4AF37] transition-colors" />
                    <input type="text" placeholder="Suburb" value={addr.suburb}
                      onChange={e => setAddr(a => ({ ...a, suburb: e.target.value }))}
                      className="w-full bg-[#0A0A0A] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#D4AF37] transition-colors" />
                    <div className="grid grid-cols-2 gap-2">
                      <input type="text" placeholder="City / Town" value={addr.city}
                        onChange={e => setAddr(a => ({ ...a, city: e.target.value }))}
                        className="w-full bg-[#0A0A0A] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#D4AF37] transition-colors" />
                      <input type="text" placeholder="Postal code" value={addr.postal}
                        onChange={e => setAddr(a => ({ ...a, postal: e.target.value }))}
                        className="w-full bg-[#0A0A0A] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#D4AF37] transition-colors" />
                    </div>
                    <select value={addr.province} onChange={e => setAddr(a => ({ ...a, province: e.target.value }))}
                      className="w-full bg-[#0A0A0A] border border-[#2a2a2a] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#D4AF37] transition-colors appearance-none"
                      style={{ color: addr.province ? "#fff" : "#4b5563" }}>
                      <option value="" disabled>Province</option>
                      {["Eastern Cape","Free State","Gauteng","KwaZulu-Natal","Limpopo","Mpumalanga","Northern Cape","North West","Western Cape"].map(p => (
                        <option key={p} value={p} style={{ color: "#fff", background: "#0A0A0A" }}>{p}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              {error && <p className="text-red-400 text-sm mt-4">{error}</p>}
              <button
                onClick={submitOrder}
                disabled={submitting || !form.name || !form.email || !form.phone || !addr.line1}
                className="btn-gold w-full py-4 rounded-xl font-bold text-base mt-6 disabled:opacity-50"
              >
                {submitting ? "Placing Order…" : "Place Order"}
              </button>
            </div>

            {/* Order summary */}
            <div className="lg:col-span-2">
              <div className="bg-[#111111] border border-[#1F1F1F] rounded-2xl p-6 sticky top-[124px]">
                <h3 className="text-base font-semibold text-white mb-5">Order Summary</h3>
                <div className="space-y-4 mb-5">
                  {items.map(item => (
                    <div key={item.id} className="flex gap-3 items-start">
                      {item.imageUrl && (
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-[#1a1a1a]">
                          <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white font-medium truncate">{item.name}</p>
                        <p className="text-xs text-gray-500">Qty: {item.qty}</p>
                      </div>
                      <p className="text-sm text-[#D4AF37] font-semibold shrink-0">
                        R {(parsePrice(item.price) * item.qty).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="border-t border-[#1F1F1F] pt-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Subtotal</span>
                    <span className="text-white text-sm">R {cartTotal.toLocaleString()}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-green-400 text-sm">25% Bulk Discount</span>
                      <span className="text-green-400 text-sm font-semibold">-R {discount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-gray-400 text-sm font-medium">Total</span>
                    <span className="text-xl font-extrabold text-white">R {finalTotal.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Step 2: Payment ──────────────────────────────────── */}
        {step === "payment" && order && selectedBank && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3 space-y-6">

              <div className="bg-[#111111] border border-[#D4AF37]/40 rounded-2xl p-7">
                <p className="section-label mb-2">Pay Instantly</p>
                <p className="text-gray-400 text-sm mb-5 leading-relaxed">
                  Pay securely by card, Instant EFT, or other methods via PayFast — your order is confirmed automatically the moment payment clears, no proof upload needed.
                </p>
                <button onClick={payWithPayfast} disabled={payfastLoading}
                  className="btn-gold w-full py-4 rounded-xl font-bold text-base disabled:opacity-50">
                  {payfastLoading ? "Redirecting to PayFast…" : `Pay R ${order.total.toLocaleString()} with PayFast`}
                </button>
              </div>

              <div className="flex items-center gap-3 text-gray-600 text-xs">
                <div className="flex-1 h-px bg-[#1F1F1F]" />
                OR PAY MANUALLY VIA EFT
                <div className="flex-1 h-px bg-[#1F1F1F]" />
              </div>

              <div className="bg-[#111111] border border-[#D4AF37]/20 rounded-2xl p-7">
                <p className="section-label mb-4">Bank Transfer Details</p>
                <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                  Transfer the exact amount below to this account, then upload your proof of payment.
                </p>
                <div className="space-y-1">
                  {([
                    ["Bank",           selectedBank.bank,          false],
                    ["Account Holder", selectedBank.accountHolder, false],
                    ["Account Type",   selectedBank.accountType,   false],
                    ["Account Number", selectedBank.accountNumber, true],
                    ["Branch Code",    selectedBank.branchCode,    false],
                    ...(selectedBank.payshap ? [["PayShap", selectedBank.payshap, true]] : []),
                    ["Reference",      order.ref,                  true],
                    ["Amount",         `R ${order.total.toLocaleString()}`, false],
                  ] as [string, string, boolean][]).map(([label, value, copyable]) => (
                    <div key={label as string} className="flex items-center justify-between py-2.5 border-b border-[#1F1F1F] last:border-0">
                      <span className="text-gray-500 text-sm">{label as string}</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-semibold ${
                          label === "Reference" || label === "Amount" || label === "Account Number"
                            ? "text-[#D4AF37] font-mono"
                            : "text-white"
                        }`}>{value as string}</span>
                        {copyable && (
                          <button onClick={() => copy(value as string, label as string)} className="text-gray-500 hover:text-[#D4AF37] transition-colors">
                            {copied === label ? <CheckCircle size={14} color="#22c55e" /> : <Copy size={14} />}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#111111] border border-[#1F1F1F] rounded-2xl p-7">
                <p className="section-label mb-4">Upload Proof of Payment</p>
                <p className="text-gray-400 text-sm mb-5">
                  Upload a screenshot or photo of your payment confirmation. Your order will be processed once verified.
                </p>
                <label className="block cursor-pointer">
                  <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                    proof ? "border-[#D4AF37]/50 bg-[#D4AF37]/5" : "border-[#2a2a2a] hover:border-[#D4AF37]/30"
                  }`}>
                    {proofPreview ? (
                      <div className="relative h-40 rounded-lg overflow-hidden">
                        <Image src={proofPreview} alt="Proof" fill className="object-contain" />
                      </div>
                    ) : (
                      <>
                        <Upload size={28} className="mx-auto mb-3 text-gray-500" />
                        <p className="text-sm text-gray-400">{proof ? proof.name : "Click to upload proof of payment"}</p>
                        <p className="text-xs text-gray-600 mt-1">JPG, PNG, WEBP or PDF — max 8 MB</p>
                      </>
                    )}
                  </div>
                  <input type="file" accept="image/*,.pdf" onChange={handleFileChange} className="hidden" />
                </label>
                {error && <p className="text-red-400 text-sm mt-3">{error}</p>}
                <button onClick={submitProof} disabled={!proof || uploading}
                  className="btn-gold w-full py-4 rounded-xl font-bold text-base mt-5 disabled:opacity-50">
                  {uploading ? "Uploading…" : "Submit Proof of Payment"}
                </button>
                <p className="text-center text-gray-600 text-xs mt-3">
                  Don&apos;t have proof yet?{" "}
                  <button onClick={() => router.push(`/checkout/success?ref=${order.ref}`)} className="text-[#D4AF37] underline">
                    Submit later
                  </button>
                </p>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="bg-[#111111] border border-[#1F1F1F] rounded-2xl p-6 sticky top-[124px] space-y-4">
                <h3 className="text-base font-semibold text-white">Order Placed</h3>
                <div className="bg-[#0A0A0A] rounded-xl p-4 text-center">
                  <p className="text-xs text-gray-500 mb-1">Your Order Reference</p>
                  <p className="text-2xl font-extrabold text-[#D4AF37]">{order.ref}</p>
                  <p className="text-xs text-gray-600 mt-1">Save this for your records</p>
                </div>
                <div className="border-t border-[#1F1F1F] pt-4 flex justify-between">
                  <span className="text-gray-400 text-sm">Total to pay</span>
                  <span className="text-white font-bold">R {order.total.toLocaleString()}</span>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  We will review your proof of payment and confirm your order via email within 2–4 hours.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── Step 3: Confirmed ────────────────────────────────── */}
        {step === "done" && order && (
          <div className="max-w-lg mx-auto text-center py-10">
            <div className="w-20 h-20 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={36} className="text-[#D4AF37]" />
            </div>
            <h2 className="text-3xl font-extrabold text-white mb-3">Proof Received!</h2>
            <p className="text-gray-400 mb-8 leading-relaxed">
              Thank you {form.name}. We&apos;ve received your proof of payment for order{" "}
              <span className="text-[#D4AF37] font-semibold">{order.ref}</span>.
              We&apos;ll verify and confirm via email within 2–4 hours.
            </p>
            <div className="bg-[#111111] border border-[#1F1F1F] rounded-2xl p-6 text-left mb-8 space-y-2">
              <p className="text-sm text-gray-500">Confirmation sent to</p>
              <p className="text-white font-medium">{form.email}</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button onClick={() => router.push("/shop")} className="btn-gold px-8 py-3.5 rounded-xl font-bold">
                Continue Shopping
              </button>
              <button onClick={() => router.push("/")} className="btn-outline px-8 py-3.5 rounded-xl">
                Back to Home
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
