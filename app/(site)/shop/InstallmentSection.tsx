"use client";
import { useState } from "react";
import dynamic from "next/dynamic";

const InstallmentModal = dynamic(() => import("@/components/InstallmentModal"), { ssr: false });

interface Settings {
  min_deposit_pct: number;
  eligible_terms: number[];
  monthly_rate: number;
  admin_fee: number;
}

interface Props {
  product: { id: string; name: string; price: string };
  settings: Settings;
}

function calcMonthly(price: number, deposit: number, term: number, rate: number, fee: number) {
  const financed = price - deposit + fee;
  if (rate === 0) {
    return Math.ceil((financed / term) * 100) / 100;
  }
  const r = rate;
  const n = term;
  return Math.ceil(((financed * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)) * 100) / 100;
}

export default function InstallmentSection({ product, settings }: Props) {
  const [open, setOpen] = useState(false);

  const price = parseFloat(product.price.replace(/[^0-9.]/g, "")) || 0;
  if (price < 4000) return null;
  const deposit = Math.max(2000, Math.ceil(price * settings.min_deposit_pct / 100 * 100) / 100);
  const terms = settings.eligible_terms;
  const maxTerm = Math.max(...terms);
  const monthly = calcMonthly(price, deposit, maxTerm, settings.monthly_rate, settings.admin_fee);

  function handleOpen() {
    fetch("/api/installments/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: "eligibility_clicked", product_id: product.id }),
    }).catch(() => {});
    setOpen(true);
  }

  return (
    <>
      {/* Installment teaser block */}
      <div className="rounded-2xl border border-[#C8B993]/20 bg-[#C8B993]/5 p-4 mt-1">
        <p className="text-gray-400 text-xs mb-1">Available on installments</p>
        <p className="text-white font-bold text-lg">
          From{" "}
          <span className="text-[#C8B993]">R {monthly.toLocaleString("en-ZA")}/month</span>
          <span className="text-gray-500 text-sm font-normal"> × {maxTerm} months</span>
        </p>

        <button
          onClick={handleOpen}
          className="mt-3 w-full btn-gold py-3 rounded-xl font-bold text-sm tracking-wide"
        >
          CHECK MY ELIGIBILITY
        </button>

        <p className="text-center text-gray-600 text-xs mt-2">
          No credit bureau check required*
        </p>
      </div>

      {open && (
        <InstallmentModal
          product={product}
          settings={settings}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
