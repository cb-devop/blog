import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import * as path from "path";
import * as fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, "..", "prisma", "dev.db");

async function main() {
  // Ensure directory exists
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Check if DB already exists and has admin
  const dbExists = fs.existsSync(DB_PATH);
  if (dbExists) {
    const existingDb = new Database(DB_PATH);
    const tables = existingDb
      .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='User'")
      .get();
    if (tables) {
      const admin = existingDb
        .prepare("SELECT id FROM User WHERE email = ?")
        .get("admin@premiumblog.com") as any;
      if (admin) {
        console.log(`✅ Admin user already exists: admin@premiumblog.com`);
        existingDb.close();
        return;
      }
    }
    existingDb.close();
  }

  // Create fresh database
  if (dbExists) fs.unlinkSync(DB_PATH);
  const db = new Database(DB_PATH);

  // Enable WAL mode for better performance
  db.pragma("journal_mode = WAL");

  // Create tables
  db.exec(`
    CREATE TABLE "User" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "email" TEXT NOT NULL UNIQUE,
      "name" TEXT,
      "password" TEXT NOT NULL,
      "role" TEXT NOT NULL DEFAULT 'EDITOR',
      "avatar" TEXT,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE "Post" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "title" TEXT NOT NULL,
      "slug" TEXT NOT NULL UNIQUE,
      "content" TEXT NOT NULL,
      "excerpt" TEXT,
      "featuredImg" TEXT,
      "status" TEXT NOT NULL DEFAULT 'DRAFT',
      "views" INTEGER NOT NULL DEFAULT 0,
      "authorId" TEXT NOT NULL,
      "seoTitle" TEXT,
      "seoDesc" TEXT,
      "seoKeywords" TEXT,
      "ogImage" TEXT,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
    );

    CREATE TABLE "Category" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "name" TEXT NOT NULL UNIQUE,
      "slug" TEXT NOT NULL UNIQUE,
      "description" TEXT,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE "Tag" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "name" TEXT NOT NULL UNIQUE,
      "slug" TEXT NOT NULL UNIQUE,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE "Subscriber" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "email" TEXT NOT NULL UNIQUE,
      "name" TEXT,
      "isActive" BOOLEAN NOT NULL DEFAULT 1,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE "_CategoryToPost" (
      "A" TEXT NOT NULL,
      "B" TEXT NOT NULL,
      FOREIGN KEY ("A") REFERENCES "Category"("id") ON DELETE CASCADE,
      FOREIGN KEY ("B") REFERENCES "Post"("id") ON DELETE CASCADE,
      PRIMARY KEY ("A", "B")
    );

    CREATE TABLE "_TagToPost" (
      "A" TEXT NOT NULL,
      "B" TEXT NOT NULL,
      FOREIGN KEY ("A") REFERENCES "Tag"("id") ON DELETE CASCADE,
      FOREIGN KEY ("B") REFERENCES "Post"("id") ON DELETE CASCADE,
      PRIMARY KEY ("A", "B")
    );
  `);

  // Hash password and create admin user
  const hashedPassword = await bcrypt.hash("Admin@123", 12);
  const id = "admin_" + Date.now();

  db.prepare(
    `INSERT INTO "User" (id, email, name, password, role, "createdAt", "updatedAt")
     VALUES (?, ?, ?, ?, 'ADMIN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`
  ).run(id, "admin@premiumblog.com", "Admin User", hashedPassword);

  console.log(`✅ Database created successfully at: ${DB_PATH}`);
  console.log(`✅ Admin user created: admin@premiumblog.com / Admin@123`);

  db.close();
}

main().catch((e) => {
  console.error("❌ Setup failed:", e);
  process.exit(1);
});