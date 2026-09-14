import { getQuotes } from "@/lib/quotes";
import { isAuthenticated } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import QuoteActions from "./QuoteActions";

export const dynamic = "force-dynamic";

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  new:       { bg: "bg-blue-400/10",   text: "text-blue-400" },
  reviewing: { bg: "bg-yellow-400/10", text: "text-yellow-400" },
  quoted:    { bg: "bg-purple-400/10", text: "text-purple-400" },
  approved:  { bg: "bg-green-400/10",  text: "text-green-400" },
  declined:  { bg: "bg-red-400/10",    text: "text-red-400" },
};

export default async function AdminQuotesPage() {
  if (!(await isAuthenticated())) redirect("/admin");

  const quotes = getQuotes();

  return (
    <div className="min-h-screen bg-[#111111]">
      <header className="bg-[#0f0f0f] border-b border-[#1A1A1A] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/dashboard" className="text-gray-500 hover:text-white text-sm transition-colors">
            &larr; Dashboard
          </Link>
          <span className="text-gray-700">/</span>
          <h1 className="text-white font-bold text-sm">Quote Requests</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-gray-500 bg-[#1a1a1a] rounded-full px-3 py-1">
            {quotes.filter((q) => q.status === "new").length} new
          </span>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Stats */}
        <div className="grid grid-cols-5 gap-4 mb-8">
          {["new", "reviewing", "quoted", "approved", "declined"].map((s) => {
            const count = quotes.filter((q) => q.status === s).length;
            const colors = STATUS_COLORS[s];
            return (
              <div key={s} className="bg-[#1D1D1D] border border-[#2A2A2A] rounded-2xl p-5 text-center">
                <p className={`text-2xl font-bold mb-1 ${colors.text}`}>{count}</p>
                <p className="text-gray-500 text-xs capitalize">{s}</p>
              </div>
            );
          })}
        </div>

        {quotes.length === 0 ? (
          <div className="bg-[#1D1D1D] border border-[#2A2A2A] rounded-2xl p-16 text-center">
            <p className="text-gray-500 text-lg">No quote requests yet.</p>
            <p className="text-gray-700 text-sm mt-2">They will appear here when customers use the Solar Wizard or contact form.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {quotes.map((q) => {
              const colors = STATUS_COLORS[q.status] ?? STATUS_COLORS.new;
              let appliances: { label: string; qty: number }[] = [];
              try { appliances = JSON.parse(q.appliances); } catch { /* ignore */ }

              const waPhone = q.phone.replace(/[^0-9]/g, "");
              const waMsg = encodeURIComponent(
                `Hi ${q.name}, this is Bevanssons regarding your quote request #${q.ref} for the ${q.recommendedPackage || "solar system"}. `
              );

              return (
                <div key={q.id} className="bg-[#1D1D1D] border border-[#2A2A2A] rounded-2xl overflow-hidden">
                  {/* Header row */}
                  <div className="flex items-center justify-between flex-wrap gap-4 px-6 py-4 border-b border-[#1A1A1A]">
                    <div className="flex items-center gap-4 flex-wrap">
                      <span className="text-[#C8B993] font-bold text-sm font-mono">{q.ref}</span>
                      <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase ${colors.bg} ${colors.text}`}>
                        {q.status}
                      </span>
                      <span className="text-gray-500 text-xs">{new Date(q.createdAt).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                      {q.source && <span className="text-gray-700 text-xs border border-[#2a2a2a] rounded-full px-2 py-0.5">via {q.source}</span>}
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href={`https://wa.me/${waPhone}?text=${waMsg}`}
                        target="_blank" rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-lg text-xs font-medium text-green-400 bg-green-400/5 hover:bg-green-400/10 transition-colors"
                      >
                        WhatsApp
                      </a>
                      {q.email && (
                        <a href={`mailto:${q.email}?subject=Your Quote Request ${q.ref}`}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-300 bg-white/5 hover:bg-white/10 transition-colors">
                          Email
                        </a>
                      )}
                      <QuoteActions id={q.id} quoteRef={q.ref} currentStatus={q.status} hasEmail={!!q.email} recommendedPackage={q.recommendedPackage} estimatedPrice={q.estimatedPrice} />
                    </div>
                  </div>

                  {/* Body */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 divide-y sm:divide-y-0 sm:divide-x divide-[#1A1A1A]">
                    {/* Customer */}
                    <div className="px-6 py-5">
                      <p className="text-xs text-gray-600 uppercase tracking-wider mb-3">Customer</p>
                      <p className="text-white font-semibold text-sm mb-1">{q.name}</p>
                      <p className="text-gray-400 text-sm">{q.phone}</p>
                      {q.email && <p className="text-gray-500 text-xs mt-1">{q.email}</p>}
                      {q.province && <p className="text-gray-600 text-xs mt-1">{q.province}</p>}
                    </div>

                    {/* Requirements */}
                    <div className="px-6 py-5">
                      <p className="text-xs text-gray-600 uppercase tracking-wider mb-3">Requirements</p>
                      {q.propertyType && <div className="mb-1"><span className="text-gray-500 text-xs">Property: </span><span className="text-gray-300 text-sm">{q.propertyType}</span></div>}
                      {q.mainGoal && <div className="mb-1"><span className="text-gray-500 text-xs">Goal: </span><span className="text-gray-300 text-sm">{q.mainGoal}</span></div>}
                      {q.monthlyBill && <div className="mb-1"><span className="text-gray-500 text-xs">Bill: </span><span className="text-gray-300 text-sm">{q.monthlyBill}</span></div>}
                      {q.budget && <div><span className="text-gray-500 text-xs">Budget: </span><span className="text-gray-300 text-sm">{q.budget}</span></div>}
                    </div>

                    {/* Recommendation */}
                    <div className="px-6 py-5">
                      <p className="text-xs text-gray-600 uppercase tracking-wider mb-3">Recommendation</p>
                      {q.recommendedPackage && (
                        <p className="text-[#C8B993] font-bold text-sm mb-1">{q.recommendedPackage}</p>
                      )}
                      {q.estimatedPrice && (
                        <p className="text-white font-semibold text-sm">{q.estimatedPrice}</p>
                      )}
                      {appliances.length > 0 && (
                        <div className="mt-2">
                          <p className="text-gray-600 text-xs mb-1">Appliances:</p>
                          <p className="text-gray-400 text-xs">{appliances.map((a) => `${a.label} ×${a.qty}`).join(", ")}</p>
                        </div>
                      )}
                    </div>

                    {/* Message */}
                    <div className="px-6 py-5">
                      <p className="text-xs text-gray-600 uppercase tracking-wider mb-3">Message</p>
                      <p className="text-gray-400 text-sm leading-relaxed line-clamp-4">
                        {q.message || "—"}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// Server-side status display (update requires a form action)
