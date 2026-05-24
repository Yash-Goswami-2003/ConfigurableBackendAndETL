import postgres from "postgres";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set in environment variables.");
}

// Initialize the postgres client. Neon requires SSL, so we make sure the connection parameters are passed appropriately.
const sql = postgres(databaseUrl, {
  ssl: "require",
  max: 10, // Max connection pool count
});

// Helper to ensure the organizations, users, endpoints, and posts tables exist
export async function initDb() {
  try {
    // 1. Create organisations table
    await sql`
      CREATE TABLE IF NOT EXISTS organisations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 2. Create users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(500) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Alter table users to ensure it has organisation_id and role columns (handles migration if users table existed)
    await sql`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS organisation_id INTEGER REFERENCES organisations(id) ON DELETE SET NULL;
    `;
    await sql`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'member';
    `;

    // 3. Create endpoints table
    await sql`
      CREATE TABLE IF NOT EXISTS endpoints (
        id SERIAL PRIMARY KEY,
        organisation_id INTEGER REFERENCES organisations(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        method VARCHAR(10) DEFAULT 'GET',
        path VARCHAR(255) NOT NULL,
        configuration JSONB DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 4. Create posts table
    await sql`
      CREATE TABLE IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY,
        organisation_id INTEGER REFERENCES organisations(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
  } catch (error) {
    console.error("Failed to initialize Weave database tables:", error);
    throw error;
  }
}

export default sql;
