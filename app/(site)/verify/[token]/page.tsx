import type { Metadata } from "next";
import DocumentUploader from "./DocumentUploader";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Upload your documents — Bevanssons",
  robots: { index: false, follow: false },
};

export default async function VerifyPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return (
    <main style={{ minHeight: "100vh", background: "#0b0b0b", color: "#e5e7eb", padding: "32px 16px" }}>
      <DocumentUploader token={token} />
    </main>
  );
}
