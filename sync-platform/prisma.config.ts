import "dotenv/config";
import { defineConfig, env } from "@prisma/config"; // Ensure the @ is there

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },

  datasource: {
    url: env("DATABASE_URL"),
  },
});