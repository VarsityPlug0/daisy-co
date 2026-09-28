import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadImage(buffer: Buffer, filename: string): Promise<string> {
  const folder = filename.startsWith("proof-") ? "daisy-co/proofs" : "daisy-co/products";
  const publicId = `${folder}/${Date.now()}-${filename.replace(/\.[^.]+$/, "").replace(/[^a-z0-9]/gi, "-")}`;
  const isPdf = filename.toLowerCase().endsWith(".pdf");

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        public_id: publicId,
        overwrite: true,
        resource_type: isPdf ? "raw" : "image",
        ...(isPdf ? {} : { transformation: [{ width: 1400, quality: "auto:good", fetch_format: "auto" }] }),
      },
      (error, result) => {
        if (error || !result) reject(error ?? new Error("Upload failed"));
        else resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
}

export function isConfigured(): boolean {
  return !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
}

// Upload an identity/supporting document for an installment application.
// Stored under a per-application folder with an unguessable public_id. Returns url + public_id
// (public_id lets the admin generate a signed/authenticated delivery URL later — Phase 4 hardening).
export async function uploadDocument(
  buffer: Buffer,
  ref: string,
  docType: string,
  filename: string
): Promise<{ url: string; public_id: string; resource_type: string }> {
  const isPdf = filename.toLowerCase().endsWith(".pdf");
  const safe = filename.replace(/\.[^.]+$/, "").replace(/[^a-z0-9]/gi, "-").slice(0, 40) || "doc";
  const publicId = `daisy-co/installment-docs/${ref}/${docType}-${Date.now()}-${safe}`;
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { public_id: publicId, overwrite: true, resource_type: isPdf ? "raw" : "image" },
      (error, result) => {
        if (error || !result) reject(error ?? new Error("Upload failed"));
        else resolve({ url: result.secure_url, public_id: result.public_id, resource_type: result.resource_type });
      }
    );
    stream.end(buffer);
  });
}
