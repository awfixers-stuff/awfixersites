import { shield } from "@awfixersites/security/arcjet/next";
import { createAppArcjet } from "@awfixersites/security/client";

export const arcjet = createAppArcjet({
  rules: [shield({ mode: "DRY_RUN" })],
});
