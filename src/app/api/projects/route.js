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
    const projects = await sql`
      SELECT id, name, description, postgres_connection, created_at 
      FROM projects 
      WHERE organisation_id = ${orgId} 
      ORDER BY created_at DESC;
    `;

    return NextResponse.json({ projects }, { status: 200 });
  } catch (error) {
    console.error("API Get Projects Error:", error);
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { name, description, postgresConnection, orgId } = await request.json();

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Project name is required" }, { status: 400 });
    }
    if (!orgId) {
      return NextResponse.json({ error: "Organization ID is required" }, { status: 400 });
    }

    await initDb();

    // Check if duplicate project name exists in org
    const duplicate = await sql`
      SELECT id FROM projects WHERE organisation_id = ${orgId} AND name = ${name.trim()} LIMIT 1;
    `;
    if (duplicate.length > 0) {
      return NextResponse.json({ error: "A project with this name already exists" }, { status: 409 });
    }

    const [newProject] = await sql`
      INSERT INTO projects (name, description, postgres_connection, organisation_id)
      VALUES (${name.trim()}, ${description || ""}, ${postgresConnection || ""}, ${orgId})
      RETURNING id, name, description, postgres_connection, created_at;
    `;

    return NextResponse.json({
      message: "Project created successfully",
      project: newProject
    }, { status: 201 });

  } catch (error) {
    console.error("API Create Project Error:", error);
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }
}
