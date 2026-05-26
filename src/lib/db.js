import postgres from "postgres";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set in environment variables.");
}

// Initialize default connection pool
const sql = postgres(databaseUrl, {
  ssl: "require",
  max: 10,
});

// Helper to ensure all tables exist
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

    // 2. Create projects table
    await sql`
      CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY,
        organisation_id INTEGER REFERENCES organisations(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        postgres_connection TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 3. Create users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(500) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Alter table users to ensure it has organisation_id and role columns
    await sql`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS organisation_id INTEGER REFERENCES organisations(id) ON DELETE SET NULL;
    `;
    await sql`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'member';
    `;

    // 4. Create endpoints table
    await sql`
      CREATE TABLE IF NOT EXISTS endpoints (
        id SERIAL PRIMARY KEY,
        organisation_id INTEGER REFERENCES organisations(id) ON DELETE CASCADE,
        project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        method VARCHAR(10) DEFAULT 'GET',
        path VARCHAR(255) NOT NULL,
        configuration JSONB DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Alter table endpoints to ensure it has project_id column
    await sql`
      ALTER TABLE endpoints ADD COLUMN IF NOT EXISTS project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE;
    `;

    // 5. Create posts table
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
