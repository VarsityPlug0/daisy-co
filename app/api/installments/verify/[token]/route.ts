import { NextRequest, NextResponse } from "next/server";
import {
  getApplicationByToken,
  addDocument,
  listDocuments,
  markDocumentsReceived,
} from "@/lib/installments";
import { uploadDocument, isConfigured } from "@/lib/cloudinary";
import { writeFileSync, mkdirSync, existsSync } from "fs";
import path from "path";

export const runtime = "nodejs";

const DOC_TYPES = [
  "id_card_front",
  "id_card_back",
  "id_book",
  "passport",
  "proof_of_address",
  "payslip",
] as const;
const ALLOWED_MIME = ["image/jpeg", "image/png", "application/pdf"];
const MAX_BYTES = 10 * 1024 * 1024;

// Customer fetches their application state + which documents are already uploaded.
export async function GET(_req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const app = getApplicationByToken(token);
  if (!app) return NextResponse.json({ error: "This link is invalid or has expired." }, { status: 404 });
  const docs = listDocuments(app.ref);
  return NextResponse.json({
    ref: app.ref,
    name: app.name,
    product_name: app.product_name,
    status: app.status,
    documents_status: app.documents_status ?? "awaiting",
    uploaded: docs.map((d) => d.doc_type),
  });
}

// Customer uploads one document (JSON base64 payload, matching the existing proof-upload convention).
export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const app = getApplicationByToken(token);
  if (!app) return NextResponse.json({ error: "This link is invalid or has expired." }, { status: 404 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  const { doc_type, file: base64, mimeType, filename } = body as {
    doc_type?: string; file?: string; mimeType?: string; filename?: string;
  };

  if (!doc_type || !DOC_TYPES.includes(doc_type as (typeof DOC_TYPES)[number]))
    return NextResponse.json({ error: "Invalid document type" }, { status: 400 });
  if (!base64 || !mimeType || !filename)
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  if (!ALLOWED_MIME.includes(mimeType))
    return NextResponse.json({ error: "Only JPG, PNG or PDF files are allowed" }, { status: 400 });

  const buffer = Buffer.from(base64, "base64");
  if (buffer.length === 0) return NextResponse.json({ error: "Empty file" }, { status: 400 });
  if (buffer.length > MAX_BYTES)
    return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 });

  let url: string;
  let public_id: string | null = null;
  try {
    if (isConfigured()) {
      const up = await uploadDocument(buffer, app.ref, doc_type, filename);
      url = up.url;
      public_id = up.public_id;
    } else {
      const dir = path.join(process.cwd(), "public", "uploads", "docs", app.ref);
      if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
      const ext = (filename.split(".").pop() || "bin").replace(/[^a-z0-9]/gi, "");
      const name = `${doc_type}-${Date.now()}.${ext}`;
      writeFileSync(path.join(dir, name), buffer);
      url = `/uploads/docs/${app.ref}/${name}`;
    }
  } catch {
    return NextResponse.json({ error: "Upload failed, please try again" }, { status: 502 });
  }

  addDocument({
    ref: app.ref,
    doc_type: doc_type as (typeof DOC_TYPES)[number],
    url,
    public_id,
    filename,
    mime: mimeType,
    size_bytes: buffer.length,
    uploaded_by: "customer",
  });
  markDocumentsReceived(app.ref, `Uploaded ${doc_type}`);

  const uploaded = listDocuments(app.ref).map((d) => d.doc_type);
  return NextResponse.json({ ok: true, doc_type, uploaded });
}
