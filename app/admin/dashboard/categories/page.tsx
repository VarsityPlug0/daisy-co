"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

type Category = { id: string; name: string; gender: string; position: number };

const GENDERS = ["Men", "Women", "Unisex", "Accessories"];

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [gender, setGender] = useState("Unisex");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/categories");
    setCategories(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    setError("");
    const res = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), gender }),
    });
    if (res.ok) {
      setName("");
      await load();
    } else {
      const data = await res.json();
      setError(data.error ?? "Failed to add category");
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
    await load();
  }

  const grouped = GENDERS.map((g) => ({
    gender: g,
    items: categories.filter((c) => c.gender === g),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="mb-6 flex items-center gap-4">
        <Link href="/admin/dashboard" className="text-gray-500 hover:text-white text-sm transition-colors">
          ← Dashboard
        </Link>
        <h1 className="text-xl font-bold text-white">Categories</h1>
      </div>

      {/* Add form */}
      <div className="bg-[#111111] border border-[#1F1F1F] rounded-2xl p-5 mb-6">
        <h2 className="text-sm font-semibold text-gray-400 mb-4">Add Category</h2>
        <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Men's Tracksuits"
            className="flex-1 bg-[#0A0A0A] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none"
          />
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="bg-[#0A0A0A] border border-[#2a2a2a] rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none"
          >
            {GENDERS.map((g) => <option key={g}>{g}</option>)}
          </select>
          <button
            type="submit"
            disabled={saving}
            className="btn-gold px-5 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-60"
          >
            {saving ? "Adding…" : "Add"}
          </button>
        </form>
        {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
      </div>

      {/* List grouped by gender */}
      {loading ? (
        <div className="text-center text-gray-600 text-sm py-10">Loading…</div>
      ) : (
        <div className="space-y-4">
          {grouped.map(({ gender: g, items }) => (
            <div key={g} className="bg-[#111111] border border-[#1F1F1F] rounded-2xl overflow-hidden">
              <div className="px-5 py-3 border-b border-[#1F1F1F] flex items-center justify-between">
                <h2 className="text-sm font-semibold text-white">{g}</h2>
                <span className="text-gray-600 text-xs">{items.length}</span>
              </div>
              <div className="divide-y divide-[#1A1A1A]">
                {items.map((cat) => (
                  <div key={cat.id} className="flex items-center justify-between px-5 py-3">
                    <p className="text-white text-sm">{cat.name}</p>
                    <button
                      onClick={() => handleDelete(cat.id)}
                      className="text-gray-600 hover:text-red-400 text-xs transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {grouped.length === 0 && (
            <div className="text-center text-gray-600 text-sm py-10">No categories yet.</div>
          )}
        </div>
      )}
    </div>
  );
}
