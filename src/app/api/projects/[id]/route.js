import { NextResponse } from "next/server";
import sql, { initDb } from "@/lib/db";

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Project ID is required" }, { status: 400 });
    }

    await initDb();
    
    // Fetch project
    const projects = await sql`
      SELECT id, name, description, postgres_connection, organisation_id, created_at
      FROM projects 
      WHERE id = ${id} 
      LIMIT 1;
    `;

    if (projects.length === 0) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const project = projects[0];

    // Fetch endpoints under this project
    const endpoints = await sql`
      SELECT id, name, method, path, configuration, created_at
      FROM endpoints
      WHERE project_id = ${id}
      ORDER BY created_at DESC;
    `;

    return NextResponse.json({ project, endpoints }, { status: 200 });
  } catch (error) {
    console.error("API Get Project Detail Error:", error);
    return NextResponse.json({ error: "Failed to fetch project details" }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Project ID is required" }, { status: 400 });
    }

    const { name, description, postgresConnection } = await request.json();

    await initDb();

    // Check if project exists
    const check = await sql`
      SELECT id, organisation_id FROM projects WHERE id = ${id} LIMIT 1;
    `;
    if (check.length === 0) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const orgId = check[0].organisation_id;

    // Check duplicate name
    if (name) {
      const duplicate = await sql`
        SELECT id FROM projects 
        WHERE organisation_id = ${orgId} AND name = ${name.trim()} AND id != ${id} 
        LIMIT 1;
      `;
      if (duplicate.length > 0) {
        return NextResponse.json({ error: "Another project with this name already exists" }, { status: 409 });
      }
    }

    const current = await sql`
      SELECT name, description, postgres_connection FROM projects WHERE id = ${id} LIMIT 1;
    `;

    const finalName = name !== undefined ? name.trim() : current[0].name;
    const finalDesc = description !== undefined ? description : current[0].description;
    const finalConn = postgresConnection !== undefined ? postgresConnection : current[0].postgres_connection;

    const [updatedProject] = await sql`
      UPDATE projects
      SET name = ${finalName}, description = ${finalDesc}, postgres_connection = ${finalConn}
      WHERE id = ${id}
      RETURNING id, name, description, postgres_connection;
    `;

    return NextResponse.json({
      message: "Project updated successfully",
      project: updatedProject
    }, { status: 200 });

  } catch (error) {
    console.error("API Update Project Error:", error);
    return NextResponse.json({ error: "Failed to update project" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Project ID is required" }, { status: 400 });
    }

    await initDb();

    // Delete project (cascades to endpoints)
    await sql`
      DELETE FROM projects WHERE id = ${id};
    `;

    return NextResponse.json({ message: "Project deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("API Delete Project Error:", error);
    return NextResponse.json({ error: "Failed to delete project" }, { status: 500 });
  }
}
