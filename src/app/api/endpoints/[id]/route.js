import { NextResponse } from "next/server";
import sql, { initDb } from "@/lib/db";

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Endpoint ID is required" }, { status: 400 });
    }

    await initDb();
    const results = await sql`
      SELECT id, name, method, path, configuration, organisation_id, created_at 
      FROM endpoints 
      WHERE id = ${id} 
      LIMIT 1;
    `;

    if (results.length === 0) {
      return NextResponse.json({ error: "Endpoint not found" }, { status: 404 });
    }

    return NextResponse.json({ endpoint: results[0] }, { status: 200 });
  } catch (error) {
    console.error("API Get Single Endpoint Error:", error);
    return NextResponse.json({ error: "Failed to fetch endpoint details" }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Endpoint ID is required" }, { status: 400 });
    }

    const { name, method, path, configuration } = await request.json();

    await initDb();

    // Check if endpoint exists
    const check = await sql`
      SELECT id, organisation_id FROM endpoints WHERE id = ${id} LIMIT 1;
    `;
    if (check.length === 0) {
      return NextResponse.json({ error: "Endpoint not found" }, { status: 404 });
    }

    const orgId = check[0].organisation_id;

    // Check for duplicate path if path is being updated
    if (path) {
      const duplicate = await sql`
        SELECT id FROM endpoints 
        WHERE organisation_id = ${orgId} AND path = ${path.trim()} AND id != ${id} 
        LIMIT 1;
      `;
      if (duplicate.length > 0) {
        return NextResponse.json({ error: "Another endpoint with this path already exists" }, { status: 409 });
      }
    }

    // Build fields dynamically
    const current = await sql`
      SELECT name, method, path, configuration FROM endpoints WHERE id = ${id} LIMIT 1;
    `;
    
    const finalName = name !== undefined ? name.trim() : current[0].name;
    const finalMethod = method !== undefined ? method : current[0].method;
    const finalPath = path !== undefined ? path.trim() : current[0].path;
    const finalConfig = configuration !== undefined ? configuration : current[0].configuration;

    const [updatedEndpoint] = await sql`
      UPDATE endpoints
      SET name = ${finalName}, method = ${finalMethod}, path = ${finalPath}, configuration = ${finalConfig}
      WHERE id = ${id}
      RETURNING id, name, method, path, configuration;
    `;

    return NextResponse.json({
      message: "Endpoint configuration updated successfully",
      endpoint: updatedEndpoint
    }, { status: 200 });

  } catch (error) {
    console.error("API Update Endpoint Error:", error);
    return NextResponse.json({ error: "Failed to update endpoint configuration" }, { status: 500 });
  }
}
