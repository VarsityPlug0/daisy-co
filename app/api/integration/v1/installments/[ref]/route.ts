import { NextRequest, NextResponse } from "next/server";
import { isIntegrationAuthenticated } from "@/lib/integrationAuth";
import { getIntegrationApplicationView, INSTALLMENT_REF_RE } from "@/lib/installments";

// GET /api/integration/v1/installments/{ref} — read-only, server-to-server (Bevans owner
// command preview and post-write verification). One application by its IA- reference, with its
// status history, other applications on the same phone, possibly related orders and
// payment/dispatch signals. Never returns ID number, address, email, full phone or notes.
export async function GET(req: NextRequest, { params }: { params: Promise<{ ref: string }> }) {
  const start = Date.now();
  const log = (status: number) =>
    console.log(`[integration-api] GET /installments/{ref} status=${status} ${Date.now() - start}ms`);

  if (!isIntegrationAuthenticated(req)) {
    log(401);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { ref } = await params;
  if (!INSTALLMENT_REF_RE.test(ref)) {
    log(400);
    return NextResponse.json({ error: "Invalid reference" }, { status: 400 });
  }

  const view = getIntegrationApplicationView(ref);
  if (!view) {
    log(404);
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  log(200);
  return NextResponse.json({ sourceSystem: "GADGETS", ...view });
}
