"use client";
import { useState } from "react";
import { Upload, Link as LinkIcon, Check, X, RefreshCw } from "lucide-react";

interface SiteImage {
  key: string;
  url: string;
  label: string;
  section: string;
}

export default function ImageManager({ images }: { images: SiteImage[] }) {
  const [data, setData] = useState<SiteImage[]>(images);
  const [editing, setEditing] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState("");
  const [uploading, setUploading] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  const sections = [...new Set(data.map(i => i.section))];

  async function save(key: string, url: string) {
    setSaving(key);
    const res = await fetch("/api/admin/site-images", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, url }),
    });
    if (res.ok) {
      setData(d => d.map(i => i.key === key ? { ...i, url } : i));
      setSaved(key);
      setEditing(null);
      setTimeout(() => setSaved(null), 2000);
    }
    setSaving(null);
  }

  async function handleUpload(key: string, file: File) {
    setUploading(key);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      let binary = "";
      for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
      const base64 = btoa(binary);
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file: base64, mimeType: file.type, filename: file.name }),
      });
      const json = await res.json();
      if (res.ok && json.url) await save(key, json.url);
    } catch {
      // ignore
    }
    setUploading(null);
  }

  function startEdit(img: SiteImage) {
    setEditing(img.key);
    setUrlInput(img.url);
  }

  return (
    <div className="space-y-10">
      {sections.map(section => (
        <div key={section}>
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 pb-2 border-b border-[#2A2A2A]">
            {section}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {data.filter(i => i.section === section).map(img => (
              <div key={img.key} className="bg-[#1D1D1D] border border-[#2A2A2A] rounded-2xl overflow-hidden group">
                {/* Image preview */}
                <div className="relative h-36 bg-[#111111]">
                  {img.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-700 text-xs">No image</div>
                  )}
                  {saved === img.key && (
                    <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                      <Check size={28} className="text-green-400" />
                    </div>
                  )}
                  {(uploading === img.key || saving === img.key) && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <RefreshCw size={20} className="text-[#C8B993] animate-spin" />
                    </div>
                  )}
                </div>

                {/* Info & actions */}
                <div className="p-3">
                  <p className="text-white text-xs font-medium leading-snug mb-0.5 truncate">{img.label}</p>
                  <p className="text-gray-600 text-[10px] font-mono mb-3 truncate">{img.key}</p>

                  {editing === img.key ? (
                    <div className="space-y-2">
                      <input
                        value={urlInput}
                        onChange={e => setUrlInput(e.target.value)}
                        placeholder="https://..."
                        className="w-full bg-[#111111] border border-[#2a2a2a] rounded-lg px-2.5 py-1.5 text-white text-xs placeholder-gray-600 focus:outline-none focus:border-[#C8B993]/50"
                        onKeyDown={e => e.key === "Enter" && save(img.key, urlInput)}
                        autoFocus
                      />
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => save(img.key, urlInput)}
                          disabled={saving === img.key}
                          className="flex-1 py-1.5 rounded-lg text-xs font-semibold bg-[#C8B993] text-black disabled:opacity-50"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditing(null)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-500 hover:text-white border border-[#2a2a2a]"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-1.5">
                      {/* Upload button */}
                      <label className="flex-1 cursor-pointer">
                        <div className="flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-medium text-gray-400 hover:text-white border border-[#2a2a2a] hover:border-[#C8B993]/40 transition-colors">
                          <Upload size={11} /> Upload
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={e => {
                            const f = e.target.files?.[0];
                            if (f) handleUpload(img.key, f);
                            e.target.value = "";
                          }}
                        />
                      </label>
                      {/* URL button */}
                      <button
                        onClick={() => startEdit(img)}
                        className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-medium text-gray-400 hover:text-white border border-[#2a2a2a] hover:border-[#C8B993]/40 transition-colors"
                      >
                        <LinkIcon size={11} /> URL
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
