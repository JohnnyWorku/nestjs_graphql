import "dotenv/config";
import { defineConfig, env } from "@prisma/config"; // Ensure the @ is there

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  // engine: "classic", <-- Remove this line
  datasource: {
    url: env("DATABASE_URL"),
  },
});