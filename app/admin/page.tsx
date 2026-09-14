"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push("/admin/dashboard");
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Incorrect password. Try again.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <svg className="mx-auto mb-4" width="48" height="48" viewBox="0 0 100 100" fill="none">
            {[0,45,90,135,180,225,270,315].map((deg) => (
              <ellipse key={deg} cx="50" cy="22" rx="9" ry="18" fill="#D4AF37" transform={`rotate(${deg} 50 50)`} />
            ))}
            <circle cx="50" cy="50" r="14" fill="#D4AF37" />
            <circle cx="50" cy="50" r="8" fill="#0A0A0A" />
          </svg>
          <h1 style={{ fontFamily: "var(--font-outfit)", fontWeight: 700, fontSize: 22, color: "#D4AF37" }}>
            Bevanssons
          </h1>
          <p className="text-gray-500 text-sm mt-1">Staff Portal</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}
          className="bg-[#111111] border border-[#1F1F1F] rounded-2xl p-8 space-y-5">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              required
              className="w-full bg-[#0A0A0A] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none"
              style={{ borderColor: error ? "#ef4444" : undefined }}
            />
            {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
          </div>

          <button type="submit" disabled={loading}
            className="btn-gold w-full py-3.5 rounded-xl font-bold text-sm disabled:opacity-60">
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <p className="text-center text-gray-600 text-xs mt-6">
          Bevanssons internal use only
        </p>
      </div>
    </div>
  );
}
