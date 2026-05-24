import { NextResponse } from "next/server";
import sql, { initDb } from "@/lib/db";
import { hashPassword } from "@/lib/auth-utils";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get("orgId");

    if (!orgId) {
      return NextResponse.json({ error: "Organization ID is required" }, { status: 400 });
    }

    await initDb();
    const members = await sql`
      SELECT id, name, email, role, created_at 
      FROM users 
      WHERE organisation_id = ${orgId} 
      ORDER BY role ASC, name ASC;
    `;

    return NextResponse.json({ members }, { status: 200 });
  } catch (error) {
    console.error("API Get Members Error:", error);
    return NextResponse.json({ error: "Failed to fetch members" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { name, email, password, orgId, adminUserId } = await request.json();

    if (!name || !name.trim() || !email || !email.trim() || !password) {
      return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 });
    }
    if (!orgId || !adminUserId) {
      return NextResponse.json({ error: "Organization credentials are required" }, { status: 400 });
    }

    await initDb();

    // 1. Verify that the requesting user is indeed an admin of this organization
    const admins = await sql`
      SELECT id FROM users WHERE id = ${adminUserId} AND organisation_id = ${orgId} AND role = 'admin' LIMIT 1;
    `;
    if (admins.length === 0) {
      return NextResponse.json({ error: "Unauthorized. Super User admin permissions required." }, { status: 403 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // 2. Check if email is already taken
    const existingUsers = await sql`
      SELECT id FROM users WHERE email = ${normalizedEmail} LIMIT 1;
    `;
    if (existingUsers.length > 0) {
      return NextResponse.json({ error: "A user account with this email already exists" }, { status: 409 });
    }

    // 3. Hash password and insert user as a member
    const hashedPassword = hashPassword(password);
    const [newMember] = await sql`
      INSERT INTO users (name, email, password, role, organisation_id)
      VALUES (${name.trim()}, ${normalizedEmail}, ${hashedPassword}, 'member', ${orgId})
      RETURNING id, name, email, role, created_at;
    `;

    return NextResponse.json({
      message: "Member added successfully",
      member: newMember
    }, { status: 201 });

  } catch (error) {
    console.error("API Create Member Error:", error);
    return NextResponse.json({ error: "Failed to add member" }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get("memberId");
    const adminUserId = searchParams.get("adminUserId");
    const orgId = searchParams.get("orgId");

    if (!memberId || !adminUserId || !orgId) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    await initDb();

    // 1. Verify requesting user is admin of this organization
    const admins = await sql`
      SELECT id FROM users WHERE id = ${adminUserId} AND organisation_id = ${orgId} AND role = 'admin' LIMIT 1;
    `;
    if (admins.length === 0) {
      return NextResponse.json({ error: "Unauthorized. Admin permissions required." }, { status: 403 });
    }

    // 2. Prevent self-deletion
    if (memberId === adminUserId) {
      return NextResponse.json({ error: "Admins cannot delete their own accounts" }, { status: 400 });
    }

    // 3. Delete member
    await sql`
      DELETE FROM users WHERE id = ${memberId} AND organisation_id = ${orgId};
    `;

    return NextResponse.json({ message: "Member account deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("API Delete Member Error:", error);
    return NextResponse.json({ error: "Failed to delete member" }, { status: 500 });
  }
}
