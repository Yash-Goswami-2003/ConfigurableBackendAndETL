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
    
    // Fetch posts and join users to get the author's name
    const posts = await sql`
      SELECT p.id, p.title, p.content, p.created_at, u.name as author_name 
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.organisation_id = ${orgId}
      ORDER BY p.created_at DESC;
    `;

    return NextResponse.json({ posts }, { status: 200 });
  } catch (error) {
    console.error("API Get Posts Error:", error);
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { title, content, userId, orgId } = await request.json();

    if (!title || !title.trim()) {
      return NextResponse.json({ error: "Post title is required" }, { status: 400 });
    }
    if (!content || !content.trim()) {
      return NextResponse.json({ error: "Post content is required" }, { status: 400 });
    }
    if (!userId || !orgId) {
      return NextResponse.json({ error: "User ID and Organization ID are required" }, { status: 400 });
    }

    await initDb();

    const [newPost] = await sql`
      INSERT INTO posts (title, content, user_id, organisation_id)
      VALUES (${title.trim()}, ${content.trim()}, ${userId}, ${orgId})
      RETURNING id, title, content, created_at;
    `;

    return NextResponse.json({
      message: "Post published successfully",
      post: newPost
    }, { status: 201 });

  } catch (error) {
    console.error("API Create Post Error:", error);
    return NextResponse.json({ error: "Failed to publish post" }, { status: 500 });
  }
}
