import { timingSafeEqual } from "crypto";
import type { NextRequest } from "next/server";

// Auth for the read-only Gadgets -> Bevans OS integration API
// (app/api/integration/v1/**). Separate, narrower-scoped secret from
// GADGETS_EVENTS_SECRET (which signs the outbound outbox push in the other
// direction) and from ADMIN_SECRET/ADMIN_PASSWORD (interactive admin
// sessions) — this one exists only so a server-to-server reader (Bevans
// Admin, later) can authenticate without logging in as an admin user.
const SECRET = process.env.GADGETS_INTEGRATION_SECRET;

export function isIntegrationAuthenticated(req: NextRequest): boolean {
  if (!SECRET) return false; // unset in this environment -> fail closed, not open

  const header = req.headers.get("x-integration-secret") ?? "";
  const a = Buffer.from(header);
  const b = Buffer.from(SECRET);
  if (a.length !== b.length) return false;

  try {
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export interface Pagination {
  page: number;
  limit: number;
}

const MAX_LIMIT = 100;
const DEFAULT_LIMIT = 25;

// Returns null if the params are present but invalid (caller should 400).
export function parsePagination(req: NextRequest): Pagination | null {
  const { searchParams } = new URL(req.url);
  const pageRaw = searchParams.get("page");
  const limitRaw = searchParams.get("limit");

  let page = 1;
  if (pageRaw !== null) {
    page = Number(pageRaw);
    if (!Number.isInteger(page) || page < 1) return null;
  }

  let limit = DEFAULT_LIMIT;
  if (limitRaw !== null) {
    limit = Number(limitRaw);
    if (!Number.isInteger(limit) || limit < 1 || limit > MAX_LIMIT) return null;
  }

  return { page, limit };
}
