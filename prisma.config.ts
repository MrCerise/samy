import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "src/libs/prisma/schema.prisma",
  migrations: {
    path: "src/libs/prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
