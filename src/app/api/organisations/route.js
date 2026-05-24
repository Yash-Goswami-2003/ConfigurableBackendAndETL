import { NextResponse } from "next/server";
import sql, { initDb } from "@/lib/db";

export async function GET() {
  try {
    await initDb();
    const organisations = await sql`
      SELECT id, name FROM organisations ORDER BY name ASC;
    `;
    return NextResponse.json({ organisations }, { status: 200 });
  } catch (error) {
    console.error("API Fetch Organisations Error:", error);
    return NextResponse.json({ error: "Failed to load organisations" }, { status: 500 });
  }
}
