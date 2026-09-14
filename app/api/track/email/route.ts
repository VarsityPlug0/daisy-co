import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

// 1×1 transparent GIF
const PIXEL = Buffer.from(
  "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
  "base64"
);

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id    = searchParams.get("id");
  const event = searchParams.get("e");   // "open" | "click"
  const url   = searchParams.get("url"); // encoded redirect target for clicks

  if (id && event) {
    try {
      const db  = getDb();
      const now = new Date().toISOString();
      if (event === "open") {
        db.prepare(
          "UPDATE email_sends SET opened = 1, opened_at = ? WHERE id = ? AND opened = 0"
        ).run(now, id);
      } else if (event === "click") {
        db.prepare(
          "UPDATE email_sends SET clicked = 1, clicked_at = ? WHERE id = ? AND clicked = 0"
        ).run(now, id);
      }
    } catch { /* non-fatal */ }
  }

  if (event === "click" && url) {
    try {
      return NextResponse.redirect(decodeURIComponent(url));
    } catch {
      return NextResponse.redirect("https://gadgets.bevanssons.store");
    }
  }

  return new NextResponse(PIXEL, {
    headers: {
      "Content-Type": "image/gif",
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      "Pragma": "no-cache",
      "Expires": "0",
    },
  });
}
