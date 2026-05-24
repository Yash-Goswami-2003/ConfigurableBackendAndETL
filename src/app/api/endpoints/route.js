import { NextResponse } from "next/server";
import sql, { initDb } from "@/lib/db";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get("orgId");

    if (!orgId) {
      return NextResponse.json({ error: "Organization ID is required" }, { status: 400 });
    }

    await initDb();
    const endpoints = await sql`
      SELECT id, name, method, path, configuration, created_at 
      FROM endpoints 
      WHERE organisation_id = ${orgId} 
      ORDER BY created_at DESC;
    `;

    return NextResponse.json({ endpoints }, { status: 200 });
  } catch (error) {
    console.error("API Get Endpoints Error:", error);
    return NextResponse.json({ error: "Failed to fetch endpoints" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { name, method, path, configuration, orgId } = await request.json();

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Endpoint name is required" }, { status: 400 });
    }
    if (!path || !path.trim()) {
      return NextResponse.json({ error: "Endpoint path is required" }, { status: 400 });
    }
    if (!orgId) {
      return NextResponse.json({ error: "Organization ID is required" }, { status: 400 });
    }

    await initDb();

    // Check if path already exists for this org
    const existingPaths = await sql`
      SELECT id FROM endpoints WHERE organisation_id = ${orgId} AND path = ${path.trim()} LIMIT 1;
    `;
    if (existingPaths.length > 0) {
      return NextResponse.json({ error: "An endpoint with this path already exists in your organization" }, { status: 409 });
    }

    const [newEndpoint] = await sql`
      INSERT INTO endpoints (name, method, path, configuration, organisation_id)
      VALUES (${name.trim()}, ${method || "GET"}, ${path.trim()}, ${configuration || {}}, ${orgId})
      RETURNING id, name, method, path, created_at;
    `;

    return NextResponse.json({
      message: "Endpoint configured successfully",
      endpoint: newEndpoint
    }, { status: 201 });

  } catch (error) {
    console.error("API Create Endpoint Error:", error);
    return NextResponse.json({ error: "Failed to create endpoint" }, { status: 500 });
  }
}
