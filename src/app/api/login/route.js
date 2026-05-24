import { NextResponse } from "next/server";
import sql, { initDb } from "@/lib/db";
import { verifyPassword } from "@/lib/auth-utils";

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    // 1. Basic validation
    if (!email || !email.trim()) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }
    if (!password) {
      return NextResponse.json({ error: "Password is required" }, { status: 400 });
    }

    // 2. Ensure db tables exist
    await initDb();

    const normalizedEmail = email.trim().toLowerCase();

    // 3. Search for user by email and join organization details
    const users = await sql`
      SELECT u.id, u.name, u.email, u.password, u.role, u.organisation_id, o.name as organisation_name 
      FROM users u
      LEFT JOIN organisations o ON u.organisation_id = o.id
      WHERE u.email = ${normalizedEmail} LIMIT 1;
    `;

    if (users.length === 0) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const user = users[0];

    // 4. Verify password
    const isPasswordValid = verifyPassword(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    // 5. Successful login response
    return NextResponse.json({
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        organisationId: user.organisation_id,
        organisationName: user.organisation_name || "Personal Workspace"
      }
    }, { status: 200 });

  } catch (error) {
    console.error("API Login Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
