import crypto from "crypto";
import type { Order } from "./orders";

const isSandbox = process.env.PAYFAST_SANDBOX !== "false";
const PAYFAST_URL = isSandbox
  ? "https://sandbox.payfast.co.za/eng/process"
  : "https://www.payfast.co.za/eng/process";

function getMerchantConfig() {
  const merchantId = process.env.PAYFAST_MERCHANT_ID;
  const merchantKey = process.env.PAYFAST_MERCHANT_KEY;
  if (!merchantId || !merchantKey) throw new Error("PayFast credentials not configured");
  return { merchantId, merchantKey };
}

/**
 * MD5 signature for a PayFast payment. Parameter order matters.
 *
 * excludeEmpty must differ between the two call sites — ported from a real
 * production bug found in the Bevans Sons integration this was copied
 * from: outgoing payments (buildPaymentData) must exclude blank optional
 * fields per PayFast's spec, but an incoming ITN's signature (verifyITN)
 * covers every field PayFast actually sent, blank or not. Using the same
 * rule for both meant every real ITN silently failed signature checks —
 * PayFast was completing payments correctly, the app just never found out.
 */
function generateSignature(
  params: Record<string, string | number | undefined | null>,
  passphrase: string | undefined,
  { excludeEmpty }: { excludeEmpty: boolean }
): string {
  const queryString = Object.entries(params)
    .filter(([, v]) => v !== null && v !== undefined && (!excludeEmpty || v !== ""))
    .map(([k, v]) => `${k}=${encodeURIComponent(String(v)).replace(/%20/g, "+")}`)
    .join("&");

  const stringToHash = passphrase
    ? `${queryString}&passphrase=${encodeURIComponent(passphrase).replace(/%20/g, "+")}`
    : queryString;

  return crypto.createHash("md5").update(stringToHash).digest("hex");
}

export interface PayfastPaymentData {
  url: string;
  fields: Record<string, string>;
}

/** Build the PayFast payment data for an order. Client auto-submits fields to url. */
export function buildPaymentData(params: {
  order: Order;
  returnUrl: string;
  cancelUrl: string;
  notifyUrl: string;
}): PayfastPaymentData {
  const { order, returnUrl, cancelUrl, notifyUrl } = params;
  const { merchantId, merchantKey } = getMerchantConfig();
  const passphrase = process.env.PAYFAST_PASSPHRASE || "";

  const [nameFirst, ...rest] = order.name.trim().split(/\s+/);
  const nameLast = rest.join(" ") || nameFirst;

  const fields = {
    merchant_id: merchantId,
    merchant_key: merchantKey,
    return_url: returnUrl,
    cancel_url: cancelUrl,
    notify_url: notifyUrl,
    name_first: nameFirst,
    name_last: nameLast,
    email_address: order.email,
    m_payment_id: order.id,
    amount: order.total.toFixed(2),
    item_name: `Order ${order.ref}`,
    item_description: `Daisy Gadgets Co — ${order.ref}`,
    // Shared merchant account with Bevans Sons — this is what lets you tell
    // the two businesses' transactions apart in the PayFast dashboard (and
    // in the ITN webhook body) despite both depositing into the same
    // account. Bevans' own integration sets the matching "Bevans Sons"
    // value for its side — see payfastService.js on the VPS.
    custom_str1: "Daisy Gadgets Co",
  };

  const signature = generateSignature(fields, passphrase || undefined, { excludeEmpty: true });

  return { url: PAYFAST_URL, fields: { ...fields, signature } };
}

/** Verify an incoming PayFast ITN. Returns { valid, reason? }. */
export async function verifyITN(body: Record<string, string>): Promise<{ valid: boolean; reason?: string }> {
  const passphrase = process.env.PAYFAST_PASSPHRASE || "";

  const { signature, ...rest } = body;
  const computedSig = generateSignature(rest, passphrase || undefined, { excludeEmpty: false });
  if (computedSig !== signature) return { valid: false, reason: "Invalid signature" };

  const validationUrl = isSandbox
    ? "https://sandbox.payfast.co.za/eng/query/validate"
    : "https://www.payfast.co.za/eng/query/validate";

  try {
    const queryString = Object.entries(body)
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join("&");

    const response = await fetch(validationUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: queryString,
    });
    const text = await response.text();
    if (!text.includes("VALID")) return { valid: false, reason: "PayFast server validation failed" };
  } catch {
    return { valid: false, reason: "Could not reach PayFast validation server" };
  }

  return { valid: true };
}

export { PAYFAST_URL };
