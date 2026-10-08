import { NextRequest, NextResponse } from "next/server";
import { verifyIntegrationWrite } from "@/lib/integrationAuth";
import { changeStatusViaIntegration, INSTALLMENT_REF_RE, INSTALLMENT_STATUSES, type InstallmentStatus } from "@/lib/installments";

// POST /api/integration/v1/installments/{ref}/status — the ONLY integration write. Signed with
// the write-only secret (lib/integrationAuth.ts verifyIntegrationWrite), used by the Bevans
// owner WhatsApp command after the owner confirmed a preview. Changes one application's status
// through an allowed transition, atomically, with a status-history entry and idempotency.
// Never notifies the customer: notifyCustomer must be false.
const ACTOR_RE = /^[A-Za-z0-9:_.@-]{3,64}$/;
const IDEMPOTENCY_KEY_RE = /^[A-Za-z0-9_-]{8,100}$/;

export async function POST(req: NextRequest, { params }: { params: Promise<{ ref: string }> }) {
  const start = Date.now();
  const log = (status: number, detail = "") =>
    console.log(`[integration-api] POST /installments/{ref}/status status=${status}${detail ? ` ${detail}` : ""} ${Date.now() - start}ms`);

  const rawBody = await req.text();
  const auth = verifyIntegrationWrite(req.headers, rawBody);
  if (!auth.ok) {
    log(401, auth.error);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { ref } = await params;
  if (!INSTALLMENT_REF_RE.test(ref)) {
    log(400, "bad ref");
    return NextResponse.json({ error: "Invalid reference" }, { status: 400 });
  }

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(rawBody);
  } catch {
    log(400, "bad json");
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { expectedStatus, toStatus, reason, actor, idempotencyKey, notifyCustomer } = body;
  const statusOk = (s: unknown): s is InstallmentStatus => typeof s === "string" && INSTALLMENT_STATUSES.includes(s as InstallmentStatus);
  const problems: string[] = [];
  if (!statusOk(expectedStatus)) problems.push("expectedStatus");
  if (!statusOk(toStatus)) problems.push("toStatus");
  if (typeof reason !== "string" || reason.trim().length < 3 || reason.length > 500) problems.push("reason");
  if (typeof actor !== "string" || !ACTOR_RE.test(actor)) problems.push("actor");
  if (typeof idempotencyKey !== "string" || !IDEMPOTENCY_KEY_RE.test(idempotencyKey)) problems.push("idempotencyKey");
  if (notifyCustomer !== false) problems.push("notifyCustomer (must be false)");
  if (problems.length) {
    log(400, `invalid: ${problems.join(",")}`);
    return NextResponse.json({ error: `Invalid or missing: ${problems.join(", ")}` }, { status: 400 });
  }

  const result = changeStatusViaIntegration({
    ref,
    expectedStatus: expectedStatus as InstallmentStatus,
    toStatus: toStatus as InstallmentStatus,
    reason: (reason as string).trim(),
    actor: actor as string,
    idempotencyKey: idempotencyKey as string,
  });

  if (!result.ok) {
    log(result.httpStatus, result.code);
    return NextResponse.json({ sourceSystem: "GADGETS", ...result }, { status: result.httpStatus });
  }
  log(200, result.replayed ? "replayed" : `${result.fromStatus}->${result.toStatus}`);
  return NextResponse.json({ sourceSystem: "GADGETS", ...result });
}
