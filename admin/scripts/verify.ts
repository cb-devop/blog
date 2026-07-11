import Database from "better-sqlite3";
import * as path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, "..", "prisma", "dev.db");
const db = new Database(DB_PATH);

const user = db.prepare("SELECT id, email, name, role, password FROM User").get() as any;

if (user) {
  console.log("✅ User found in database:");
  console.log(`   ID:    ${user.id}`);
  console.log(`   Email: ${user.email}`);
  console.log(`   Name:  ${user.name}`);
  console.log(`   Role:  ${user.role}`);
  
  // Verify password hash
  const valid = bcrypt.compareSync("Admin@123", user.password);
  console.log(`   Password valid: ${valid ? "✅ YES" : "❌ NO"}`);
} else {
  console.log("❌ No user found in database");
}

db.close();