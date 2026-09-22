// Regression guard: PayFast is the primary/only payment method presented in
// a normal payment-request email. Nothing customer-facing may name or
// display the old, deactivated TymeBank manual-EFT account (name, or its
// real account/branch numbers) as a payment method again.
//
// Why this exists: bankDetails.ts and mailer.ts once shipped with TymeBank
// as the ONLY configured bank and the default fallback for rejection and
// installment-deposit payment-request emails — real account details were
// rendered to customers even in templates whose own copy said "pay via
// PayFast". This is a static content check, not a full test suite (this
// project has neither jest nor a test script), but it is cheap, fast, and
// would have caught that regression directly.
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const FORBIDDEN = [/tymebank/i, /go\s*tyme/i, /51072673949/, /\b678910\b/];

const FILES_TO_SCAN = [
  "lib/bankDetails.ts",
  "lib/mailer.ts",
  "app/(site)/payment-options/page.tsx",
  "app/(site)/checkout/page.tsx",
  "components/Footer.tsx",
];

let failures = [];

for (const rel of FILES_TO_SCAN) {
  let content;
  try {
    content = readFileSync(join(root, rel), "utf-8");
  } catch {
    failures.push(`${rel}: could not read file`);
    continue;
  }
  for (const re of FORBIDDEN) {
    if (re.test(content)) {
      failures.push(`${rel}: matches forbidden pattern ${re} (a stale/manual TymeBank reference)`);
    }
  }
}

// bankDetails.ts's default/first entry must be PayFast, since getBankById()
// and getRotatingBank() both fall back to BANKS[0] when nothing else is
// specified.
const bankDetailsSrc = readFileSync(join(root, "lib/bankDetails.ts"), "utf-8");
const firstIdMatch = bankDetailsSrc.match(/BANKS[^=]*=\s*\[\s*\{\s*id:\s*"([^"]+)"/);
if (!firstIdMatch || firstIdMatch[1] !== "payfast") {
  failures.push(`lib/bankDetails.ts: BANKS[0].id must be "payfast" (found ${firstIdMatch ? `"${firstIdMatch[1]}"` : "no match"})`);
}

// mailer.ts's rejection-email bank fallback must resolve to PayFast, not an
// unqualified getBankById() call that silently trusts BANKS[0] alone.
const mailerSrc = readFileSync(join(root, "lib/mailer.ts"), "utf-8");
if (!/getBankById\("payfast"\)/.test(mailerSrc)) {
  failures.push(`lib/mailer.ts: sendRejectionEmail's bank fallback must explicitly call getBankById("payfast")`);
}

if (failures.length) {
  console.error("✗ Payment template regression check FAILED:\n");
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}

console.log(`✓ Payment template regression check passed (${FILES_TO_SCAN.length} files scanned, no TymeBank references, PayFast is the default).`);
