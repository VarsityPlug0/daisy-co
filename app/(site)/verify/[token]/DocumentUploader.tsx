"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const GOLD = "#C8B993";
const MAX_BYTES = 10 * 1024 * 1024;
const ACCEPT = "image/jpeg,image/png,application/pdf";
const ALLOWED = ["image/jpeg", "image/png", "application/pdf"];

type DocType =
  | "id_card_front" | "id_card_back" | "id_book" | "passport"
  | "proof_of_address" | "payslip";

type Info = {
  ref: string;
  name: string;
  product_name: string;
  status: string;
  documents_status: string;
  uploaded: DocType[];
};

type IdMethod = "id_card" | "id_book" | "passport";

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const res = String(reader.result || "");
      resolve(res.includes(",") ? res.split(",")[1] : res);
    };
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.readAsDataURL(file);
  });
}

export default function DocumentUploader({ token }: { token: string }) {
  const [info, setInfo] = useState<Info | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [idMethod, setIdMethod] = useState<IdMethod>("id_card");
  const [busy, setBusy] = useState<DocType | null>(null);
  const [errors, setErrors] = useState<Partial<Record<DocType, string>>>({});

  const load = useCallback(async () => {
    try {
      const r = await fetch(`/api/installments/verify/${token}`);
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        setLoadError(j.error || "This link is invalid or has expired.");
        return;
      }
      setInfo(await r.json());
    } catch {
      setLoadError("Could not load your application. Please check your connection.");
    }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const uploaded = new Set(info?.uploaded ?? []);

  async function handleFile(docType: DocType, file: File | null) {
    if (!file) return;
    setErrors((e) => ({ ...e, [docType]: undefined }));
    if (!ALLOWED.includes(file.type)) {
      setErrors((e) => ({ ...e, [docType]: "Only JPG, PNG or PDF" }));
      return;
    }
    if (file.size > MAX_BYTES) {
      setErrors((e) => ({ ...e, [docType]: "File too large (max 10MB)" }));
      return;
    }
    setBusy(docType);
    try {
      const base64 = await fileToBase64(file);
      const r = await fetch(`/api/installments/verify/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ doc_type: docType, file: base64, mimeType: file.type, filename: file.name }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) { setErrors((e) => ({ ...e, [docType]: j.error || "Upload failed" })); return; }
      setInfo((prev) => (prev ? { ...prev, uploaded: j.uploaded as DocType[] } : prev));
    } catch {
      setErrors((e) => ({ ...e, [docType]: "Upload failed, please try again" }));
    } finally {
      setBusy(null);
    }
  }

  const idComplete =
    (idMethod === "id_card" && uploaded.has("id_card_front") && uploaded.has("id_card_back")) ||
    (idMethod === "id_book" && uploaded.has("id_book")) ||
    (idMethod === "passport" && uploaded.has("passport"));

  if (loadError) {
    return (
      <div style={box}>
        <Brand />
        <p style={{ color: "#f87171", marginTop: 16 }}>{loadError}</p>
        <p style={{ color: "#9ca3af", fontSize: 13 }}>If you think this is a mistake, please contact us on WhatsApp and we&apos;ll send you a fresh link.</p>
      </div>
    );
  }
  if (!info) {
    return (<div style={box}><Brand /><p style={{ color: "#9ca3af", marginTop: 16 }}>Loading…</p></div>);
  }

  return (
    <div style={box}>
      <Brand />
      <h1 style={{ fontSize: 22, fontWeight: 800, color: "#fff", margin: "12px 0 4px" }}>Upload your documents</h1>
      <p style={{ color: "#9ca3af", margin: "0 0 4px" }}>
        Hi {info.name?.split(" ")[0] || "there"}, this secures your application for the{" "}
        <strong style={{ color: "#fff" }}>{info.product_name}</strong>.
      </p>
      <p style={{ color: "#6b7280", fontSize: 12, margin: "0 0 20px" }}>Reference: {info.ref}</p>

      {idComplete && (
        <div style={{ background: "#0f2a17", border: "1px solid #1f5133", borderRadius: 10, padding: "14px 16px", marginBottom: 20 }}>
          <p style={{ color: "#6ee7a8", margin: 0, fontWeight: 700 }}>Documents received successfully.</p>
          <p style={{ color: "#9ca3af", margin: "4px 0 0", fontSize: 13 }}>Your application is under review. You can still add the optional documents below.</p>
        </div>
      )}

      <p style={{ color: GOLD, fontWeight: 700, margin: "0 0 8px" }}>Identity (required)</p>
      <p style={{ color: "#9ca3af", fontSize: 13, margin: "0 0 12px" }}>Choose one:</p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
        {([["id_card", "SA ID card"], ["id_book", "Green ID book"], ["passport", "Passport"]] as [IdMethod, string][]).map(([m, label]) => (
          <button key={m} onClick={() => setIdMethod(m)} style={{
            padding: "8px 14px", borderRadius: 8, cursor: "pointer", fontWeight: 600,
            border: idMethod === m ? `1px solid ${GOLD}` : "1px solid #333",
            background: idMethod === m ? GOLD : "transparent",
            color: idMethod === m ? "#111" : "#e5e7eb",
          }}>{label}</button>
        ))}
      </div>

      {idMethod === "id_card" && (<>
        <Slot label="ID card — front" docType="id_card_front" {...{ uploaded, busy, errors, handleFile }} />
        <Slot label="ID card — back" docType="id_card_back" {...{ uploaded, busy, errors, handleFile }} />
      </>)}
      {idMethod === "id_book" && (
        <Slot label="Green ID book" docType="id_book" {...{ uploaded, busy, errors, handleFile }} />
      )}
      {idMethod === "passport" && (
        <Slot label="Passport" docType="passport" {...{ uploaded, busy, errors, handleFile }} />
      )}

      <p style={{ color: GOLD, fontWeight: 700, margin: "24px 0 8px" }}>Optional (helps approval)</p>
      <Slot label="Proof of address" docType="proof_of_address" {...{ uploaded, busy, errors, handleFile }} />
      <Slot label="Payslip / proof of income" docType="payslip" {...{ uploaded, busy, errors, handleFile }} />

      <p style={{ color: "#6b7280", fontSize: 12, marginTop: 20 }}>Accepted: JPG, PNG or PDF · Max 10MB each · Your documents are stored securely and seen only by our review team.</p>
    </div>
  );
}

function Slot(props: {
  label: string;
  docType: DocType;
  uploaded: Set<DocType>;
  busy: DocType | null;
  errors: Partial<Record<DocType, string>>;
  handleFile: (d: DocType, f: File | null) => void;
}) {
  const { label, docType, uploaded, busy, errors, handleFile } = props;
  const ref = useRef<HTMLInputElement>(null);
  const done = uploaded.has(docType);
  const isBusy = busy === docType;
  const err = errors[docType];
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      border: done ? "1px solid #1f5133" : "1px solid #2a2a2a", borderRadius: 10,
      padding: "12px 14px", marginBottom: 10, background: "#111",
    }}>
      <div style={{ minWidth: 0 }}>
        <p style={{ margin: 0, color: "#e5e7eb", fontWeight: 600 }}>{label}</p>
        {done && <p style={{ margin: "2px 0 0", color: "#6ee7a8", fontSize: 12 }}>✓ Uploaded</p>}
        {err && <p style={{ margin: "2px 0 0", color: "#f87171", fontSize: 12 }}>{err}</p>}
      </div>
      <input ref={ref} type="file" accept={ACCEPT} style={{ display: "none" }}
        onChange={(e) => handleFile(docType, e.target.files?.[0] ?? null)} />
      <button onClick={() => ref.current?.click()} disabled={isBusy} style={{
        whiteSpace: "nowrap", padding: "8px 14px", borderRadius: 8, cursor: isBusy ? "default" : "pointer",
        border: "none", fontWeight: 700,
        background: done ? "transparent" : GOLD, color: done ? GOLD : "#111",
        opacity: isBusy ? 0.6 : 1,
      }}>{isBusy ? "Uploading…" : done ? "Replace" : "Upload"}</button>
    </div>
  );
}

function Brand() {
  return <p style={{ color: GOLD, fontWeight: 800, letterSpacing: 1, margin: 0 }}>BEVANSSONS</p>;
}

const box: React.CSSProperties = {
  maxWidth: 560, margin: "0 auto", background: "#0f0f0f",
  border: "1px solid #222", borderRadius: 14, padding: "24px 22px",
};
