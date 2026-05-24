import { NextResponse } from "next/server";
import sql, { initDb } from "@/lib/db";
import { hashPassword } from "@/lib/auth-utils";

export async function POST(request) {
  try {
    const { name, email, password, orgAction, orgName, orgId } = await request.json();

    // 1. Basic user validation
    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    if (!email || !email.trim() || !email.includes("@")) {
      return NextResponse.json({ error: "A valid email address is required" }, { status: 400 });
    }
    if (!password || password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters long" }, { status: 400 });
    }

    // 2. Validate organization details
    if (orgAction !== "create" && orgAction !== "join") {
      return NextResponse.json({ error: "Please specify if you want to create or join an organization" }, { status: 400 });
    }

    await initDb();
    const normalizedEmail = email.trim().toLowerCase();

    // 3. Ensure email doesn't already exist
    const existingUsers = await sql`
      SELECT id FROM users WHERE email = ${normalizedEmail} LIMIT 1;
    `;
    if (existingUsers.length > 0) {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
    }

    let targetOrgId = null;
    let userRole = "member";

    // 4. Handle organization creation or association
    if (orgAction === "create") {
      if (!orgName || !orgName.trim() || orgName.trim().length < 2) {
        return NextResponse.json({ error: "A valid organization name of at least 2 characters is required" }, { status: 400 });
      }

      // Check if organisation name is taken
      const existingOrgs = await sql`
        SELECT id FROM organisations WHERE name = ${orgName.trim()} LIMIT 1;
      `;
      if (existingOrgs.length > 0) {
        return NextResponse.json({ error: "An organization with this name already exists" }, { status: 409 });
      }

      // Insert organization
      const [newOrg] = await sql`
        INSERT INTO organisations (name)
        VALUES (${orgName.trim()})
        RETURNING id;
      `;
      targetOrgId = newOrg.id;
      userRole = "admin"; // Creator is the Super User (admin)

    } else if (orgAction === "join") {
      if (!orgId) {
        return NextResponse.json({ error: "Please select an organization to join" }, { status: 400 });
      }

      // Verify organization exists
      const orgs = await sql`
        SELECT id FROM organisations WHERE id = ${orgId} LIMIT 1;
      `;
      if (orgs.length === 0) {
        return NextResponse.json({ error: "The selected organization does not exist" }, { status: 404 });
      }
      targetOrgId = orgs[0].id;
      userRole = "member"; // Joining users are default members
    }

    // 5. Hash password & insert user record
    const hashedPassword = hashPassword(password);
    const [newUser] = await sql`
      INSERT INTO users (name, email, password, role, organisation_id)
      VALUES (${name.trim()}, ${normalizedEmail}, ${hashedPassword}, ${userRole}, ${targetOrgId})
      RETURNING id, name, email, role, organisation_id;
    `;

    return NextResponse.json({
      message: "Account created successfully",
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        organisationId: newUser.organisation_id,
      }
    }, { status: 201 });

  } catch (error) {
    console.error("API Signup Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
