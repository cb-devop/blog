import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
  url: "file:./prisma/dev.db",
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = "admin@premiumblog.com";
  const password = "Admin@123";
  const name = "Admin User";

  // Check if admin already exists
  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    console.log("✅ Admin user already exists: " + email);
    return;
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 12);

  // Create admin user
  const user = await prisma.user.create({
    data: {
      email,
      name,
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  console.log("✅ Admin user created successfully!");
  console.log("   Email:    " + user.email);
  console.log("   Password: " + password);
  console.log("   Role:     " + user.role);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
