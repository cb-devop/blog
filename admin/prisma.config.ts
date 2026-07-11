import path from "node:path";
import type { PrismaConfig } from "prisma";

export default {
  schema: path.join(__dirname, "prisma/schema.prisma"),
  datasource: {
    url: "file:./prisma/dev.db",
  },
} satisfies PrismaConfig;
