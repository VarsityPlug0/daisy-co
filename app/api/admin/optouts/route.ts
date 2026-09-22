import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { listOptOuts, recordOptOut } from "@/lib/optout";

// Admin-gated. GET lists opted-out addresses; POST records an opt-out (for a
// customer who asks to stop by WhatsApp/phone/reply instead of using the link).
// There is deliberately no DELETE: re-subscribing must be the customer's own action.
export async function GET() {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const optouts = listOptOuts();
  return NextResponse.json({ count: optouts.length, optouts });
}

export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { email } = await req.json().catch(() => ({}));
  if (typeof email !== "string" || email.length > 200 || !email.includes("@")) {
    return NextResponse.json({ error: "Valid email required" }, { status: 400 });
  }
  recordOptOut(email, "admin");
  return NextResponse.json({ ok: true });
}
