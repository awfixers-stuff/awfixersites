import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.AUTH_DATABASE_URL ?? process.env.AUTH_PRISMA_DATABASE_URL,
  },
});
