import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url:
      process.env.DATABASE_URL ?? process.env.ENLIST_DATABASE_URL ?? process.env.AUTH_DATABASE_URL,
  },
});
