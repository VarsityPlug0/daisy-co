import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { isIntegrationAuthenticated } from "@/lib/integrationAuth";

// GET /api/integration/v1/products/:id — read-only, single product by its
// real Gadgets id. No id normalization/renaming.
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isIntegrationAuthenticated(req)) {
    console.log("[integration-api] GET /products/:id status=401");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const row = getDb()
    .prepare("SELECT id, name, price, originalPrice, category, description, imageUrl, inStock, featured, createdAt, updatedAt FROM products WHERE id = ?")
    .get(id) as Record<string, unknown> | undefined;

  if (!row) {
    console.log("[integration-api] GET /products/:id status=404");
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  console.log("[integration-api] GET /products/:id status=200");
  return NextResponse.json({
    sourceSystem: "GADGETS",
    data: { ...row, inStock: row.inStock === 1, featured: row.featured === 1 },
  });
}
