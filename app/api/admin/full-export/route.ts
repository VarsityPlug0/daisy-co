import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { isAuthenticated } from "@/lib/auth";

// GET /api/admin/full-export — read-only, admin-session-gated recovery export
// of EVERY table in the database (schema + rows). Added 2026-09-19 so the
// off-platform nightly backup covers everything needed to rebuild this app's
// data — installments, per-product installment settings, email history,
// credit tables, outbox events — not only the record types that happen to
// have their own listing API (see /api/admin/historical-export for the
// earlier, narrower export). SELECT only; nothing here writes to any table.
//
// credit_otps is deliberately excluded: it holds short-lived one-time login
// codes that have no recovery value and should not be copied around.
const EXCLUDED_TABLES = new Set(["credit_otps"]);

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();

  // Table names come from sqlite_master (never from user input).
  const schema = db
    .prepare("SELECT type, name, tbl_name, sql FROM sqlite_master WHERE name NOT LIKE 'sqlite_%' AND sql IS NOT NULL ORDER BY type, name")
    .all() as { type: string; name: string; tbl_name: string; sql: string }[];

  const tableNames = schema
    .filter((s) => s.type === "table" && !EXCLUDED_TABLES.has(s.name))
    .map((s) => s.name);

  const tables: Record<string, unknown[]> = {};
  const counts: Record<string, number> = {};
  for (const name of tableNames) {
    const rows = db.prepare(`SELECT * FROM "${name}"`).all();
    tables[name] = rows;
    counts[name] = rows.length;
  }

  return NextResponse.json(
    { exportedAt: new Date().toISOString(), excluded: Array.from(EXCLUDED_TABLES), schema, counts, tables },
    { headers: { "Cache-Control": "no-store" } }
  );
}
