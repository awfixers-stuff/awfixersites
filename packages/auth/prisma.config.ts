import { getAuthDatabaseUrl } from "@awfixersites/env";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: getAuthDatabaseUrl(),
  },
});
