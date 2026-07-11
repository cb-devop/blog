import { Pool } from "pg";
import bcrypt from "bcryptjs";

async function main() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || "postgresql://postgres:password@localhost:5432/premiumblog?schema=public",
  });

  const email = "admin@premiumblog.com";
  const password = "Admin@123";
  const name = "Admin User";

  // Check if admin already exists
  const existing = await pool.query("SELECT id FROM \"User\" WHERE email = $1", [email]);

  if (existing.rows.length > 0) {
    console.log(`✅ Admin user already exists: ${email}`);
    await pool.end();
    return;
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 12);

  // Create admin user
  const result = await pool.query(
    `INSERT INTO "User" (id, email, name, password, role, "createdAt", "updatedAt") 
     VALUES (gen_random_uuid()::text, $1, $2, $3, 'ADMIN', NOW(), NOW()) 
     RETURNING id, email, name, role`,
    [email, name, hashedPassword]
  );

  const user = result.rows[0];

  console.log(`✅ Admin user created successfully!`);
  console.log(`   Email:    ${email}`);
  console.log(`   Password: ${password}`);
  console.log(`   Role:     ${user.role}`);

  await pool.end();
}

main().catch((e) => {
  console.error("❌ Seed failed:", e);
  process.exit(1);
});